export interface CodePrediction {
  id: string;
  suggestion: string;
  confidence: number;
  context: string;
  type: 'completion' | 'refactor' | 'optimization' | 'pattern';
  language: string;
  framework?: string;
  explanation: string;
  alternatives?: string[];
}

export interface PredictionContext {
  currentCode: string;
  cursorPosition: number;
  fileType: string;
  projectContext: string;
  userHistory: string[];
  commonPatterns: string[];
  imports: string[];
  dependencies: string[];
}

export interface UserPattern {
  id: string;
  pattern: string;
  frequency: number;
  successRate: number;
  context: string;
  language: string;
  timestamp: Date;
}

export interface PredictionModel {
  id: string;
  name: string;
  language: string;
  framework?: string;
  accuracy: number;
  lastUpdated: Date;
  trainingData: string[];
}

export class AICodePredictor {
  private userPatterns: Map<string, UserPattern> = new Map();
  private predictionModels: Map<string, PredictionModel> = new Map();
  private contextHistory: PredictionContext[] = [];

  constructor() {
    this.initializeDefaultModels();
  }

  private initializeDefaultModels() {
    // React/TypeScript patterns
    this.predictionModels.set('react-ts', {
      id: 'react-ts',
      name: 'React TypeScript Predictor',
      language: 'typescript',
      framework: 'react',
      accuracy: 0.95,
      lastUpdated: new Date(),
      trainingData: [
        'useState', 'useEffect', 'useCallback', 'useMemo',
        'React.FC', 'interface Props', 'const Component',
        'export default', 'import React', 'styled-components'
      ]
    });

    // Node.js patterns
    this.predictionModels.set('node-js', {
      id: 'node-js',
      name: 'Node.js Predictor',
      language: 'javascript',
      framework: 'node',
      accuracy: 0.92,
      lastUpdated: new Date(),
      trainingData: [
        'async function', 'await', 'Promise', 'try-catch',
        'express.Router', 'middleware', 'req.body', 'res.json'
      ]
    });

    // Python patterns
    this.predictionModels.set('python', {
      id: 'python',
      name: 'Python Predictor',
      language: 'python',
      accuracy: 0.94,
      lastUpdated: new Date(),
      trainingData: [
        'def function', 'class Class', 'import', 'from',
        'try-except', 'with open', 'list comprehension'
      ]
    });
  }

  async predictCode(context: PredictionContext): Promise<CodePrediction[]> {
    const predictions: CodePrediction[] = [];
    
    // Analyze current context
    const analysis = this.analyzeContext(context);
    
    // Generate predictions based on context
    const completionPrediction = await this.generateCompletionPrediction(context, analysis);
    if (completionPrediction) predictions.push(completionPrediction);
    
    const refactorPrediction = await this.generateRefactorPrediction(context, analysis);
    if (refactorPrediction) predictions.push(refactorPrediction);
    
    const optimizationPrediction = await this.generateOptimizationPrediction(context, analysis);
    if (optimizationPrediction) predictions.push(optimizationPrediction);
    
    const patternPrediction = await this.generatePatternPrediction(context, analysis);
    if (patternPrediction) predictions.push(patternPrediction);
    
    // Sort by confidence
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeContext(context: PredictionContext) {
    const lines = context.currentCode.split('\n');
    const currentLine = lines[Math.floor(context.cursorPosition / 80)] || '';
    const previousLines = lines.slice(Math.max(0, lines.length - 5));
    
    return {
      currentLine,
      previousLines,
      hasImports: context.imports.length > 0,
      hasDependencies: context.dependencies.length > 0,
      isInFunction: this.isInFunction(context.currentCode, context.cursorPosition),
      isInClass: this.isInClass(context.currentCode, context.cursorPosition),
      isInJSX: this.isInJSX(context.currentCode, context.cursorPosition),
      language: context.fileType
    };
  }

  private isInFunction(code: string, position: number): boolean {
    const beforeCursor = code.substring(0, position);
    const functionMatches = beforeCursor.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|=>\s*{/g);
    const braceCount = (beforeCursor.match(/{/g) || []).length - (beforeCursor.match(/}/g) || []).length;
    return !!(functionMatches && functionMatches.length > 0 && braceCount > 0);
  }

  private isInClass(code: string, position: number): boolean {
    const beforeCursor = code.substring(0, position);
    const classMatches = beforeCursor.match(/class\s+\w+/g);
    const braceCount = (beforeCursor.match(/{/g) || []).length - (beforeCursor.match(/}/g) || []).length;
    return !!(classMatches && classMatches.length > 0 && braceCount > 0);
  }

  private isInJSX(code: string, position: number): boolean {
    const beforeCursor = code.substring(0, position);
    return beforeCursor.includes('<') && beforeCursor.includes('>');
  }

  private async generateCompletionPrediction(context: PredictionContext, analysis: any): Promise<CodePrediction | null> {
    const model = this.predictionModels.get(analysis.language);
    if (!model) return null;

    // Generate completion based on current line
    let suggestion = '';
    let confidence = 0.8;

    if (analysis.isInJSX) {
      suggestion = this.generateJSXCompletion(analysis.currentLine);
      confidence = 0.9;
    } else if (analysis.isInFunction) {
      suggestion = this.generateFunctionCompletion(analysis.currentLine);
      confidence = 0.85;
    } else if (analysis.currentLine.includes('import')) {
      suggestion = this.generateImportCompletion(analysis.currentLine, context.imports);
      confidence = 0.95;
    } else {
      suggestion = this.generateGeneralCompletion(analysis.currentLine, model);
      confidence = 0.75;
    }

    if (!suggestion) return null;

    return {
      id: `completion-${Date.now()}`,
      suggestion,
      confidence,
      context: analysis.currentLine,
      type: 'completion',
      language: analysis.language,
      framework: model.framework,
      explanation: `Auto-completing ${analysis.currentLine.trim()}`,
      alternatives: this.generateAlternatives(suggestion, model)
    };
  }

  private generateJSXCompletion(currentLine: string): string {
    if (currentLine.includes('onClick')) return 'onClick={() => {}}';
    if (currentLine.includes('className')) return 'className=""';
    if (currentLine.includes('style')) return 'style={{}}';
    if (currentLine.includes('<div')) return '</div>';
    if (currentLine.includes('<span')) return '</span>';
    if (currentLine.includes('<button')) return '</button>';
    return '';
  }

  private generateFunctionCompletion(currentLine: string): string {
    if (currentLine.includes('useState')) return 'useState<Type>(initialValue)';
    if (currentLine.includes('useEffect')) return 'useEffect(() => {}, [])';
    if (currentLine.includes('useCallback')) return 'useCallback(() => {}, [])';
    if (currentLine.includes('useMemo')) return 'useMemo(() => {}, [])';
    if (currentLine.includes('async')) return 'await ';
    if (currentLine.includes('try')) return 'catch (error) { console.error(error); }';
    return '';
  }

  private generateImportCompletion(currentLine: string, imports: string[]): string {
    const commonImports = [
      'React', 'useState', 'useEffect', 'useCallback', 'useMemo',
      'axios', 'lodash', 'moment', 'date-fns', 'clsx'
    ];
    
    for (const imp of commonImports) {
      if (!imports.includes(imp) && !currentLine.includes(imp)) {
        return imp;
      }
    }
    return '';
  }

  private generateGeneralCompletion(currentLine: string, model: PredictionModel): string {
    const patterns = model.trainingData;
    for (const pattern of patterns) {
      if (!currentLine.includes(pattern)) {
        return pattern;
      }
    }
    return '';
  }

  private generateAlternatives(suggestion: string, model: PredictionModel): string[] {
    return model.trainingData
      .filter(pattern => pattern !== suggestion)
      .slice(0, 3);
  }

  private async generateRefactorPrediction(context: PredictionContext, analysis: any): Promise<CodePrediction | null> {
    // Look for refactoring opportunities
    const refactorOpportunities = this.findRefactorOpportunities(context.currentCode);
    
    if (refactorOpportunities.length === 0) return null;

    const bestOpportunity = refactorOpportunities[0];
    
    return {
      id: `refactor-${Date.now()}`,
      suggestion: bestOpportunity.suggestion,
      confidence: bestOpportunity.confidence,
      context: context.currentCode,
      type: 'refactor',
      language: analysis.language,
      explanation: bestOpportunity.explanation
    };
  }

  private findRefactorOpportunities(code: string): Array<{suggestion: string, confidence: number, explanation: string}> {
    const opportunities = [];
    
    // Check for repeated code
    if (code.includes('console.log') && (code.match(/console\.log/g) || []).length > 3) {
      opportunities.push({
        suggestion: 'Create a logger utility function',
        confidence: 0.9,
        explanation: 'Multiple console.log statements detected. Consider creating a centralized logging utility.'
      });
    }
    
    // Check for long functions
    const lines = code.split('\n');
    if (lines.length > 50) {
      opportunities.push({
        suggestion: 'Break down into smaller functions',
        confidence: 0.85,
        explanation: 'Function is quite long. Consider breaking it into smaller, more focused functions.'
      });
    }
    
    // Check for inline styles
    if (code.includes('style={{') && (code.match(/style=\{\{/g) || []).length > 2) {
      opportunities.push({
        suggestion: 'Extract styles to styled-components or CSS modules',
        confidence: 0.8,
        explanation: 'Multiple inline styles detected. Consider extracting to styled-components or CSS modules.'
      });
    }
    
    return opportunities;
  }

  private async generateOptimizationPrediction(context: PredictionContext, analysis: any): Promise<CodePrediction | null> {
    const optimizations = this.findOptimizationOpportunities(context.currentCode);
    
    if (optimizations.length === 0) return null;

    const bestOptimization = optimizations[0];
    
    return {
      id: `optimization-${Date.now()}`,
      suggestion: bestOptimization.suggestion,
      confidence: bestOptimization.confidence,
      context: context.currentCode,
      type: 'optimization',
      language: analysis.language,
      explanation: bestOptimization.explanation
    };
  }

  private findOptimizationOpportunities(code: string): Array<{suggestion: string, confidence: number, explanation: string}> {
    const opportunities = [];
    
    // Check for unnecessary re-renders
    if (code.includes('useState') && code.includes('useEffect') && !code.includes('useCallback')) {
      opportunities.push({
        suggestion: 'Add useCallback for function optimization',
        confidence: 0.9,
        explanation: 'Functions in useEffect dependencies should be wrapped with useCallback to prevent unnecessary re-renders.'
      });
    }
    
    // Check for expensive calculations
    if (code.includes('map') && code.includes('filter') && code.includes('reduce')) {
      opportunities.push({
        suggestion: 'Use useMemo for expensive calculations',
        confidence: 0.85,
        explanation: 'Complex array operations detected. Consider using useMemo to cache the result.'
      });
    }
    
    // Check for missing dependencies
    if (code.includes('useEffect') && code.includes('[]')) {
      opportunities.push({
        suggestion: 'Review useEffect dependencies',
        confidence: 0.8,
        explanation: 'Empty dependency array detected. Ensure all used variables are included in dependencies.'
      });
    }
    
    return opportunities;
  }

  private async generatePatternPrediction(context: PredictionContext, analysis: any): Promise<CodePrediction | null> {
    const patterns = this.findCommonPatterns(context.currentCode, context.userHistory);
    
    if (patterns.length === 0) return null;

    const bestPattern = patterns[0];
    
    return {
      id: `pattern-${Date.now()}`,
      suggestion: bestPattern.suggestion,
      confidence: bestPattern.confidence,
      context: context.currentCode,
      type: 'pattern',
      language: analysis.language,
      explanation: bestPattern.explanation
    };
  }

  private findCommonPatterns(code: string, userHistory: string[]): Array<{suggestion: string, confidence: number, explanation: string}> {
    const patterns = [];
    
    // Check for common React patterns
    if (code.includes('useState') && !code.includes('useReducer')) {
      patterns.push({
        suggestion: 'Consider useReducer for complex state',
        confidence: 0.75,
        explanation: 'Multiple useState calls detected. Consider using useReducer for complex state management.'
      });
    }
    
    // Check for error handling patterns
    if (code.includes('fetch') && !code.includes('try-catch')) {
      patterns.push({
        suggestion: 'Add error handling for API calls',
        confidence: 0.9,
        explanation: 'API calls detected without error handling. Consider adding try-catch blocks.'
      });
    }
    
    // Check for loading states
    if (code.includes('useState') && code.includes('data') && !code.includes('loading')) {
      patterns.push({
        suggestion: 'Add loading state management',
        confidence: 0.8,
        explanation: 'Data fetching detected without loading state. Consider adding loading state management.'
      });
    }
    
    return patterns;
  }

  updateUserPattern(pattern: UserPattern) {
    this.userPatterns.set(pattern.id, pattern);
    this.updatePredictionModels();
  }

  private updatePredictionModels() {
    // Update model accuracy based on user patterns
    for (const [id, model] of this.predictionModels) {
      const userPatternsForModel = Array.from(this.userPatterns.values())
        .filter(pattern => pattern.language === model.language);
      
      if (userPatternsForModel.length > 0) {
        const avgSuccessRate = userPatternsForModel.reduce((sum, p) => sum + p.successRate, 0) / userPatternsForModel.length;
        model.accuracy = (model.accuracy + avgSuccessRate) / 2;
        model.lastUpdated = new Date();
      }
    }
  }

  getPredictionStats() {
    return {
      totalPredictions: this.contextHistory.length,
      userPatterns: this.userPatterns.size,
      models: Array.from(this.predictionModels.values()),
      averageAccuracy: Array.from(this.predictionModels.values())
        .reduce((sum, model) => sum + model.accuracy, 0) / this.predictionModels.size
    };
  }
}
