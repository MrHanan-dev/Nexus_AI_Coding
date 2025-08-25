// AI Command Parser - Converts natural language to structured commands
// This allows the AI to understand user intent and execute appropriate actions

import { ChatCommandData, chatController } from './chat-controller';

// Command patterns for natural language recognition
const commandPatterns = {
  // Feature toggles
  toggle: {
    patterns: [
      /(?:show|hide|open|close|enable|disable|turn on|turn off)\s+(file explorer|terminal|integrations|advanced features|settings|debug mode|ai|auto save)/i,
      /(?:toggle|switch)\s+(file explorer|terminal|integrations|advanced features|settings|debug mode|ai|auto save)/i
    ],
    extract: (match: RegExpMatchArray) => ({
      type: 'toggle-feature' as const,
      target: match[1].toLowerCase().replace(/\s+/g, ''),
      value: match[0].toLowerCase().includes('show') || match[0].toLowerCase().includes('open') || match[0].toLowerCase().includes('enable') || match[0].toLowerCase().includes('turn on')
    })
  },

  // Settings changes
  settings: {
    patterns: [
      /(?:change|set|update)\s+(theme|font size|zoom|ai model|terminal theme)\s+(?:to\s+)?(.+)/i,
      /(?:make|set)\s+(word wrap|line numbers)\s+(?:to\s+)?(on|off|true|false)/i
    ],
    extract: (match: RegExpMatchArray) => ({
      type: 'change-setting' as const,
      target: match[1].toLowerCase().replace(/\s+/g, ''),
      value: match[2].trim()
    })
  },

  // File operations
  files: {
    patterns: [
      /(?:open|edit|view)\s+(?:file\s+)?(.+)/i,
      /(?:create|make|new)\s+(?:file\s+)?(.+)/i,
      /(?:delete|remove)\s+(?:file\s+)?(.+)/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      if (action.includes('open') || action.includes('edit') || action.includes('view')) {
        return { type: 'open-file' as const, target: match[1].trim() };
      } else if (action.includes('create') || action.includes('make') || action.includes('new')) {
        return { type: 'create-file' as const, target: match[1].trim() };
      } else if (action.includes('delete') || action.includes('remove')) {
        return { type: 'delete-file' as const, target: match[1].trim() };
      }
      return null;
    }
  },

  // Terminal commands
  terminal: {
    patterns: [
      /(?:run|execute|run command)\s+(.+)/i,
      /(?:install|add)\s+package\s+(.+)/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      if (action.includes('install') || action.includes('add package')) {
        return { type: 'install-package' as const, target: match[1].trim() };
      } else {
        return { type: 'run-command' as const, target: match[1].trim() };
      }
    }
  },

  // Code execution
  code: {
    patterns: [
      /(?:execute|run)\s+code\s+(.+)/i,
      /(?:deploy|publish)\s+(?:app|application)/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      if (action.includes('deploy') || action.includes('publish')) {
        return { type: 'deploy-app' as const, target: 'deploy' };
      } else {
        return { type: 'execute-code' as const, target: match[1].trim() };
      }
    }
  },

  // Git operations
  git: {
    patterns: [
      /(?:git\s+)?(commit|push|pull|branch|clone)\s+(.+)/i,
      /(?:commit|push|pull)\s+(?:changes?|code)/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      if (action.includes('commit')) {
        return { type: 'git-operation' as const, target: 'commit', options: { message: match[2] || 'Auto commit' } };
      } else if (action.includes('push')) {
        return { type: 'git-operation' as const, target: 'push' };
      } else if (action.includes('pull')) {
        return { type: 'git-operation' as const, target: 'pull' };
      } else if (action.includes('branch')) {
        return { type: 'git-operation' as const, target: 'branch', options: { name: match[2] } };
      } else if (action.includes('clone')) {
        return { type: 'git-operation' as const, target: 'clone', options: { url: match[2] } };
      }
      return null;
    }
  },

  // Integration actions
  integrations: {
    patterns: [
      /(?:connect|setup|configure)\s+(stripe|supabase|github)/i,
      /(?:test|check)\s+(stripe|supabase|github)\s+connection/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      const integration = match[1].toLowerCase();
      if (action.includes('connect') || action.includes('setup') || action.includes('configure')) {
        return { type: 'integration-action' as const, target: integration, options: { action: 'connect' } };
      } else if (action.includes('test') || action.includes('check')) {
        return { type: 'integration-action' as const, target: integration, options: { action: 'test' } };
      }
      return null;
    }
  },

  // Debug actions
  debug: {
    patterns: [
      /(?:analyze|debug|check)\s+(?:code|issues|problems)/i,
      /(?:show|hide)\s+(issues|dependencies|complexity)\s+panel/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      if (action.includes('analyze') || action.includes('debug') || action.includes('check')) {
        return { type: 'debug-action' as const, target: 'analyze', options: { type: 'code' } };
      } else if (action.includes('show') || action.includes('hide')) {
        const panel = match[1].toLowerCase();
        return { type: 'debug-action' as const, target: 'toggle-panel', options: { panel, show: action.includes('show') } };
      }
      return null;
    }
  },

  // Performance actions
  performance: {
    patterns: [
      /(?:optimize|improve)\s+(?:performance|speed|code)/i,
      /(?:analyze|check)\s+(?:bundle|memory|performance)/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      if (action.includes('optimize') || action.includes('improve')) {
        return { type: 'performance-action' as const, target: 'optimize', options: { type: 'code' } };
      } else if (action.includes('analyze') || action.includes('check')) {
        if (action.includes('bundle')) {
          return { type: 'performance-action' as const, target: 'bundle-analysis' };
        } else if (action.includes('memory')) {
          return { type: 'performance-action' as const, target: 'memory-usage' };
        } else {
          return { type: 'performance-action' as const, target: 'analyze' };
        }
      }
      return null;
    }
  },

  // Status and information
  status: {
    patterns: [
      /(?:show|get|what is|what's)\s+(?:status|state|information|info)/i,
      /(?:how|what)\s+(?:is|are)\s+(?:the\s+)?(?:current\s+)?(?:settings|configuration)/i
    ],
    extract: () => ({
      type: 'system-action' as const,
      target: 'get-status'
    })
  },

  // Help and commands
  help: {
    patterns: [
      /(?:show|list|what)\s+(?:commands|help|available|can you do)/i,
      /(?:help|commands|what can you do)/i
    ],
    extract: () => ({
      type: 'system-action' as const,
      target: 'show-help'
    })
  },

  // Brain actions
  brain: {
    patterns: [
      /(?:show|get|what is|what's)\s+(?:brain|ai brain|learning|memory)\s+(?:status|state|progress)/i,
      /(?:regenerate|improve|upgrade)\s+(?:brain|ai brain|capabilities)/i,
      /(?:learn|store|remember)\s+(.+)/i,
      /(?:search|find|get)\s+(?:memories|memory)\s+(?:about|for)\s+(.+)/i,
      /(?:show|get)\s+(?:insights|analytics|learning insights)/i,
      /(?:brain|ai brain)\s+(?:status|regenerate|learn|memory|insights)/i
    ],
    extract: (match: RegExpMatchArray, originalText: string) => {
      const action = originalText.toLowerCase();
      
      if (action.includes('status') || action.includes('state') || action.includes('progress')) {
        return { type: 'brain-status' as const, target: 'status' };
      } else if (action.includes('regenerate') || action.includes('improve') || action.includes('upgrade')) {
        return { type: 'brain-regenerate' as const, target: 'regenerate' };
      } else if (action.includes('learn') || action.includes('store') || action.includes('remember')) {
        return { type: 'brain-learn' as const, target: match[1] || 'new learning', value: 'interaction' };
      } else if (action.includes('search') || action.includes('find') || action.includes('get memories')) {
        return { type: 'brain-memory' as const, target: match[1] || 'general' };
      } else if (action.includes('insights') || action.includes('analytics')) {
        return { type: 'brain-insights' as const, target: 'insights' };
      }
      
      return null;
    }
  }
};

// AI Command Parser Class
export class AICommandParser {
  
  // Parse natural language input and convert to structured command
  public static parseCommand(input: string): ChatCommandData | null {
    const normalizedInput = input.trim().toLowerCase();
    
    // Check each command pattern
    for (const [category, config] of Object.entries(commandPatterns)) {
      for (const pattern of config.patterns) {
        const match = input.match(pattern);
        if (match) {
          const result = config.extract(match, input);
          if (result) {
            return result as ChatCommandData;
          }
        }
      }
    }

    // If no pattern matches, try to infer intent
    return this.inferIntent(input);
  }

  // Infer intent from natural language when no pattern matches
  private static inferIntent(input: string): ChatCommandData | null {
    const normalized = input.toLowerCase();
    
    // Common intent patterns
    if (normalized.includes('theme') || normalized.includes('color')) {
      return {
        type: 'change-setting',
        target: 'editorTheme',
        value: normalized.includes('light') ? 'light' : 'vscDarkPlus'
      };
    }
    
    if (normalized.includes('font') || normalized.includes('size')) {
      const sizeMatch = input.match(/(\d+)/);
      if (sizeMatch) {
        return {
          type: 'change-setting',
          target: 'editorFontSize',
          value: parseInt(sizeMatch[1])
        };
      }
    }
    
    if (normalized.includes('zoom')) {
      const zoomMatch = input.match(/(\d+)/);
      if (zoomMatch) {
        return {
          type: 'change-setting',
          target: 'editorZoom',
          value: parseInt(zoomMatch[1]) / 100
        };
      }
    }
    
    if (normalized.includes('model') || normalized.includes('ai')) {
      const availableModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro', 'kimi'];
      for (const model of availableModels) {
        if (normalized.includes(model)) {
          return {
            type: 'change-setting',
            target: 'aiModel',
            value: model
          };
        }
      }
    }
    
    return null;
  }

  // Get help information for available commands
  public static getHelpText(): string {
    const commands = chatController.getAvailableCommands();
    
    let helpText = `
🤖 **AI Command Center - Full Application Control**

You can control **everything** in this application through natural language commands!

🎛️ **UI Controls:**
• "Show/hide file explorer"
• "Open/close terminal"
• "Toggle integrations panel"
• "Enable/disable debug mode"
• "Turn on/off auto save"

⚙️ **Settings:**
• "Change theme to light/dark"
• "Set font size to 16"
• "Change zoom to 120%"
• "Switch AI model to GPT-4"
• "Enable/disable word wrap"

📁 **File Operations:**
• "Open file.js"
• "Create new component.tsx"
• "Delete old file.txt"

💻 **Terminal & Commands:**
• "Run npm install"
• "Execute ls -la"
• "Install package react-router"
• "Deploy application"

🔧 **Git Operations:**
• "Commit changes"
• "Push to repository"
• "Create new branch feature"
• "Pull latest changes"

🔗 **Integrations:**
• "Connect Stripe"
• "Setup Supabase"
• "Configure GitHub"
• "Test integration"

🐛 **Debug & Analysis:**
• "Analyze code for issues"
• "Show dependencies panel"
• "Check performance"
• "Optimize bundle size"

📊 **Status & Information:**
• "Show application status"
• "What are current settings?"
• "List available commands"

**Examples:**
• "Open the terminal and run npm start"
• "Change the theme to light mode and increase font size to 16"
• "Show the file explorer and open package.json"
• "Enable debug mode and analyze the code"
• "Connect to Stripe and test the integration"

Just tell me what you want to do, and I'll make it happen! 🚀
    `.trim();
    
    return helpText;
  }

  // Execute a parsed command
  public static async executeCommand(input: string): Promise<string> {
    const command = this.parseCommand(input);
    
    if (!command) {
      return `❌ I couldn't understand that command. Try saying something like:
• "Show the terminal"
• "Change theme to light"
• "Open package.json"
• "Run npm install"
• "Show available commands"`;
    }
    
    try {
      const result = await chatController.executeCommand(command);
      return result;
    } catch (error) {
      return `❌ Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Check if input is a command (not code generation)
  public static isCommand(input: string): boolean {
    const command = this.parseCommand(input);
    return command !== null;
  }

  // Get command suggestions based on partial input
  public static getSuggestions(partialInput: string): string[] {
    const suggestions = [
      "Show terminal",
      "Open file explorer",
      "Change theme",
      "Enable debug mode",
      "Run npm install",
      "Commit changes",
      "Connect Stripe",
      "Analyze code",
      "Show status",
      "List commands"
    ];
    
    const normalized = partialInput.toLowerCase();
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(normalized)
    ).slice(0, 5);
  }
}
