export interface CodeAnalysisResult {
  structure: FileStructure;
  dependencies: DependencyInfo;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  complexity: ComplexityMetrics;
}

export interface FileStructure {
  files: FileInfo[];
  folders: FolderInfo[];
  totalLines: number;
  languageStats: Record<string, number>;
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  lines: number;
  language: string;
  imports: string[];
  exports: string[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
  lastModified: Date;
}

export interface FolderInfo {
  path: string;
  name: string;
  files: number;
  subfolders: number;
  totalSize: number;
}

export interface FunctionInfo {
  name: string;
  line: number;
  parameters: string[];
  returnType?: string;
  complexity: number;
}

export interface ClassInfo {
  name: string;
  line: number;
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  extends?: string;
  implements?: string[];
}

export interface PropertyInfo {
  name: string;
  type: string;
  line: number;
  isPrivate: boolean;
}

export interface DependencyInfo {
  packages: PackageInfo[];
  imports: ImportInfo[];
  missing: string[];
  outdated: string[];
}

export interface PackageInfo {
  name: string;
  version: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  description?: string;
  homepage?: string;
}

export interface ImportInfo {
  module: string;
  imports: string[];
  file: string;
  line: number;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

export interface CodeSuggestion {
  type: 'performance' | 'security' | 'best-practice' | 'refactor';
  message: string;
  file: string;
  line?: number;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
}

export class CodeAnalyzer {
  private files: Record<string, string> = {};
  private structure: FileStructure = { files: [], folders: [], totalLines: 0, languageStats: {} };

  constructor(files: Record<string, string> = {}) {
    this.files = files;
    this.analyzeStructure();
  }

  public updateFiles(files: Record<string, string>) {
    this.files = files;
    this.analyzeStructure();
  }

  public getFullAnalysis(): CodeAnalysisResult {
    return {
      structure: this.structure,
      dependencies: this.analyzeDependencies(),
      issues: this.findIssues(),
      suggestions: this.generateSuggestions(),
      complexity: this.calculateComplexity()
    };
  }

  public getFileStructure(): FileStructure {
    return this.structure;
  }

  public getFileContent(path: string): string | null {
    return this.files[path] || null;
  }

  public searchFiles(query: string): FileInfo[] {
    const results: FileInfo[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const file of this.structure.files) {
      if (file.name.toLowerCase().includes(lowerQuery) || 
          file.path.toLowerCase().includes(lowerQuery)) {
        results.push(file);
      }
    }
    
    return results;
  }

  public findReferences(symbol: string): Array<{ file: string; line: number; context: string }> {
    const references: Array<{ file: string; line: number; context: string }> = [];
    
    for (const [filePath, content] of Object.entries(this.files)) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(symbol)) {
          references.push({
            file: filePath,
            line: i + 1,
            context: lines[i].trim()
          });
        }
      }
    }
    
    return references;
  }

  public getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    for (const file of this.structure.files) {
      if (file.imports.length > 0) {
        graph[file.path] = file.imports;
      }
    }
    
    return graph;
  }

  private analyzeStructure() {
    const files: FileInfo[] = [];
    const folders = new Map<string, FolderInfo>();
    const languageStats: Record<string, number> = {};
    let totalLines = 0;

    for (const [path, content] of Object.entries(this.files)) {
      const fileInfo = this.parseFile(path, content);
      files.push(fileInfo);
      
      // Update language stats
      languageStats[fileInfo.language] = (languageStats[fileInfo.language] || 0) + 1;
      totalLines += fileInfo.lines;
      
      // Update folder info
      const folderPath = this.getFolderPath(path);
      if (!folders.has(folderPath)) {
        folders.set(folderPath, {
          path: folderPath,
          name: this.getFolderName(folderPath),
          files: 0,
          subfolders: 0,
          totalSize: 0
        });
      }
      
      const folder = folders.get(folderPath)!;
      folder.files++;
      folder.totalSize += fileInfo.size;
    }

    this.structure = {
      files,
      folders: Array.from(folders.values()),
      totalLines,
      languageStats
    };
  }

  private parseFile(path: string, content: string): FileInfo {
    const name = this.getFileName(path);
    const extension = this.getFileExtension(path);
    const language = this.detectLanguage(extension, content);
    const lines = content.split('\n');
    
    return {
      path,
      name,
      extension,
      size: content.length,
      lines: lines.length,
      language,
      imports: this.extractImports(content, language),
      exports: this.extractExports(content, language),
      functions: this.extractFunctions(content, language),
      classes: this.extractClasses(content, language),
      lastModified: new Date()
    };
  }

  private detectLanguage(extension: string, content: string): string {
    const languageMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.jsx': 'React',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'Sass',
      '.less': 'Less',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.sql': 'SQL',
      '.sh': 'Shell',
      '.ps1': 'PowerShell',
      '.bat': 'Batch',
      '.dockerfile': 'Dockerfile',
      '.gitignore': 'Git Ignore',
      '.env': 'Environment',
      '.config': 'Configuration'
    };
    
    return languageMap[extension.toLowerCase()] || 'Unknown';
  }

  private extractImports(content: string, language: string): string[] {
    const imports: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // JavaScript/TypeScript imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
        const match = trimmed.match(/from\s+['"`]([^'"`]+)['"`]/);
        if (match) {
          imports.push(match[1]);
        }
      }
      
      // Python imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        const match = trimmed.match(/(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/);
        if (match) {
          imports.push(match[1]);
        }
      }
      
      // CSS imports
      if (trimmed.startsWith('@import ')) {
        const match = trimmed.match(/@import\s+['"`]([^'"`]+)['"`]/);
        if (match) {
          imports.push(match[1]);
        }
      }
    }
    
    return imports;
  }

  private extractExports(content: string, language: string): string[] {
    const exports: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // JavaScript/TypeScript exports
      if (trimmed.startsWith('export ')) {
        const match = trimmed.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          exports.push(match[1]);
        }
      }
      
      // Python exports (convention)
      if (trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
        const match = trimmed.match(/(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          exports.push(match[1]);
        }
      }
    }
    
    return exports;
  }

  private extractFunctions(content: string, language: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // JavaScript/TypeScript functions
      if (line.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_][a-zA-Z0-9]*)/)) {
        const match = line.match(/^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          functions.push({
            name: match[1],
            line: i + 1,
            parameters: this.extractParameters(line),
            complexity: this.calculateFunctionComplexity(content, i)
          });
        }
      }
      
      // Arrow functions
      if (line.match(/^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9]*)\s*=\s*(?:async\s+)?\(/)) {
        const match = line.match(/^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          functions.push({
            name: match[1],
            line: i + 1,
            parameters: this.extractParameters(line),
            complexity: this.calculateFunctionComplexity(content, i)
          });
        }
      }
      
      // Python functions
      if (line.match(/^def\s+([a-zA-Z_][a-zA-Z0-9]*)/)) {
        const match = line.match(/^def\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          functions.push({
            name: match[1],
            line: i + 1,
            parameters: this.extractParameters(line),
            complexity: this.calculateFunctionComplexity(content, i)
          });
        }
      }
    }
    
    return functions;
  }

  private extractClasses(content: string, language: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // JavaScript/TypeScript classes
      if (line.match(/^(?:export\s+)?class\s+([a-zA-Z_][a-zA-Z0-9]*)/)) {
        const match = line.match(/^(?:export\s+)?class\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          const className = match[1];
          const classInfo: ClassInfo = {
            name: className,
            line: i + 1,
            methods: [],
            properties: []
          };
          
          // Extract extends/implements
          const extendsMatch = line.match(/extends\s+([a-zA-Z_][a-zA-Z0-9]*)/);
          if (extendsMatch) {
            classInfo.extends = extendsMatch[1];
          }
          
          classes.push(classInfo);
        }
      }
      
      // Python classes
      if (line.match(/^class\s+([a-zA-Z_][a-zA-Z0-9]*)/)) {
        const match = line.match(/^class\s+([a-zA-Z_][a-zA-Z0-9]*)/);
        if (match) {
          classes.push({
            name: match[1],
            line: i + 1,
            methods: [],
            properties: []
          });
        }
      }
    }
    
    return classes;
  }

  private extractParameters(line: string): string[] {
    const paramMatch = line.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];
    
    return paramMatch[1]
      .split(',')
      .map(param => param.trim())
      .filter(param => param.length > 0);
  }

  private calculateFunctionComplexity(content: string, startLine: number): number {
    // Simple cyclomatic complexity calculation
    const lines = content.split('\n');
    let complexity = 1; // Base complexity
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Count decision points
      if (line.includes('if ') || line.includes('else if ') || line.includes('else')) complexity++;
      if (line.includes('for ') || line.includes('while ')) complexity++;
      if (line.includes('switch ') || line.includes('case ')) complexity++;
      if (line.includes('&&') || line.includes('||')) complexity++;
      
      // Stop at function end
      if (line === '}' || line.startsWith('def ') || line.startsWith('class ')) break;
    }
    
    return complexity;
  }

  private analyzeDependencies(): DependencyInfo {
    const packages: PackageInfo[] = [];
    const imports: ImportInfo[] = [];
    const missing: string[] = [];
    const outdated: string[] = [];
    
    // Analyze package.json if available
    const packageJson = this.files['package.json'];
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson);
        if (pkg.dependencies) {
          for (const [name, version] of Object.entries(pkg.dependencies)) {
            packages.push({
              name,
              version: version as string,
              type: 'dependencies'
            });
          }
        }
        if (pkg.devDependencies) {
          for (const [name, version] of Object.entries(pkg.devDependencies)) {
            packages.push({
              name,
              version: version as string,
              type: 'devDependencies'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }
    
    // Analyze imports
    for (const file of this.structure.files) {
      for (const importPath of file.imports) {
        imports.push({
          module: importPath,
          imports: [],
          file: file.path,
          line: 0
        });
      }
    }
    
    return { packages, imports, missing, outdated };
  }

  private findIssues(): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    for (const file of this.structure.files) {
      const content = this.files[file.path];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for common issues
        if (line.includes('console.log(') && !line.includes('// TODO: Remove')) {
          issues.push({
            type: 'warning',
            message: 'Console.log statement found - consider removing for production',
            file: file.path,
            line: i + 1,
            column: line.indexOf('console.log(') + 1,
            severity: 'low',
            fix: 'Remove or comment out console.log statement'
          });
        }
        
        if (line.includes('TODO:') || line.includes('FIXME:')) {
          issues.push({
            type: 'info',
            message: 'TODO/FIXME comment found',
            file: file.path,
            line: i + 1,
            column: line.indexOf('TODO:') + 1,
            severity: 'low'
          });
        }
        
        if (line.includes('password') && line.includes('=') && !line.includes('//')) {
          issues.push({
            type: 'warning',
            message: 'Potential hardcoded password detected',
            file: file.path,
            line: i + 1,
            column: line.indexOf('password') + 1,
            severity: 'medium',
            fix: 'Use environment variables for sensitive data'
          });
        }
      }
    }
    
    return issues;
  }

  private generateSuggestions(): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    
    for (const file of this.structure.files) {
      const content = this.files[file.path];
      const lines = content.split('\n');
      
      // Check for performance suggestions
      if (file.language === 'React' && content.includes('useEffect(')) {
        const useEffectCount = (content.match(/useEffect\(/g) || []).length;
        if (useEffectCount > 5) {
          suggestions.push({
            type: 'performance',
            message: 'Multiple useEffect hooks detected - consider consolidating',
            file: file.path,
            suggestion: 'Combine related useEffect hooks to reduce re-renders',
            impact: 'medium'
          });
        }
      }
      
      // Check for security suggestions
      if (content.includes('innerHTML') && !content.includes('DOMPurify')) {
        suggestions.push({
          type: 'security',
          message: 'innerHTML usage detected without sanitization',
          file: file.path,
          suggestion: 'Use DOMPurify or similar library to sanitize HTML content',
          impact: 'high'
        });
      }
    }
    
    return suggestions;
  }

  private calculateComplexity(): ComplexityMetrics {
    let cyclomaticComplexity = 0;
    let cognitiveComplexity = 0;
    let maintainabilityIndex = 0;
    let technicalDebt = 0;
    
    for (const file of this.structure.files) {
      cyclomaticComplexity += file.functions.reduce((sum, func) => sum + func.complexity, 0);
      
      // Calculate maintainability index (simplified)
      const halsteadVolume = file.lines * Math.log2(file.functions.length + 1);
      maintainabilityIndex += Math.max(0, 171 - 5.2 * Math.log(halsteadVolume));
      
      // Calculate technical debt (simplified)
      technicalDebt += file.functions.length * 0.5; // 0.5 days per function
    }
    
    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      maintainabilityIndex,
      technicalDebt
    };
  }

  private getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  private getFileExtension(path: string): string {
    const fileName = this.getFileName(path);
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  }

  private getFolderPath(path: string): string {
    const parts = path.split('/');
    parts.pop(); // Remove filename
    return parts.join('/') || '/';
  }

  private getFolderName(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || 'root';
  }
}
