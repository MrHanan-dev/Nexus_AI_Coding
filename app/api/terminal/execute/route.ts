import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 });
    }

    // Security: Only allow safe commands
    const allowedCommands = [
      'npm install',
      'npm run dev',
      'npm start',
      'npm build',
      'git status',
      'git add',
      'git commit',
      'git push',
      'git pull',
      'node --version',
      'npm --version',
      'dir',
      'ls',
      'cd',
      'pwd'
    ];

    const isAllowed = allowedCommands.some(allowed => 
      command.toLowerCase().startsWith(allowed.toLowerCase())
    );

    if (!isAllowed) {
      return NextResponse.json({ 
        error: `Command not allowed: ${command}. Allowed commands: ${allowedCommands.join(', ')}` 
      }, { status: 403 });
    }

    // Execute the command
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(), // Execute in current working directory
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    const output = stdout || stderr || 'Command executed successfully';
    
    return NextResponse.json({ 
      output,
      success: true,
      command 
    });

  } catch (error) {
    console.error('Terminal execution error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        success: false 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Unknown error occurred',
      success: false 
    }, { status: 500 });
  }
}
