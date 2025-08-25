import { appConfig } from '@/config/app.config';

export interface CodeReviewResult {
  score: number;
  suggestions: CodeSuggestion[];
  issues: CodeIssue[];
  improvements: CodeImprovement[];
  security: SecurityAnalysis;
  performance: PerformanceAnalysis;
}

export interface CodeSuggestion {
  type: 'style' | 'performance' | 'security' | 'best-practice' | 'readability';
  message: string;
  line?: number;
  code?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'syntax' | 'logic' | 'security' | 'performance';
}

export interface CodeImprovement {
  type: 'refactor' | 'optimization' | 'modernization';
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  code: string;
  improvedCode: string;
}

export interface SecurityAnalysis {
  vulnerabilities: SecurityVulnerability[];
  riskScore: number;
  recommendations: string[];
}

export interface SecurityVulnerability {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  fix: string;
}

export interface PerformanceAnalysis {
  bottlenecks: PerformanceBottleneck[];
  score: number;
  suggestions: string[];
}

export interface PerformanceBottleneck {
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  line: number;
  optimization: string;
}

export class AICodeReviewer {
  private async callAI(prompt: string, code: string): Promise<any> {
    const response = await fetch('/api/ai/code-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, code })
    });
    return response.json();
  }

  async reviewCode(code: string, language: string): Promise<CodeReviewResult> {
    const prompt = `Analyze this ${language} code for:
    1. Code quality and best practices
    2. Performance optimizations
    3. Security vulnerabilities
    4. Readability and maintainability
    5. Modern language features that could be used
    6. Potential bugs or issues
    
    Provide specific suggestions with line numbers and code examples.`;

    const result = await this.callAI(prompt, code);
    return this.parseReviewResult(result);
  }

  async suggestRefactoring(code: string, language: string): Promise<CodeImprovement[]> {
    const prompt = `Suggest refactoring improvements for this ${language} code:
    1. Extract methods/functions
    2. Simplify complex logic
    3. Improve naming conventions
    4. Reduce code duplication
    5. Apply design patterns where appropriate`;

    const result = await this.callAI(prompt, code);
    return result.improvements || [];
  }

  async analyzeSecurity(code: string, language: string): Promise<SecurityAnalysis> {
    const prompt = `Analyze this ${language} code for security vulnerabilities:
    1. SQL injection
    2. XSS attacks
    3. Authentication issues
    4. Authorization problems
    5. Input validation
    6. Secure coding practices`;

    const result = await this.callAI(prompt, code);
    return result.security || { vulnerabilities: [], riskScore: 0, recommendations: [] };
  }

  async optimizePerformance(code: string, language: string): Promise<PerformanceAnalysis> {
    const prompt = `Analyze this ${language} code for performance issues:
    1. Algorithm efficiency
    2. Memory usage
    3. Database queries
    4. Network calls
    5. Caching opportunities
    6. Resource management`;

    const result = await this.callAI(prompt, code);
    return result.performance || { bottlenecks: [], score: 0, suggestions: [] };
  }

  private parseReviewResult(result: any): CodeReviewResult {
    return {
      score: result.score || 0,
      suggestions: result.suggestions || [],
      issues: result.issues || [],
      improvements: result.improvements || [],
      security: result.security || { vulnerabilities: [], riskScore: 0, recommendations: [] },
      performance: result.performance || { bottlenecks: [], score: 0, suggestions: [] }
    };
  }
}

export const codeReviewer = new AICodeReviewer();
