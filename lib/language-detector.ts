import { appConfig } from '@/config/app.config';

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  reason: string;
  keywords: string[];
}

export interface ProjectContext {
  files?: string[];
  fileContents?: Record<string, string>;
  conversationHistory?: string[];
}

/**
 * Detects the programming language from user input and project context
 */
export function detectLanguage(
  userInput: string, 
  projectContext?: ProjectContext
): LanguageDetectionResult {
  const input = userInput.toLowerCase();
  const supportedLanguages = appConfig.languages.supported;
  const detection = appConfig.languages.detection;
  
  let bestMatch: LanguageDetectionResult = {
    language: appConfig.languages.defaultLanguage,
    confidence: 0,
    reason: 'Default language (no specific indicators found)',
    keywords: []
  };

  // Enhanced language detection patterns
  const enhancedPatterns = {
    react: [
      'react', 'jsx', 'component', 'hook', 'usestate', 'useeffect', 'functional component',
      'react app', 'react application', 'react project', 'frontend', 'web app', 'spa',
      'create react app', 'vite react', 'next.js', 'gatsby', 'react router', 'redux',
      'context api', 'react hooks', 'jsx syntax', 'react component', 'react native'
    ],
    vue: [
      'vue', 'vue.js', 'vue3', 'template', 'composition', 'sfc', 'v-model', 'vue app',
      'vue application', 'nuxt', 'vuex', 'pinia', 'vue router', 'vue cli', 'single file component'
    ],
    angular: [
      'angular', 'typescript', 'component', 'service', 'module', 'angular app',
      'angular application', 'angular cli', 'ng serve', 'angular material', 'angular router',
      'dependency injection', 'angular forms', 'rxjs', 'observable'
    ],
    svelte: [
      'svelte', 'reactive', 'store', 'svelte app', 'sveltekit', 'svelte application',
      'svelte component', 'svelte syntax', 'reactive statement'
    ],
    nodejs: [
      'node', 'node.js', 'express', 'server', 'api', 'backend', 'npm', 'package.json',
      'node app', 'node application', 'rest api', 'web server', 'microservice', 'express.js',
      'middleware', 'route handler', 'http server', 'json api'
    ],
    python: [
      'python', 'flask', 'fastapi', 'django', 'pip', 'requirements.txt', 'python app',
      'python script', 'backend api', 'data science', 'machine learning', 'ml', 'ai',
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'jupyter', 'data analysis'
    ],
    golang: [
      'go', 'golang', 'goroutine', 'channel', 'go mod', 'go app', 'microservice',
      'backend service', 'api server', 'gin', 'echo', 'gorilla mux', 'go modules'
    ],
    rust: [
      'rust', 'cargo', 'ownership', 'borrowing', 'rust app', 'systems programming',
      'performance', 'memory safety', 'actix', 'rocket', 'tokio', 'async rust'
    ],
    java: [
      'java', 'spring', 'spring boot', 'maven', 'gradle', 'java app', 'enterprise',
      'backend service', 'jvm', 'spring mvc', 'spring data', 'hibernate', 'jpa'
    ],
    csharp: [
      'csharp', 'c#', 'dotnet', 'aspnet', 'microsoft', '.net', 'c# app', 'asp.net core',
      'blazor', 'winforms', 'wpf', 'entity framework', 'linq', 'async await'
    ],
    php: [
      'php', 'laravel', 'composer', 'blade', 'php app', 'wordpress', 'symfony',
      'web application', 'server-side', 'php artisan', 'eloquent', 'migration'
    ]
  };

  // Special handling for portfolio requests with explicit language mentions
  if (input.includes('portfolio') || input.includes('webportfolio')) {
    // Check if a specific language was mentioned
    for (const [langKey, langConfig] of Object.entries(supportedLanguages)) {
      const langName = (langConfig as any).name.toLowerCase();
      if (input.includes(langKey) || input.includes(langName)) {
        return {
          language: langKey,
          confidence: 0.98,
          reason: `Portfolio request with explicit language: ${(langConfig as any).name}`,
          keywords: [langKey, langName, 'portfolio']
        };
      }
    }
  }

  // Check for explicit language mentions with higher priority
  for (const [langKey, patterns] of Object.entries(enhancedPatterns)) {
    const foundKeywords: string[] = [];
    
    // Check for exact language name matches (highest priority)
    if (input.includes(langKey) || input.includes((supportedLanguages as any)[langKey]?.name.toLowerCase())) {
      return {
        language: langKey,
        confidence: 0.95,
        reason: `Explicitly mentioned: ${(supportedLanguages as any)[langKey]?.name}`,
        keywords: [langKey, (supportedLanguages as any)[langKey]?.name.toLowerCase()]
      };
    }
    
    // Check for enhanced pattern matches
    for (const pattern of patterns) {
      if (input.includes(pattern)) {
        foundKeywords.push(pattern);
      }
    }
    
    // Calculate confidence based on pattern matches
    if (foundKeywords.length > 0) {
      const confidence = Math.min(0.9, 0.4 + (foundKeywords.length * 0.15));
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          language: langKey,
          confidence,
          reason: `Patterns detected: ${foundKeywords.join(', ')}`,
          keywords: foundKeywords
        };
      }
    }
  }

  // Context-aware detection based on application type
  const applicationPatterns = {
    // Frontend/Web applications
    frontend: ['website', 'web app', 'frontend', 'ui', 'user interface', 'landing page', 'dashboard', 'admin panel'],
    // Backend/API applications
    backend: ['api', 'backend', 'server', 'database', 'rest api', 'graphql', 'microservice', 'authentication', 'authorization'],
    // Data Science/Machine Learning
    dataScience: ['data analysis', 'machine learning', 'ml', 'ai', 'data science', 'analytics', 'prediction', 'model', 'dataset'],
    // Mobile applications
    mobile: ['mobile app', 'ios', 'android', 'react native', 'flutter', 'mobile application'],
    // Desktop applications
    desktop: ['desktop app', 'windows app', 'mac app', 'gui application', 'desktop application']
  };

  // Determine application type and suggest appropriate language
  for (const [appType, patterns] of Object.entries(applicationPatterns)) {
    const foundAppPatterns: string[] = [];
    
    for (const pattern of patterns) {
      if (input.includes(pattern)) {
        foundAppPatterns.push(pattern);
      }
    }
    
    if (foundAppPatterns.length > 0) {
      // Suggest appropriate language based on application type
      let suggestedLanguage = '';
      let reason = '';
      
      switch (appType) {
        case 'frontend':
          suggestedLanguage = 'react';
          reason = `Frontend application detected: ${foundAppPatterns.join(', ')}`;
          break;
        case 'backend':
          suggestedLanguage = 'nodejs';
          reason = `Backend application detected: ${foundAppPatterns.join(', ')}`;
          break;
        case 'dataScience':
          suggestedLanguage = 'python';
          reason = `Data science application detected: ${foundAppPatterns.join(', ')}`;
          break;
        case 'mobile':
          suggestedLanguage = 'react';
          reason = `Mobile application detected: ${foundAppPatterns.join(', ')}`;
          break;
        case 'desktop':
          suggestedLanguage = 'csharp';
          reason = `Desktop application detected: ${foundAppPatterns.join(', ')}`;
          break;
      }
      
      // Only apply application type suggestion if no explicit language was mentioned
      // and if the confidence is lower than the current best match
      if (suggestedLanguage && bestMatch.confidence < 0.6) {
        bestMatch = {
          language: suggestedLanguage,
          confidence: 0.7,
          reason,
          keywords: foundAppPatterns
        };
      }
    }
  }

  // Check project context for file extensions
  if (projectContext?.files) {
    const fileExtensions = new Map<string, number>();
    
    for (const file of projectContext.files) {
      const ext = file.substring(file.lastIndexOf('.'));
      const lang = detection.fileExtensions[ext];
      
      if (lang) {
        fileExtensions.set(lang, (fileExtensions.get(lang) || 0) + 1);
      }
    }
    
    // Find the most common language from file extensions
    let mostCommonLang = '';
    let maxCount = 0;
    
    for (const [lang, count] of fileExtensions) {
      if (count > maxCount) {
        mostCommonLang = lang;
        maxCount = count;
      }
    }
    
    if (mostCommonLang && maxCount > 0) {
      const fileConfidence = Math.min(0.85, 0.4 + (maxCount * 0.15));
      
      if (fileConfidence > bestMatch.confidence) {
        bestMatch = {
          language: mostCommonLang,
          confidence: fileConfidence,
          reason: `Detected from ${maxCount} file(s) with ${mostCommonLang} extensions`,
          keywords: []
        };
      }
    }
  }

  // Check conversation history for language patterns
  if (projectContext?.conversationHistory) {
    const historyText = projectContext.conversationHistory.join(' ').toLowerCase();
    
    for (const [langKey, keywords] of Object.entries(detection.languageKeywords)) {
      const foundKeywords: string[] = [];
      
      for (const keyword of keywords) {
        if (historyText.includes(keyword)) {
          foundKeywords.push(keyword);
        }
      }
      
      if (foundKeywords.length > 0) {
        const historyConfidence = Math.min(0.8, 0.2 + (foundKeywords.length * 0.15));
        
        if (historyConfidence > bestMatch.confidence) {
          bestMatch = {
            language: langKey,
            confidence: historyConfidence,
            reason: `Detected from conversation history: ${foundKeywords.join(', ')}`,
            keywords: foundKeywords
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Gets language-specific AI prompt
 */
export function getLanguagePrompt(language: string): string {
  const langConfig = (appConfig.languages.supported as any)[language];
  return langConfig?.aiPrompt || (appConfig.languages.supported as any)[appConfig.languages.defaultLanguage].aiPrompt;
}

/**
 * Gets language configuration
 */
export function getLanguageConfig(language: string) {
  return (appConfig.languages.supported as any)[language] || (appConfig.languages.supported as any)[appConfig.languages.defaultLanguage];
}

/**
 * Validates if a language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return language in appConfig.languages.supported;
}

/**
 * Gets all supported languages
 */
export function getSupportedLanguages() {
  return Object.entries(appConfig.languages.supported).map(([key, config]) => ({
    key,
    name: config.name,
    description: config.description
  }));
}

/**
 * Enhances user input with language context
 */
export function enhanceUserInput(userInput: string, detectedLanguage: string): string {
  const langConfig = getLanguageConfig(detectedLanguage);
  
  // Add language context if not already present
  if (!userInput.toLowerCase().includes(langConfig.name.toLowerCase()) && 
      !userInput.toLowerCase().includes(detectedLanguage)) {
    return `Create a ${langConfig.name} application: ${userInput}`;
  }
  
  return userInput;
}
