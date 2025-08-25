export interface CodeMetrics {
  id: string;
  filePath: string;
  language: string;
  timestamp: Date;
  metrics: {
    linesOfCode: number;
    commentLines: number;
    blankLines: number;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    technicalDebt: number;
    codeDuplication: number;
    testCoverage: number;
    performanceScore: number;
    securityScore: number;
  };
  quality: {
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issues: number;
    warnings: number;
    suggestions: number;
  };
  complexity: {
    functions: number;
    classes: number;
    averageFunctionLength: number;
    maxFunctionLength: number;
    nestedLevels: number;
  };
}

export interface ProjectAnalytics {
  id: string;
  projectName: string;
  lastUpdated: Date;
  overallMetrics: {
    totalFiles: number;
    totalLines: number;
    averageComplexity: number;
    overallGrade: string;
    technicalDebt: number;
    estimatedRefactoringTime: number;
  };
  languageBreakdown: Map<string, {
    files: number;
    lines: number;
    complexity: number;
    grade: string;
  }>;
  trends: {
    daily: CodeMetrics[];
    weekly: CodeMetrics[];
    monthly: CodeMetrics[];
  };
  insights: AnalyticsInsight[];
}

export interface AnalyticsInsight {
  id: string;
  type: 'performance' | 'quality' | 'complexity' | 'security' | 'maintainability';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendation: string;
  confidence: number;
  timestamp: Date;
}

export interface CodePattern {
  id: string;
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  category: string;
  description: string;
}

export interface DeveloperMetrics {
  id: string;
  developerId: string;
  period: {
    start: Date;
    end: Date;
  };
  productivity: {
    linesAdded: number;
    linesRemoved: number;
    filesModified: number;
    commits: number;
    averageCommitSize: number;
  };
  quality: {
    bugsIntroduced: number;
    bugsFixed: number;
    codeReviewScore: number;
    testCoverage: number;
  };
  patterns: CodePattern[];
}

export class CodeAnalyticsEngine {
  private metrics: Map<string, CodeMetrics> = new Map();
  private projects: Map<string, ProjectAnalytics> = new Map();
  private developerMetrics: Map<string, DeveloperMetrics> = new Map();
  private insights: AnalyticsInsight[] = [];

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    // Initialize with default project
    const defaultProject: ProjectAnalytics = {
      id: 'default-project',
      projectName: 'Nexus AI',
      lastUpdated: new Date(),
      overallMetrics: {
        totalFiles: 0,
        totalLines: 0,
        averageComplexity: 0,
        overallGrade: 'A',
        technicalDebt: 0,
        estimatedRefactoringTime: 0
      },
      languageBreakdown: new Map(),
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      insights: []
    };
    
    this.projects.set('default-project', defaultProject);
  }

  async analyzeCode(code: string, filePath: string, language: string): Promise<CodeMetrics> {
    const metrics: CodeMetrics = {
      id: `${filePath}-${Date.now()}`,
      filePath,
      language,
      timestamp: new Date(),
      metrics: await this.calculateMetrics(code, language),
      quality: await this.assessQuality(code, language),
      complexity: await this.analyzeComplexity(code, language)
    };

    this.metrics.set(metrics.id, metrics);
    this.updateProjectAnalytics(metrics);
    await this.generateInsights(metrics);

    return metrics;
  }

  private async calculateMetrics(code: string, language: string) {
    const lines = code.split('\n');
    const linesOfCode = lines.length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*') ||
      line.trim().startsWith('#')
    ).length;
    const blankLines = lines.filter(line => line.trim() === '').length;
    
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(code, linesOfCode, cyclomaticComplexity);
    const technicalDebt = this.calculateTechnicalDebt(code, language);
    const codeDuplication = this.calculateCodeDuplication(code);
    const testCoverage = this.estimateTestCoverage(code, language);
    const performanceScore = this.calculatePerformanceScore(code, language);
    const securityScore = this.calculateSecurityScore(code, language);

    return {
      linesOfCode,
      commentLines,
      blankLines,
      cyclomaticComplexity,
      maintainabilityIndex,
      technicalDebt,
      codeDuplication,
      testCoverage,
      performanceScore,
      securityScore
    };
  }

  private calculateCyclomaticComplexity(code: string): number {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const decisionPatterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\|\|/g,
      /&&/g,
      /\?/g
    ];

    decisionPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private calculateMaintainabilityIndex(code: string, linesOfCode: number, cyclomaticComplexity: number): number {
    // Simplified maintainability index calculation
    const halsteadVolume = this.calculateHalsteadVolume(code);
    const commentRatio = this.getCommentRatio(code);
    
    // MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
    const maintainabilityIndex = 171 - 
      5.2 * Math.log(halsteadVolume) - 
      0.23 * cyclomaticComplexity - 
      16.2 * Math.log(linesOfCode) +
      (commentRatio * 10); // Bonus for good commenting

    return Math.max(0, Math.min(100, maintainabilityIndex));
  }

  private calculateHalsteadVolume(code: string): number {
    // Simplified Halstead volume calculation
    const operators = code.match(/[+\-*/=<>!&|^~%]|===|!==|<=|>=|&&|\|\||=>|\.|\(|\)|\[|\]|\{|\}|,|;|:|\.\.\./g) || [];
    const operands = code.match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+\.?\d*|"[^"]*"|'[^']*'/g) || [];
    
    const uniqueOperators = new Set(operators).size;
    const uniqueOperands = new Set(operands).size;
    const totalOperators = operators.length;
    const totalOperands = operands.length;
    
    return (totalOperators + totalOperands) * Math.log2(uniqueOperators + uniqueOperands);
  }

  private getCommentRatio(code: string): number {
    const lines = code.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*') ||
      line.trim().startsWith('#')
    ).length;
    
    return commentLines / lines.length;
  }

  private calculateTechnicalDebt(code: string, language: string): number {
    let debt = 0;
    
    // Code smells and anti-patterns
    const smells = [
      { pattern: /console\.log/g, weight: 1 },
      { pattern: /TODO|FIXME|HACK/g, weight: 2 },
      { pattern: /magic numbers/g, weight: 3 },
      { pattern: /duplicate code/g, weight: 5 },
      { pattern: /long function/g, weight: 4 }
    ];

    smells.forEach(smell => {
      const matches = code.match(smell.pattern);
      if (matches) {
        debt += matches.length * smell.weight;
      }
    });

    // Language-specific debt
    if (language === 'javascript' || language === 'typescript') {
      if (code.includes('any')) debt += 3;
      if (code.includes('eval(')) debt += 10;
      if (code.includes('innerHTML')) debt += 5;
    }

    return debt;
  }

  private calculateCodeDuplication(code: string): number {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const duplicates = new Set<string>();
    
    for (let i = 0; i < lines.length - 1; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[i].trim() === lines[j].trim()) {
          duplicates.add(lines[i].trim());
        }
      }
    }
    
    return (duplicates.size / lines.length) * 100;
  }

  private estimateTestCoverage(code: string, language: string): number {
    // Simplified test coverage estimation
    const lines = code.split('\n');
    const testFiles = lines.filter(line => 
      line.includes('test') || 
      line.includes('spec') || 
      line.includes('describe') || 
      line.includes('it(') ||
      line.includes('expect(')
    ).length;
    
    const totalLines = lines.length;
    return Math.min(100, (testFiles / totalLines) * 1000); // Simplified calculation
  }

  private calculatePerformanceScore(code: string, language: string): number {
    let score = 100;
    
    // Performance anti-patterns
    const antiPatterns = [
      { pattern: /\.map\(.*\.filter\(/g, penalty: 10 },
      { pattern: /\.filter\(.*\.map\(/g, penalty: 10 },
      { pattern: /for\s*\(\s*let\s+i\s*=\s*0/g, penalty: 5 },
      { pattern: /innerHTML/g, penalty: 15 },
      { pattern: /eval\(/g, penalty: 20 }
    ];

    antiPatterns.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        score -= matches.length * pattern.penalty;
      }
    });

    return Math.max(0, score);
  }

  private calculateSecurityScore(code: string, language: string): number {
    let score = 100;
    
    // Security vulnerabilities
    const vulnerabilities = [
      { pattern: /innerHTML/g, penalty: 20 },
      { pattern: /eval\(/g, penalty: 30 },
      { pattern: /dangerouslySetInnerHTML/g, penalty: 15 },
      { pattern: /sql.*\$\{/g, penalty: 25 },
      { pattern: /password.*=.*['"][^'"]*['"]/g, penalty: 20 }
    ];

    vulnerabilities.forEach(vuln => {
      const matches = code.match(vuln.pattern);
      if (matches) {
        score -= matches.length * vuln.penalty;
      }
    });

    return Math.max(0, score);
  }

  private async assessQuality(code: string, language: string) {
    const issues = await this.detectIssues(code, language);
    const warnings = await this.detectWarnings(code, language);
    const suggestions = await this.detectSuggestions(code, language);
    
    const totalIssues = issues + warnings + suggestions;
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    
    if (totalIssues === 0) grade = 'A';
    else if (totalIssues <= 5) grade = 'B';
    else if (totalIssues <= 10) grade = 'C';
    else if (totalIssues <= 20) grade = 'D';
    else grade = 'F';

    return {
      grade,
      issues,
      warnings,
      suggestions
    };
  }

  private async detectIssues(code: string, language: string): Promise<number> {
    let issues = 0;
    
    // Critical issues
    if (code.includes('eval(')) issues += 3;
    if (code.includes('innerHTML')) issues += 2;
    if (code.includes('TODO')) issues += 1;
    if (code.includes('FIXME')) issues += 2;
    
    return issues;
  }

  private async detectWarnings(code: string, language: string): Promise<number> {
    let warnings = 0;
    
    // Warnings
    if (code.includes('console.log')) warnings += 1;
    if (code.includes('any')) warnings += 1;
    if (code.includes('@ts-ignore')) warnings += 1;
    
    return warnings;
  }

  private async detectSuggestions(code: string, language: string): Promise<number> {
    let suggestions = 0;
    
    // Suggestions for improvement
    const lines = code.split('\n');
    if (lines.length > 100) suggestions += 1;
    if (this.calculateCyclomaticComplexity(code) > 10) suggestions += 1;
    
    return suggestions;
  }

  private async analyzeComplexity(code: string, language: string) {
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    
    const functionLengths = this.getFunctionLengths(code);
    const averageFunctionLength = functionLengths.length > 0 
      ? functionLengths.reduce((sum, len) => sum + len, 0) / functionLengths.length 
      : 0;
    const maxFunctionLength = functionLengths.length > 0 ? Math.max(...functionLengths) : 0;
    
    const nestedLevels = this.calculateNestedLevels(code);

    return {
      functions,
      classes,
      averageFunctionLength,
      maxFunctionLength,
      nestedLevels
    };
  }

  private getFunctionLengths(code: string): number[] {
    const lines = code.split('\n');
    const lengths: number[] = [];
    let currentFunctionLength = 0;
    let inFunction = false;
    let braceCount = 0;

    for (const line of lines) {
      if (line.includes('function') || line.includes('=>') || line.includes('const') && line.includes('=') && line.includes('(')) {
        if (inFunction && currentFunctionLength > 0) {
          lengths.push(currentFunctionLength);
        }
        inFunction = true;
        currentFunctionLength = 0;
        braceCount = 0;
      }

      if (inFunction) {
        currentFunctionLength++;
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0 && currentFunctionLength > 1) {
          lengths.push(currentFunctionLength);
          inFunction = false;
          currentFunctionLength = 0;
        }
      }
    }

    return lengths;
  }

  private calculateNestedLevels(code: string): number {
    const lines = code.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;

    for (const line of lines) {
      if (line.includes('{')) currentNesting++;
      if (line.includes('}')) currentNesting--;
      maxNesting = Math.max(maxNesting, currentNesting);
    }

    return maxNesting;
  }

  private updateProjectAnalytics(metrics: CodeMetrics) {
    const project = this.projects.get('default-project');
    if (!project) return;

    // Update overall metrics
    project.overallMetrics.totalFiles++;
    project.overallMetrics.totalLines += metrics.metrics.linesOfCode;
    project.overallMetrics.averageComplexity = 
      (project.overallMetrics.averageComplexity + metrics.metrics.cyclomaticComplexity) / 2;
    project.overallMetrics.technicalDebt += metrics.metrics.technicalDebt;

    // Update language breakdown
    const languageData = project.languageBreakdown.get(metrics.language) || {
      files: 0,
      lines: 0,
      complexity: 0,
      grade: 'A'
    };

    languageData.files++;
    languageData.lines += metrics.metrics.linesOfCode;
    languageData.complexity = (languageData.complexity + metrics.metrics.cyclomaticComplexity) / 2;
    languageData.grade = this.calculateGrade(metrics.quality);

    project.languageBreakdown.set(metrics.language, languageData);

    // Update trends
    project.trends.daily.push(metrics);
    if (project.trends.daily.length > 30) {
      project.trends.daily.shift();
    }

    project.lastUpdated = new Date();
  }

  private calculateGrade(quality: any): string {
    const totalIssues = quality.issues + quality.warnings + quality.suggestions;
    if (totalIssues === 0) return 'A';
    if (totalIssues <= 5) return 'B';
    if (totalIssues <= 10) return 'C';
    if (totalIssues <= 20) return 'D';
    return 'F';
  }

  private async generateInsights(metrics: CodeMetrics) {
    const insights: AnalyticsInsight[] = [];

    // Performance insights
    if (metrics.metrics.performanceScore < 70) {
      insights.push({
        id: `perf-${Date.now()}`,
        type: 'performance',
        title: 'Performance Optimization Needed',
        description: `Performance score is ${metrics.metrics.performanceScore}/100`,
        severity: 'medium',
        impact: 'May affect user experience and application speed',
        recommendation: 'Review and optimize performance-critical code sections',
        confidence: 0.8,
        timestamp: new Date()
      });
    }

    // Security insights
    if (metrics.metrics.securityScore < 80) {
      insights.push({
        id: `sec-${Date.now()}`,
        type: 'security',
        title: 'Security Vulnerabilities Detected',
        description: `Security score is ${metrics.metrics.securityScore}/100`,
        severity: 'high',
        impact: 'Potential security risks in the codebase',
        recommendation: 'Address security vulnerabilities immediately',
        confidence: 0.9,
        timestamp: new Date()
      });
    }

    // Complexity insights
    if ((metrics.complexity as any).cyclomaticComplexity > 10) {
      insights.push({
        id: `comp-${Date.now()}`,
        type: 'complexity',
        title: 'High Code Complexity',
        description: `Cyclomatic complexity is ${metrics.metrics.cyclomaticComplexity}`,
        severity: 'medium',
        impact: 'Code may be difficult to maintain and test',
        recommendation: 'Consider refactoring to reduce complexity',
        confidence: 0.7,
        timestamp: new Date()
      });
    }

    this.insights.push(...insights);
  }

  getProjectAnalytics(projectId: string = 'default-project'): ProjectAnalytics | null {
    return this.projects.get(projectId) || null;
  }

  getMetricsHistory(filePath: string): CodeMetrics[] {
    return Array.from(this.metrics.values())
      .filter(metric => metric.filePath === filePath)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getInsights(): AnalyticsInsight[] {
    return this.insights
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  getTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): CodeMetrics[] {
    const project = this.projects.get('default-project');
    if (!project) return [];
    
    return project.trends[period];
  }
}
