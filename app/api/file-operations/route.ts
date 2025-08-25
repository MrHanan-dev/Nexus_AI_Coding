import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'create-new-file':
        return await createNewFile(params);
      case 'create-new-folder':
        return await createNewFolder(params);
      case 'read-system-files':
        return await readSystemFiles(params);
      case 'write-system-file':
        return await writeSystemFile(params);
      case 'delete-system-file':
        return await deleteSystemFile(params);
      case 'get-system-info':
        return await getSystemInfo();
      case 'open-native-folder':
        return await openNativeFolder(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[file-operations] Error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

async function createNewFile(params: { name: string; content?: string; directory?: string }) {
  try {
    const { name, content = '', directory = process.cwd() } = params;
    const filePath = path.join(directory, name);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Create file
    await fs.writeFile(filePath, content, 'utf8');
    
    return NextResponse.json({
      success: true,
      filePath,
      message: `File "${name}" created successfully`
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create file: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

async function createNewFolder(params: { name: string; directory?: string }) {
  try {
    const { name, directory = process.cwd() } = params;
    const folderPath = path.join(directory, name);
    
    await fs.mkdir(folderPath, { recursive: true });
    
    return NextResponse.json({
      success: true,
      folderPath,
      message: `Folder "${name}" created successfully`
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create folder: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

async function readSystemFiles(params: { directory?: string; recursive?: boolean }) {
  try {
    const { directory = process.cwd(), recursive = false } = params;
    
    const readDirectory = async (dir: string, depth = 0): Promise<any[]> => {
      if (depth > 3) return []; // Prevent infinite recursion
      
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const items = [];
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(directory, fullPath);
        
        if (entry.isDirectory()) {
          const item = {
            name: entry.name,
            path: relativePath,
            type: 'folder',
            children: recursive ? await readDirectory(fullPath, depth + 1) : undefined
          };
          items.push(item);
        } else {
          const stats = await fs.stat(fullPath);
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            extension: path.extname(entry.name).slice(1)
          });
        }
      }
      
      return items;
    };
    
    const files = await readDirectory(directory);
    
    return NextResponse.json({
      success: true,
      directory,
      files
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to read directory: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

async function writeSystemFile(params: { filePath: string; content: string }) {
  try {
    const { filePath, content } = params;
    
    // Security check - only allow files in project directory or temp directory
    const projectDir = process.cwd();
    const tempDir = os.tmpdir();
    const resolvedPath = path.resolve(filePath);
    
    if (!resolvedPath.startsWith(projectDir) && !resolvedPath.startsWith(tempDir)) {
      return NextResponse.json(
        { error: 'Access denied: File path outside allowed directories' },
        { status: 403 }
      );
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    
    // Write file
    await fs.writeFile(resolvedPath, content, 'utf8');
    
    return NextResponse.json({
      success: true,
      filePath: resolvedPath,
      message: 'File saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to write file: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

async function deleteSystemFile(params: { filePath: string }) {
  try {
    const { filePath } = params;
    
    // Security check
    const projectDir = process.cwd();
    const resolvedPath = path.resolve(filePath);
    
    if (!resolvedPath.startsWith(projectDir)) {
      return NextResponse.json(
        { error: 'Access denied: Cannot delete files outside project directory' },
        { status: 403 }
      );
    }
    
    const stats = await fs.stat(resolvedPath);
    
    if (stats.isDirectory()) {
      await fs.rmdir(resolvedPath, { recursive: true });
    } else {
      await fs.unlink(resolvedPath);
    }
    
    return NextResponse.json({
      success: true,
      message: `${stats.isDirectory() ? 'Folder' : 'File'} deleted successfully`
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

async function getSystemInfo() {
  try {
    const info = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      homeDir: os.homedir(),
      tmpDir: os.tmpdir(),
      currentDir: process.cwd(),
      freeMem: os.freemem(),
      totalMem: os.totalmem(),
      uptime: os.uptime()
    };
    
    return NextResponse.json({
      success: true,
      systemInfo: info
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get system info: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

async function openNativeFolder(params: { folderPath?: string }) {
  try {
    const { folderPath = process.cwd() } = params;
    const { exec } = await import('child_process');
    
    let command = '';
    const platform = os.platform();
    
    switch (platform) {
      case 'win32':
        command = `explorer "${folderPath}"`;
        break;
      case 'darwin':
        command = `open "${folderPath}"`;
        break;
      case 'linux':
        command = `xdg-open "${folderPath}"`;
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    exec(command, (error: any) => {
      if (error) {
        console.error('Failed to open folder:', error);
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Folder opened in system explorer'
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to open folder: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'get-system-info':
        return await getSystemInfo();
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[file-operations] GET Error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
