export interface DebugIssue {
  id: string;
  type: 'error' | 'warning' | 'performance' | 'security' | 'logic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    file: string;
    line: number;
    column: number;
    code: string;
  };
  rootCause: string;
  suggestedFix: string;
  confidence: number;
  relatedIssues?: string[];
  impact: string;
  category: string;
}

export interface DebugSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  issues: DebugIssue[];
  resolvedIssues: DebugIssue[];
  performance: {
    totalIssues: number;
    resolvedCount: number;
    averageResolutionTime: number;
    accuracy: number;
  };
  context: {
    projectType: string;
    language: string;
    framework?: string;
    dependencies: string[];
  };
}

export interface ErrorPattern {
  id: string;
  pattern: string;
  regex: RegExp;
  category: string;
  commonCauses: string[];
  solutions: string[];
  frequency: number;
}

export interface PerformanceIssue {
  id: string;
  type: 'memory-leak' | 'slow-render' | 'expensive-calculation' | 'network-request' | 'bundle-size';
  metric: string;
  threshold: number;
  currentValue: number;
  impact: string;
  optimization: string;
}

export class SmartDebugger {
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private debugSessions: Map<string, DebugSession> = new Map();
  private performanceBaselines: Map<string, number> = new Map();

  constructor() {
    this.initializeErrorPatterns();
  }

  private initializeErrorPatterns() {
    // React/TypeScript patterns
    this.addErrorPattern({
      id: 'react-hook-deps',
      pattern: 'React Hook useEffect has missing dependencies',
      regex: /React Hook useEffect has missing dependencies/,
      category: 'react',
      commonCauses: ['Missing dependencies in useEffect', 'Incorrect dependency array'],
      solutions: [
        'Add missing dependencies to the dependency array',
        'Use useCallback for functions in dependencies',
        'Use useMemo for objects in dependencies'
      ],
      frequency: 0.8
    });

    this.addErrorPattern({
      id: 'react-key-prop',
      pattern: 'Each child in a list should have a unique "key" prop',
      regex: /Each child in a list should have a unique "key" prop/,
      category: 'react',
      commonCauses: ['Missing key prop in map function', 'Using index as key'],
      solutions: [
        'Add unique key prop to each mapped element',
        'Use stable IDs instead of array indices',
        'Use React.Fragment with key for complex elements'
      ],
      frequency: 0.9
    });

    this.addErrorPattern({
      id: 'typescript-type-error',
      pattern: 'Type \'X\' is not assignable to type \'Y\'',
      regex: /Type '.*' is not assignable to type '.*'/,
      category: 'typescript',
      commonCauses: ['Type mismatch', 'Incorrect interface definition', 'Missing type annotation'],
      solutions: [
        'Check type definitions and ensure compatibility',
        'Add proper type annotations',
        'Use type assertions where appropriate'
      ],
      frequency: 0.7
    });

    this.addErrorPattern({
      id: 'undefined-variable',
      pattern: '\'X\' is not defined',
      regex: /'[^']*' is not defined/,
      category: 'javascript',
      commonCauses: ['Variable not declared', 'Import missing', 'Scope issue'],
      solutions: [
        'Declare the variable before use',
        'Check import statements',
        'Verify variable scope'
      ],
      frequency: 0.6
    });

    this.addErrorPattern({
      id: 'async-await-error',
      pattern: 'await is only valid in async functions',
      regex: /await is only valid in async functions/,
      category: 'javascript',
      commonCauses: ['Missing async keyword', 'Using await in non-async function'],
      solutions: [
        'Add async keyword to function declaration',
        'Use .then() instead of await',
        'Wrap in async IIFE'
      ],
      frequency: 0.5
    });
  }

  private addErrorPattern(pattern: ErrorPattern) {
    this.errorPatterns.set(pattern.id, pattern);
  }

  async analyzeCode(code: string, filePath: string, language: string): Promise<DebugIssue[]> {
    const issues: DebugIssue[] = [];
    
    // Analyze for common patterns
    const patternIssues = this.analyzeErrorPatterns(code, filePath, language);
    issues.push(...patternIssues);
    
    // Analyze for performance issues
    const performanceIssues = this.analyzePerformanceIssues(code, filePath, language);
    issues.push(...performanceIssues);
    
    // Analyze for security issues
    const securityIssues = this.analyzeSecurityIssues(code, filePath, language);
    issues.push(...securityIssues);
    
    // Analyze for logic issues
    const logicIssues = this.analyzeLogicIssues(code, filePath, language);
    issues.push(...logicIssues);
    
    return issues.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity));
  }

  private analyzeErrorPatterns(code: string, filePath: string, language: string): DebugIssue[] {
    const issues: DebugIssue[] = [];
    const lines = code.split('\n');
    
    for (const [id, pattern] of this.errorPatterns) {
      if (pattern.category === language || pattern.category === 'javascript') {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (pattern.regex.test(line)) {
            issues.push({
              id: `${id}-${i}`,
              type: 'error',
              severity: 'high',
              title: pattern.pattern,
              description: `Detected ${pattern.pattern} on line ${i + 1}`,
              location: {
                file: filePath,
                line: i + 1,
                column: 1,
                code: line.trim()
              },
              rootCause: pattern.commonCauses[0] || 'Unknown cause',
              suggestedFix: pattern.solutions[0] || 'Review the code for potential issues',
              confidence: pattern.frequency,
              category: pattern.category,
              impact: 'This may cause runtime errors or unexpected behavior'
            });
          }
        }
      }
    }
    
    return issues;
  }

  private analyzePerformanceIssues(code: string, filePath: string, language: string): DebugIssue[] {
    const issues: DebugIssue[] = [];
    const lines = code.split('\n');
    
    // Check for expensive operations in render
    if (language === 'typescript' || language === 'javascript') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for map/filter/reduce without memoization
        if (line.includes('.map(') || line.includes('.filter(') || line.includes('.reduce(')) {
          if (line.includes('useMemo') || line.includes('useCallback')) continue;
          
          issues.push({
            id: `performance-array-${i}`,
            type: 'performance',
            severity: 'medium',
            title: 'Expensive array operation in render',
            description: `Array operation detected on line ${i + 1} that may cause performance issues`,
            location: {
              file: filePath,
              line: i + 1,
              column: 1,
              code: line.trim()
            },
            rootCause: 'Array operations are recalculated on every render',
            suggestedFix: 'Wrap the operation in useMemo to cache the result',
            confidence: 0.8,
            category: 'performance',
            impact: 'May cause unnecessary re-renders and performance degradation'
          });
        }
        
        // Check for inline object creation
        if (line.includes('style={{') || line.includes('={{')) {
          issues.push({
            id: `performance-inline-${i}`,
            type: 'performance',
            severity: 'low',
            title: 'Inline object creation in render',
            description: `Inline object detected on line ${i + 1}`,
            location: {
              file: filePath,
              line: i + 1,
              column: 1,
              code: line.trim()
            },
            rootCause: 'Objects are recreated on every render',
            suggestedFix: 'Move object creation outside component or use useMemo',
            confidence: 0.7,
            category: 'performance',
            impact: 'May cause unnecessary re-renders of child components'
          });
        }
      }
    }
    
    return issues;
  }

  private analyzeSecurityIssues(code: string, filePath: string, language: string): DebugIssue[] {
    const issues: DebugIssue[] = [];
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for XSS vulnerabilities
      if (line.includes('dangerouslySetInnerHTML')) {
        issues.push({
          id: `security-xss-${i}`,
          type: 'security',
          severity: 'high',
          title: 'Potential XSS vulnerability',
          description: `dangerouslySetInnerHTML used on line ${i + 1}`,
          location: {
            file: filePath,
            line: i + 1,
            column: 1,
            code: line.trim()
          },
          rootCause: 'Using dangerouslySetInnerHTML without proper sanitization',
          suggestedFix: 'Sanitize HTML content or use safer alternatives like DOMPurify',
          confidence: 0.9,
          category: 'security',
          impact: 'May allow malicious script injection'
        });
      }
      
      // Check for SQL injection (if applicable)
      if (line.includes('query(') && line.includes('${') && !line.includes('parameterized')) {
        issues.push({
          id: `security-sql-${i}`,
          type: 'security',
          severity: 'critical',
          title: 'Potential SQL injection vulnerability',
          description: `Dynamic SQL query detected on line ${i + 1}`,
          location: {
            file: filePath,
            line: i + 1,
            column: 1,
            code: line.trim()
          },
          rootCause: 'Using string interpolation in SQL queries',
          suggestedFix: 'Use parameterized queries or prepared statements',
          confidence: 0.95,
          category: 'security',
          impact: 'May allow unauthorized database access'
        });
      }
    }
    
    return issues;
  }

  private analyzeLogicIssues(code: string, filePath: string, language: string): DebugIssue[] {
    const issues: DebugIssue[] = [];
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for infinite loops
      if (line.includes('while(true)') || line.includes('for(;;)')) {
        issues.push({
          id: `logic-infinite-${i}`,
          type: 'logic',
          severity: 'critical',
          title: 'Potential infinite loop',
          description: `Infinite loop detected on line ${i + 1}`,
          location: {
            file: filePath,
            line: i + 1,
            column: 1,
            code: line.trim()
          },
          rootCause: 'Loop condition that never becomes false',
          suggestedFix: 'Add proper exit condition or break statement',
          confidence: 0.9,
          category: 'logic',
          impact: 'Will cause application to hang indefinitely'
        });
      }
      
      // Check for unreachable code
      if (line.includes('return') && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine.trim() && !nextLine.trim().startsWith('//') && !nextLine.trim().startsWith('/*')) {
          issues.push({
            id: `logic-unreachable-${i}`,
            type: 'logic',
            severity: 'medium',
            title: 'Unreachable code detected',
            description: `Code after return statement on line ${i + 1}`,
            location: {
              file: filePath,
              line: i + 2,
              column: 1,
              code: nextLine.trim()
            },
            rootCause: 'Code placed after return statement',
            suggestedFix: 'Move code before return or add conditional logic',
            confidence: 0.8,
            category: 'logic',
            impact: 'Code will never execute, may indicate logic error'
          });
        }
      }
    }
    
    return issues;
  }

  private getSeverityScore(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  async suggestFix(issue: DebugIssue): Promise<string> {
    // Generate contextual fix based on issue type and code
    switch (issue.type) {
      case 'error':
        return this.generateErrorFix(issue);
      case 'performance':
        return this.generatePerformanceFix(issue);
      case 'security':
        return this.generateSecurityFix(issue);
      case 'logic':
        return this.generateLogicFix(issue);
      default:
        return issue.suggestedFix;
    }
  }

  private generateErrorFix(issue: DebugIssue): string {
    const { location, rootCause } = issue;
    
    if (rootCause.includes('missing dependencies')) {
      return `// Fix: Add missing dependencies to useEffect
useEffect(() => {
  // Your effect code here
}, [dependency1, dependency2]); // Add all used variables here`;
    }
    
    if (rootCause.includes('key prop')) {
      return `// Fix: Add unique key prop
{items.map((item, index) => (
  <div key={item.id || index}>
    {item.content}
  </div>
))}`;
    }
    
    return issue.suggestedFix;
  }

  private generatePerformanceFix(issue: DebugIssue): string {
    const { location, rootCause } = issue;
    
    if (rootCause.includes('array operations')) {
      return `// Fix: Memoize expensive array operations
const memoizedResult = useMemo(() => {
  return items.map(item => expensiveOperation(item));
}, [items]);`;
    }
    
    if (rootCause.includes('inline object')) {
      return `// Fix: Move object outside component or memoize
const styles = useMemo(() => ({
  backgroundColor: 'red',
  padding: '10px'
}), []);`;
    }
    
    return issue.suggestedFix;
  }

  private generateSecurityFix(issue: DebugIssue): string {
    const { location, rootCause } = issue;
    
    if (rootCause.includes('XSS')) {
      return `// Fix: Sanitize HTML content
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />`;
    }
    
    if (rootCause.includes('SQL injection')) {
      return `// Fix: Use parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
const result = await db.query(query, [userId]);`;
    }
    
    return issue.suggestedFix;
  }

  private generateLogicFix(issue: DebugIssue): string {
    const { location, rootCause } = issue;
    
    if (rootCause.includes('infinite loop')) {
      return `// Fix: Add proper exit condition
while (condition) {
  // Your loop code here
  if (exitCondition) break;
}`;
    }
    
    if (rootCause.includes('unreachable code')) {
      return `// Fix: Move code before return or add condition
if (condition) {
  // Your code here
}
return result;`;
    }
    
    return issue.suggestedFix;
  }

  createDebugSession(projectType: string, language: string, framework?: string): string {
    const sessionId = `debug-${Date.now()}`;
    const session: DebugSession = {
      id: sessionId,
      startTime: new Date(),
      issues: [],
      resolvedIssues: [],
      performance: {
        totalIssues: 0,
        resolvedCount: 0,
        averageResolutionTime: 0,
        accuracy: 0
      },
      context: {
        projectType,
        language,
        framework,
        dependencies: []
      }
    };
    
    this.debugSessions.set(sessionId, session);
    return sessionId;
  }

  resolveIssue(sessionId: string, issueId: string): boolean {
    const session = this.debugSessions.get(sessionId);
    if (!session) return false;
    
    const issue = session.issues.find(i => i.id === issueId);
    if (!issue) return false;
    
    session.resolvedIssues.push(issue);
    session.issues = session.issues.filter(i => i.id !== issueId);
    
    this.updateSessionPerformance(session);
    return true;
  }

  private updateSessionPerformance(session: DebugSession) {
    session.performance.totalIssues = session.issues.length + session.resolvedIssues.length;
    session.performance.resolvedCount = session.resolvedIssues.length;
    
    if (session.resolvedIssues.length > 0) {
      const totalTime = session.resolvedIssues.reduce((sum, issue) => {
        // Calculate resolution time (simplified)
        return sum + 5; // Assume 5 minutes average
      }, 0);
      session.performance.averageResolutionTime = totalTime / session.resolvedIssues.length;
    }
    
    session.performance.accuracy = session.resolvedIssues.length / session.performance.totalIssues;
  }

  getDebugStats(): {
    totalSessions: number;
    totalIssues: number;
    resolvedIssues: number;
    averageAccuracy: number;
    mostCommonIssues: string[];
  } {
    const sessions = Array.from(this.debugSessions.values());
    const totalIssues = sessions.reduce((sum, session) => sum + session.performance.totalIssues, 0);
    const resolvedIssues = sessions.reduce((sum, session) => sum + session.performance.resolvedCount, 0);
    const averageAccuracy = sessions.reduce((sum, session) => sum + session.performance.accuracy, 0) / sessions.length;
    
    // Get most common issues
    const issueTypes = new Map<string, number>();
    sessions.forEach(session => {
      session.issues.forEach(issue => {
        issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
      });
    });
    
    const mostCommonIssues = Array.from(issueTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type);
    
    return {
      totalSessions: sessions.length,
      totalIssues,
      resolvedIssues,
      averageAccuracy,
      mostCommonIssues
    };
  }
}
