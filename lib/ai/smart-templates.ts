export interface SmartTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  language: string;
  framework?: string;
  code: string;
  variables: TemplateVariable[];
  usage: number;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isAI: boolean;
  context?: TemplateContext;
}

export type TemplateCategory = 
  | 'component' 
  | 'function' 
  | 'class' 
  | 'api' 
  | 'database' 
  | 'test' 
  | 'config' 
  | 'utility' 
  | 'hook' 
  | 'style' 
  | 'deployment' 
  | 'security';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  defaultValue?: any;
  required: boolean;
  validation?: string;
}

export interface TemplateContext {
  projectType?: string;
  framework?: string;
  database?: string;
  styling?: string;
  testing?: string;
  deployment?: string;
  patterns?: string[];
}

export interface TemplateUsage {
  templateId: string;
  userId: string;
  timestamp: Date;
  variables: Record<string, any>;
  success: boolean;
  feedback?: number;
}

export interface TemplateSuggestion {
  template: SmartTemplate;
  confidence: number;
  reason: string;
  context: string;
}

export class SmartTemplateManager {
  private templates: Map<string, SmartTemplate> = new Map();
  private usageHistory: TemplateUsage[] = [];
  private userPatterns: Map<string, any> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates() {
    const defaultTemplates: SmartTemplate[] = [
      {
        id: 'react-functional-component',
        name: 'React Functional Component',
        description: 'Modern React functional component with TypeScript',
        category: 'component',
        language: 'typescript',
        framework: 'react',
        code: `import React from 'react';

interface {{componentName}}Props {
  {{#each props}}
  {{name}}: {{type}};
  {{/each}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({ {{#each props}}{{name}}{{#unless @last}}, {{/unless}}{{/each}} }) => {
  {{#if hasState}}
  const [{{stateName}}, set{{stateName}}] = React.useState<{{stateType}}>({{stateDefault}});
  {{/if}}

  {{#if hasEffect}}
  React.useEffect(() => {
    {{effectLogic}}
  }, [{{dependencies}}]);
  {{/if}}

  return (
    <div className="{{className}}">
      {{content}}
    </div>
  );
};`,
        variables: [
          { name: 'componentName', type: 'string', description: 'Name of the component', required: true },
          { name: 'props', type: 'array', description: 'Component props', required: false, defaultValue: [] },
          { name: 'hasState', type: 'boolean', description: 'Whether component has state', required: false, defaultValue: false },
          { name: 'stateName', type: 'string', description: 'State variable name', required: false },
          { name: 'stateType', type: 'string', description: 'State type', required: false },
          { name: 'stateDefault', type: 'string', description: 'Default state value', required: false },
          { name: 'hasEffect', type: 'boolean', description: 'Whether component has useEffect', required: false, defaultValue: false },
          { name: 'effectLogic', type: 'string', description: 'Effect logic', required: false },
          { name: 'dependencies', type: 'string', description: 'Effect dependencies', required: false },
          { name: 'className', type: 'string', description: 'CSS class name', required: false, defaultValue: '' },
          { name: 'content', type: 'string', description: 'Component content', required: false, defaultValue: '' }
        ],
        usage: 0,
        rating: 4.5,
        tags: ['react', 'typescript', 'component', 'functional'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isAI: false
      },
      {
        id: 'nextjs-api-route',
        name: 'Next.js API Route',
        description: 'Next.js API route with error handling and validation',
        category: 'api',
        language: 'typescript',
        framework: 'nextjs',
        code: `import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const {{schemaName}} = z.object({
  {{#each fields}}
  {{name}}: {{validation}},
  {{/each}}
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === '{{method}}') {
    try {
      {{#if hasValidation}}
      const validatedData = {{schemaName}}.parse(req.body);
      {{/if}}

      {{#if hasDatabase}}
      const result = await {{databaseQuery}};
      {{/if}}

      {{#if hasExternalApi}}
      const response = await fetch('{{apiUrl}}', {
        method: '{{apiMethod}}',
        headers: {
          'Content-Type': 'application/json',
          {{#each headers}}
          '{{name}}': '{{value}}',
          {{/each}}
        },
        {{#if hasBody}}
        body: JSON.stringify({{bodyData}}),
        {{/if}}
      });
      {{/if}}

      res.status({{statusCode}}).json({ 
        success: true, 
        data: {{responseData}},
        message: '{{successMessage}}'
      });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ 
        success: false, 
        error: '{{errorMessage}}' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}`,
        variables: [
          { name: 'schemaName', type: 'string', description: 'Zod schema name', required: false, defaultValue: 'requestSchema' },
          { name: 'fields', type: 'array', description: 'Validation fields', required: false, defaultValue: [] },
          { name: 'method', type: 'string', description: 'HTTP method', required: true },
          { name: 'hasValidation', type: 'boolean', description: 'Whether to validate request', required: false, defaultValue: true },
          { name: 'hasDatabase', type: 'boolean', description: 'Whether to query database', required: false, defaultValue: false },
          { name: 'databaseQuery', type: 'string', description: 'Database query', required: false },
          { name: 'hasExternalApi', type: 'boolean', description: 'Whether to call external API', required: false, defaultValue: false },
          { name: 'apiUrl', type: 'string', description: 'External API URL', required: false },
          { name: 'apiMethod', type: 'string', description: 'External API method', required: false },
          { name: 'headers', type: 'array', description: 'Request headers', required: false, defaultValue: [] },
          { name: 'hasBody', type: 'boolean', description: 'Whether to send body', required: false, defaultValue: false },
          { name: 'bodyData', type: 'string', description: 'Request body data', required: false },
          { name: 'statusCode', type: 'number', description: 'Success status code', required: false, defaultValue: 200 },
          { name: 'responseData', type: 'string', description: 'Response data', required: false, defaultValue: 'result' },
          { name: 'successMessage', type: 'string', description: 'Success message', required: false, defaultValue: 'Success' },
          { name: 'errorMessage', type: 'string', description: 'Error message', required: false, defaultValue: 'Internal server error' }
        ],
        usage: 0,
        rating: 4.3,
        tags: ['nextjs', 'api', 'typescript', 'validation'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isAI: false
      },
      {
        id: 'database-model',
        name: 'Database Model',
        description: 'Database model with relationships and validation',
        category: 'database',
        language: 'typescript',
        code: `import { Model, DataTypes, Sequelize } from 'sequelize';

export class {{modelName}} extends Model {
  public id!: number;
  {{#each fields}}
  public {{name}}!: {{type}};
  {{/each}}
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const init{{modelName}} = (sequelize: Sequelize) => {
  {{modelName}}.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    {{#each fields}}
    {{name}}: {
      type: DataTypes.{{sequelizeType}},
      {{#if allowNull}}
      allowNull: {{allowNull}},
      {{/if}}
      {{#if unique}}
      unique: {{unique}},
      {{/if}}
      {{#if defaultValue}}
      defaultValue: {{defaultValue}},
      {{/if}}
      {{#if validate}}
      validate: {
        {{#each validate}}
        {{name}}: {{value}},
        {{/each}}
      },
      {{/if}}
    },
    {{/each}}
  }, {
    sequelize,
    tableName: '{{tableName}}',
    {{#if timestamps}}
    timestamps: {{timestamps}},
    {{/if}}
    {{#if indexes}}
    indexes: [
      {{#each indexes}}
      {
        fields: [{{#each fields}}'{{name}}'{{#unless @last}}, {{/unless}}{{/each}}],
        {{#if unique}}
        unique: {{unique}},
        {{/if}}
      },
      {{/each}}
    ],
    {{/if}}
  });
};

export default {{modelName}};`,
        variables: [
          { name: 'modelName', type: 'string', description: 'Model class name', required: true },
          { name: 'tableName', type: 'string', description: 'Database table name', required: true },
          { name: 'fields', type: 'array', description: 'Model fields', required: true },
          { name: 'timestamps', type: 'boolean', description: 'Include timestamps', required: false, defaultValue: true },
          { name: 'indexes', type: 'array', description: 'Database indexes', required: false, defaultValue: [] }
        ],
        usage: 0,
        rating: 4.2,
        tags: ['database', 'sequelize', 'model', 'typescript'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isAI: false
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async suggestTemplates(context: string, language: string, category?: TemplateCategory): Promise<TemplateSuggestion[]> {
    const suggestions: TemplateSuggestion[] = [];

    // Get templates based on context and language
    const relevantTemplates = Array.from(this.templates.values()).filter(template => {
      if (template.language !== language) return false;
      if (category && template.category !== category) return false;
      return true;
    });

    // Analyze context to find best matches
    for (const template of relevantTemplates) {
      const confidence = this.calculateConfidence(context, template);
      if (confidence > 0.3) {
        suggestions.push({
          template,
          confidence,
          reason: this.generateReason(context, template),
          context: this.extractContext(context, template)
        });
      }
    }

    // Sort by confidence and usage
    suggestions.sort((a, b) => {
      const scoreA = a.confidence * (1 + a.template.usage / 100);
      const scoreB = b.confidence * (1 + b.template.usage / 100);
      return scoreB - scoreA;
    });

    // Generate AI templates if needed
    const aiTemplates = await this.generateAITemplates(context, language, category);
    suggestions.push(...aiTemplates);

    return suggestions.slice(0, 10);
  }

  async generateAITemplates(context: string, language: string, category?: TemplateCategory): Promise<TemplateSuggestion[]> {
    try {
      const response = await fetch('/api/ai/generate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          language,
          category,
          existingTemplates: Array.from(this.templates.values()).map(t => ({
            name: t.name,
            category: t.category,
            tags: t.tags
          }))
        })
      });

      const aiTemplates: SmartTemplate[] = await response.json();
      const suggestions: TemplateSuggestion[] = [];

      for (const template of aiTemplates) {
        this.templates.set(template.id, template);
        suggestions.push({
          template,
          confidence: 0.8,
          reason: 'AI-generated based on context',
          context: 'Generated specifically for your use case'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Failed to generate AI templates:', error);
      return [];
    }
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate variables
    this.validateVariables(template, variables);

    // Render template using simple variable replacement
    let renderedCode = template.code;

    // Replace simple variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedCode = renderedCode.replace(regex, String(value));
    }

    // Handle conditional blocks
    renderedCode = this.processConditionals(renderedCode, variables);

    // Handle loops
    renderedCode = this.processLoops(renderedCode, variables);

    // Track usage
    this.trackUsage(templateId, variables);

    return renderedCode;
  }

  private validateVariables(template: SmartTemplate, variables: Record<string, any>): void {
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        throw new Error(`Required variable '${variable.name}' is missing`);
      }

      if (variable.name in variables) {
        const value = variables[variable.name];
        if (variable.validation) {
          // Add validation logic here
          console.log(`Validating ${variable.name}: ${value}`);
        }
      }
    }
  }

  private processConditionals(code: string, variables: Record<string, any>): string {
    // Simple conditional processing
    const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    return code.replace(conditionalRegex, (match, condition, content) => {
      return variables[condition] ? content : '';
    });
  }

  private processLoops(code: string, variables: Record<string, any>): string {
    // Simple loop processing
    const loopRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    return code.replace(loopRegex, (match, arrayName, content) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        let itemContent = content;
        // Replace item properties
        for (const [key, value] of Object.entries(item)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemContent = itemContent.replace(regex, String(value));
        }
        // Replace loop helpers
        itemContent = itemContent.replace(/{{@index}}/g, String(index));
        itemContent = itemContent.replace(/{{@last}}/g, index === array.length - 1 ? 'true' : 'false');
        return itemContent;
      }).join('');
    });
  }

  private calculateConfidence(context: string, template: SmartTemplate): number {
    let confidence = 0;

    // Check category match
    if (template.category) {
      confidence += 0.2;
    }

    // Check tag matches
    const contextLower = context.toLowerCase();
    for (const tag of template.tags) {
      if (contextLower.includes(tag.toLowerCase())) {
        confidence += 0.1;
      }
    }

    // Check name/description matches
    if (contextLower.includes(template.name.toLowerCase())) {
      confidence += 0.3;
    }

    if (template.description.toLowerCase().includes(contextLower)) {
      confidence += 0.2;
    }

    // Consider usage and rating
    confidence += (template.usage / 1000) * 0.1;
    confidence += (template.rating / 5) * 0.1;

    return Math.min(confidence, 1);
  }

  private generateReason(context: string, template: SmartTemplate): string {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes(template.name.toLowerCase())) {
      return `Direct match for "${template.name}"`;
    }

    for (const tag of template.tags) {
      if (contextLower.includes(tag.toLowerCase())) {
        return `Matches "${tag}" requirement`;
      }
    }

    return `Popular ${template.category} template`;
  }

  private extractContext(context: string, template: SmartTemplate): string {
    return `Based on your request for ${template.category} in ${template.language}`;
  }

  private trackUsage(templateId: string, variables: Record<string, any>): void {
    const template = this.templates.get(templateId);
    if (template) {
      template.usage++;
      template.updatedAt = new Date();
    }

    this.usageHistory.push({
      templateId,
      userId: 'current-user', // In real app, get from auth
      timestamp: new Date(),
      variables,
      success: true
    });
  }

  async createTemplate(template: Omit<SmartTemplate, 'id' | 'usage' | 'rating' | 'createdAt' | 'updatedAt'>): Promise<SmartTemplate> {
    const newTemplate: SmartTemplate = {
      ...template,
      id: this.generateId(),
      usage: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<SmartTemplate>): Promise<SmartTemplate> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template ${id} not found`);
    }

    const updatedTemplate: SmartTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.templates.has(id)) {
      throw new Error(`Template ${id} not found`);
    }

    this.templates.delete(id);
  }

  getTemplate(id: string): SmartTemplate | undefined {
    return this.templates.get(id);
  }

  getTemplates(category?: TemplateCategory, language?: string): SmartTemplate[] {
    return Array.from(this.templates.values()).filter(template => {
      if (category && template.category !== category) return false;
      if (language && template.language !== language) return false;
      return true;
    });
  }

  getUsageStats(): any {
    const stats = {
      totalTemplates: this.templates.size,
      totalUsage: this.usageHistory.length,
      popularTemplates: Array.from(this.templates.values())
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10),
      recentUsage: this.usageHistory.slice(-20)
    };

    return stats;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const smartTemplates = new SmartTemplateManager();
