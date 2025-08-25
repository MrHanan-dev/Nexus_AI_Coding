export interface VoiceCommand {
  type: 'create' | 'modify' | 'delete' | 'navigate' | 'search' | 'debug' | 'deploy';
  action: string;
  target?: string;
  parameters?: Record<string, any>;
  confidence: number;
}

export interface VoiceCodeResult {
  success: boolean;
  code?: string;
  message: string;
  suggestions?: string[];
  executedCommands?: string[];
}

export interface VoiceTemplate {
  name: string;
  description: string;
  keywords: string[];
  code: string;
  language: string;
}

export class VoiceToCodeConverter {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private templates: VoiceTemplate[] = [];

  constructor() {
    this.initializeSpeechRecognition();
    this.loadTemplates();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }

    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private loadTemplates() {
    this.templates = [
      {
        name: 'React Component',
        description: 'Create a new React functional component',
        keywords: ['react component', 'create component', 'new component'],
        code: `import React from 'react';

interface Props {
  // Add your props here
}

export const ComponentName: React.FC<Props> = ({ }) => {
  return (
    <div>
      {/* Your component content */}
    </div>
  );
};`,
        language: 'typescript'
      },
      {
        name: 'API Route',
        description: 'Create a Next.js API route',
        keywords: ['api route', 'create api', 'endpoint'],
        code: `import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Handle GET request
    res.status(200).json({ message: 'Success' });
  } else if (req.method === 'POST') {
    // Handle POST request
    res.status(201).json({ message: 'Created' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}`,
        language: 'typescript'
      },
      {
        name: 'Database Query',
        description: 'Create a database query with error handling',
        keywords: ['database query', 'sql query', 'db query'],
        code: `try {
  const result = await db.query(
    'SELECT * FROM table_name WHERE condition = ?',
    [parameter]
  );
  return result.rows;
} catch (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch data');
}`,
        language: 'javascript'
      }
    ];
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      this.recognition!.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition!.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition!.start();
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  async processVoiceCommand(transcript: string): Promise<VoiceCodeResult> {
    const command = this.parseVoiceCommand(transcript);
    
    switch (command.type) {
      case 'create':
        return this.handleCreateCommand(command);
      case 'modify':
        return this.handleModifyCommand(command);
      case 'delete':
        return this.handleDeleteCommand(command);
      case 'navigate':
        return this.handleNavigateCommand(command);
      case 'search':
        return this.handleSearchCommand(command);
      case 'debug':
        return this.handleDebugCommand(command);
      case 'deploy':
        return this.handleDeployCommand(command);
      default:
        return {
          success: false,
          message: 'Unknown command type'
        };
    }
  }

  private parseVoiceCommand(transcript: string): VoiceCommand {
    const lowerTranscript = transcript.toLowerCase();
    
    // Template matching
    for (const template of this.templates) {
      if (template.keywords.some(keyword => lowerTranscript.includes(keyword))) {
        return {
          type: 'create',
          action: 'template',
          target: template.name,
          parameters: { template },
          confidence: 0.9
        };
      }
    }

    // Pattern matching for common commands
    if (lowerTranscript.includes('create') || lowerTranscript.includes('make') || lowerTranscript.includes('add')) {
      return {
        type: 'create',
        action: 'custom',
        parameters: { code: this.generateCodeFromDescription(transcript) },
        confidence: 0.8
      };
    }

    if (lowerTranscript.includes('change') || lowerTranscript.includes('modify') || lowerTranscript.includes('update')) {
      return {
        type: 'modify',
        action: 'code',
        parameters: { changes: transcript },
        confidence: 0.7
      };
    }

    if (lowerTranscript.includes('delete') || lowerTranscript.includes('remove')) {
      return {
        type: 'delete',
        action: 'code',
        parameters: { target: transcript },
        confidence: 0.8
      };
    }

    if (lowerTranscript.includes('go to') || lowerTranscript.includes('navigate') || lowerTranscript.includes('open')) {
      return {
        type: 'navigate',
        action: 'file',
        target: this.extractFileName(transcript),
        confidence: 0.7
      };
    }

    if (lowerTranscript.includes('search') || lowerTranscript.includes('find')) {
      return {
        type: 'search',
        action: 'code',
        parameters: { query: transcript },
        confidence: 0.6
      };
    }

    if (lowerTranscript.includes('debug') || lowerTranscript.includes('fix') || lowerTranscript.includes('error')) {
      return {
        type: 'debug',
        action: 'analyze',
        parameters: { issue: transcript },
        confidence: 0.7
      };
    }

    if (lowerTranscript.includes('deploy') || lowerTranscript.includes('publish') || lowerTranscript.includes('release')) {
      return {
        type: 'deploy',
        action: 'application',
        confidence: 0.8
      };
    }

    return {
      type: 'create',
      action: 'unknown',
      confidence: 0.3
    };
  }

  private async handleCreateCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    if (command.action === 'template' && command.parameters?.template) {
      const template = command.parameters.template as VoiceTemplate;
      return {
        success: true,
        code: template.code,
        message: `Created ${template.name} template`,
        executedCommands: [`Created ${template.name}`]
      };
    }

    if (command.action === 'custom' && command.parameters?.code) {
      return {
        success: true,
        code: command.parameters.code,
        message: 'Generated code from voice description',
        executedCommands: ['Generated custom code']
      };
    }

    return {
      success: false,
      message: 'Unable to create code from command'
    };
  }

  private async handleModifyCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    // AI-powered code modification
    const response = await fetch('/api/ai/modify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changes: command.parameters?.changes,
        currentCode: command.parameters?.currentCode
      })
    });

    const result = await response.json();
    return {
      success: result.success,
      code: result.modifiedCode,
      message: 'Code modified based on voice command',
      executedCommands: ['Modified code']
    };
  }

  private async handleDeleteCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    return {
      success: true,
      message: `Deleted ${command.target || 'selected code'}`,
      executedCommands: ['Deleted code']
    };
  }

  private async handleNavigateCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    return {
      success: true,
      message: `Navigated to ${command.target}`,
      executedCommands: ['Navigated to file']
    };
  }

  private async handleSearchCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    return {
      success: true,
      message: `Searching for: ${command.parameters?.query}`,
      executedCommands: ['Searched codebase']
    };
  }

  private async handleDebugCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    // AI-powered debugging
    const response = await fetch('/api/ai/debug-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issue: command.parameters?.issue,
        code: command.parameters?.code
      })
    });

    const result = await response.json();
    return {
      success: result.success,
      code: result.fixedCode,
      message: 'Debugged code based on voice description',
      executedCommands: ['Debugged code']
    };
  }

  private async handleDeployCommand(command: VoiceCommand): Promise<VoiceCodeResult> {
    return {
      success: true,
      message: 'Deployment initiated',
      executedCommands: ['Started deployment']
    };
  }

  private generateCodeFromDescription(description: string): string {
    // Simple code generation based on common patterns
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('function') || lowerDesc.includes('method')) {
      return `function ${this.extractFunctionName(description)}() {
  // TODO: Implement function logic
  console.log('Function called');
}`;
    }

    if (lowerDesc.includes('class')) {
      return `class ${this.extractClassName(description)} {
  constructor() {
    // Initialize class
  }
  
  // Add methods here
}`;
    }

    if (lowerDesc.includes('variable') || lowerDesc.includes('const') || lowerDesc.includes('let')) {
      return `const ${this.extractVariableName(description)} = null; // TODO: Set value`;
    }

    return `// Generated code for: ${description}
// TODO: Implement based on voice description`;
  }

  private extractFunctionName(description: string): string {
    const match = description.match(/(?:create|make|add)\s+(?:a\s+)?(?:function|method)\s+(?:called\s+)?(\w+)/i);
    return match ? match[1] : 'newFunction';
  }

  private extractClassName(description: string): string {
    const match = description.match(/(?:create|make|add)\s+(?:a\s+)?class\s+(?:called\s+)?(\w+)/i);
    return match ? match[1] : 'NewClass';
  }

  private extractVariableName(description: string): string {
    const match = description.match(/(?:create|make|add)\s+(?:a\s+)?(?:variable|const|let)\s+(?:called\s+)?(\w+)/i);
    return match ? match[1] : 'newVariable';
  }

  private extractFileName(description: string): string {
    const match = description.match(/(?:go to|navigate to|open)\s+(.+)/i);
    return match ? match[1].trim() : '';
  }

  speak(text: string): void {
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      this.synthesis.speak(utterance);
    }
  }

  addTemplate(template: VoiceTemplate): void {
    this.templates.push(template);
  }

  getTemplates(): VoiceTemplate[] {
    return this.templates;
  }
}

export const voiceToCode = new VoiceToCodeConverter();
