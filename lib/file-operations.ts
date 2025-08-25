// File Operations Library - Handles all file system operations like Cursor/VS Code

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  content?: string;
}

export interface WorkspaceSettings {
  folders: string[];
  settings: Record<string, any>;
  extensions: Record<string, any>;
}

export class FileOperations {
  private recentFiles: string[] = [];
  private maxRecentFiles = 10;

  // Recent Files Management
  addToRecentFiles(filePath: string) {
    this.recentFiles = this.recentFiles.filter(f => f !== filePath);
    this.recentFiles.unshift(filePath);
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles = this.recentFiles.slice(0, this.maxRecentFiles);
    }
    this.saveRecentFiles();
  }

  getRecentFiles(): string[] {
    return [...this.recentFiles];
  }

  clearRecentFiles() {
    this.recentFiles = [];
    this.saveRecentFiles();
  }

  private saveRecentFiles() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus-recent-files', JSON.stringify(this.recentFiles));
    }
  }

  private loadRecentFiles() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nexus-recent-files');
      if (stored) {
        this.recentFiles = JSON.parse(stored);
      }
    }
  }

  // File Dialog Operations
  async openFileDialog(): Promise<FileItem[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '*/*';
      
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const fileItems: FileItem[] = [];
        
        for (const file of files) {
          const content = await this.readFileContent(file);
          fileItems.push({
            name: file.name,
            path: file.name, // In browser, we don't have full paths
            type: 'file',
            size: file.size,
            lastModified: new Date(file.lastModified),
            content
          });
          this.addToRecentFiles(file.name);
        }
        
        resolve(fileItems);
      };
      
      input.click();
    });
  }

  async openFolderDialog(): Promise<FileItem[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      (input as any).webkitdirectory = true;
      input.multiple = true;
      
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const fileItems: FileItem[] = [];
        
        for (const file of files) {
          const content = await this.readFileContent(file);
          fileItems.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            type: 'file',
            size: file.size,
            lastModified: new Date(file.lastModified),
            content
          });
        }
        
        resolve(fileItems);
      };
      
      input.click();
    });
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Save Operations
  async saveFile(fileName: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.addToRecentFiles(fileName);
  }

  async saveAsFile(defaultName: string, content: string): Promise<string> {
    const fileName = prompt('Save as:', defaultName) || defaultName;
    await this.saveFile(fileName, content);
    return fileName;
  }

  // Workspace Operations
  async saveWorkspace(workspaceData: WorkspaceSettings) {
    const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workspace.code-workspace';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async openWorkspaceFile(): Promise<WorkspaceSettings | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.code-workspace,.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const content = await this.readFileContent(file);
            const workspace = JSON.parse(content) as WorkspaceSettings;
            resolve(workspace);
          } catch (error) {
            console.error('Failed to parse workspace file:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      
      input.click();
    });
  }

  // Export Operations
  async exportToZip(files: FileItem[], workspaceName: string) {
    // Simple ZIP creation (in a real implementation, you'd use a library like JSZip)
    const content = files.map(file => 
      `=== ${file.path} ===\n${file.content || ''}\n\n`
    ).join('');
    
    await this.saveFile(`${workspaceName}.txt`, content);
  }

  async shareViaGitHub(files: FileItem[], repoName: string) {
    // This would integrate with GitHub API
    console.log('Sharing to GitHub:', { files, repoName });
    // Implementation would depend on GitHub integration
  }

  async generateShareLink(files: FileItem[]): Promise<string> {
    // Generate a shareable link (would require backend implementation)
    const data = {
      files: files.map(f => ({ path: f.path, content: f.content })),
      timestamp: Date.now()
    };
    
    // In a real implementation, this would upload to a service
    const shareId = btoa(JSON.stringify(data)).slice(0, 10);
    return `https://nexus-ai.dev/share/${shareId}`;
  }

  // File System Utilities
  getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
  }

  getFileIcon(fileName: string): string {
    const ext = this.getFileExtension(fileName);
    const iconMap: Record<string, string> = {
      'js': '🟨',
      'ts': '🔷',
      'jsx': '⚛️',
      'tsx': '⚛️',
      'vue': '💚',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'cs': '🔵',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'json': '📋',
      'xml': '📄',
      'md': '📝',
      'txt': '📄',
      'pdf': '📕',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
    };
    
    return iconMap[ext] || '📄';
  }

  // Initialize the file operations
  constructor() {
    if (typeof window !== 'undefined') {
      this.loadRecentFiles();
    }
  }
}

// Global instance
export const fileOperations = new FileOperations();
