// Application Configuration
// This file contains all configurable settings for the application

export const appConfig = {
  // E2B Sandbox Configuration
  e2b: {
    // Sandbox timeout in minutes
    timeoutMinutes: 15,
    
    // Convert to milliseconds for E2B API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },
    
    // Vite development server port
    vitePort: 5173,
    
    // Time to wait for Vite to be ready (in milliseconds)
    viteStartupDelay: 7000,
    
    // Time to wait for CSS rebuild (in milliseconds)
    cssRebuildDelay: 2000,
    
    // Default sandbox template (if using templates)
    defaultTemplate: undefined, // or specify a template ID
  },
  
  // Multi-Language Support Configuration
  languages: {
    // Default language
    defaultLanguage: 'react',
    
    // Supported programming languages and frameworks
    supported: {
      react: {
        name: 'React',
        description: 'React with Vite and Tailwind CSS',
        template: 'react-vite',
        fileExtensions: ['.jsx', '.js', '.tsx', '.ts'],
        defaultFiles: ['src/App.jsx', 'src/index.css', 'package.json'],
        packageManager: 'npm',
        devCommand: 'npm run dev',
        buildCommand: 'npm run build',
        keywords: ['react', 'jsx', 'component', 'vite', 'tailwind', 'frontend', 'web', 'ui', 'interface'],
        aiPrompt: 'You are an expert React developer. Generate modern React components using JSX, functional components with hooks, and Tailwind CSS for styling.'
      },
      vue: {
        name: 'Vue.js',
        description: 'Vue 3 with Vite and Tailwind CSS',
        template: 'vue-vite',
        fileExtensions: ['.vue', '.js', '.ts'],
        defaultFiles: ['src/App.vue', 'src/main.js', 'package.json'],
        packageManager: 'npm',
        devCommand: 'npm run dev',
        buildCommand: 'npm run build',
        keywords: ['vue', 'vue3', 'composition', 'template', 'vite', 'tailwind', 'frontend', 'web'],
        aiPrompt: 'You are an expert Vue.js developer. Generate modern Vue 3 components using Composition API, Single File Components (SFC), and Tailwind CSS for styling.'
      },
      angular: {
        name: 'Angular',
        description: 'Angular with Tailwind CSS',
        template: 'angular',
        fileExtensions: ['.ts', '.html', '.scss', '.css'],
        defaultFiles: ['src/app/app.component.ts', 'src/app/app.component.html', 'package.json'],
        packageManager: 'npm',
        devCommand: 'ng serve',
        buildCommand: 'ng build',
        keywords: ['angular', 'typescript', 'component', 'service', 'module', 'frontend', 'web'],
        aiPrompt: 'You are an expert Angular developer. Generate modern Angular components using TypeScript, Angular CLI patterns, and Tailwind CSS for styling.'
      },
      svelte: {
        name: 'Svelte',
        description: 'Svelte with Vite and Tailwind CSS',
        template: 'svelte-vite',
        fileExtensions: ['.svelte', '.js', '.ts'],
        defaultFiles: ['src/App.svelte', 'src/main.js', 'package.json'],
        packageManager: 'npm',
        devCommand: 'npm run dev',
        buildCommand: 'npm run build',
        keywords: ['svelte', 'component', 'vite', 'tailwind', 'frontend', 'web'],
        aiPrompt: 'You are an expert Svelte developer. Generate modern Svelte components using Svelte syntax, reactive statements, and Tailwind CSS for styling.'
      },
      nodejs: {
        name: 'Node.js',
        description: 'Node.js backend application',
        template: 'nodejs',
        fileExtensions: ['.js', '.ts', '.json'],
        defaultFiles: ['index.js', 'package.json'],
        packageManager: 'npm',
        devCommand: 'npm run dev',
        buildCommand: 'npm run build',
        keywords: ['nodejs', 'node', 'backend', 'server', 'api', 'express', 'javascript'],
        aiPrompt: 'You are an expert Node.js developer. Generate modern Node.js applications using Express.js, ES6+ syntax, and best practices for backend development.'
      },
      python: {
        name: 'Python',
        description: 'Python application with Flask/FastAPI',
        template: 'python',
        fileExtensions: ['.py', '.txt', '.md'],
        defaultFiles: ['main.py', 'requirements.txt'],
        packageManager: 'pip',
        devCommand: 'python main.py',
        buildCommand: 'pip install -r requirements.txt',
        keywords: ['python', 'flask', 'fastapi', 'backend', 'api', 'server', 'django'],
        aiPrompt: 'You are an expert Python developer. Generate modern Python applications using Flask or FastAPI, with proper project structure and best practices.'
      },
      golang: {
        name: 'Go',
        description: 'Go backend application',
        template: 'golang',
        fileExtensions: ['.go', '.mod', '.sum'],
        defaultFiles: ['main.go', 'go.mod'],
        packageManager: 'go',
        devCommand: 'go run main.go',
        buildCommand: 'go build',
        keywords: ['go', 'golang', 'backend', 'server', 'api', 'microservice'],
        aiPrompt: 'You are an expert Go developer. Generate modern Go applications using standard library and popular packages, with proper project structure and Go best practices.'
      },
      rust: {
        name: 'Rust',
        description: 'Rust application',
        template: 'rust',
        fileExtensions: ['.rs', '.toml'],
        defaultFiles: ['src/main.rs', 'Cargo.toml'],
        packageManager: 'cargo',
        devCommand: 'cargo run',
        buildCommand: 'cargo build',
        keywords: ['rust', 'backend', 'server', 'api', 'systems', 'performance'],
        aiPrompt: 'You are an expert Rust developer. Generate modern Rust applications using Cargo, async/await, and Rust best practices for performance and safety.'
      },
      java: {
        name: 'Java',
        description: 'Java application with Spring Boot',
        template: 'java-spring',
        fileExtensions: ['.java', '.xml', '.properties'],
        defaultFiles: ['src/main/java/com/example/Application.java', 'pom.xml'],
        packageManager: 'maven',
        devCommand: 'mvn spring-boot:run',
        buildCommand: 'mvn clean package',
        keywords: ['java', 'spring', 'springboot', 'backend', 'api', 'enterprise'],
        aiPrompt: 'You are an expert Java developer. Generate modern Java applications using Spring Boot, Maven, and enterprise best practices.'
      },
      csharp: {
        name: 'C#',
        description: 'C# application with .NET',
        template: 'csharp-dotnet',
        fileExtensions: ['.cs', '.csproj', '.json'],
        defaultFiles: ['Program.cs', 'Project.csproj'],
        packageManager: 'dotnet',
        devCommand: 'dotnet run',
        buildCommand: 'dotnet build',
        keywords: ['csharp', 'dotnet', 'aspnet', 'backend', 'api', 'microsoft'],
        aiPrompt: 'You are an expert C# developer. Generate modern C# applications using .NET, ASP.NET Core, and Microsoft best practices.'
      },
      php: {
        name: 'PHP',
        description: 'PHP application with Laravel',
        template: 'php-laravel',
        fileExtensions: ['.php', '.blade.php', '.env'],
        defaultFiles: ['index.php', 'composer.json'],
        packageManager: 'composer',
        devCommand: 'php artisan serve',
        buildCommand: 'composer install',
        keywords: ['php', 'laravel', 'backend', 'web', 'server', 'framework'],
        aiPrompt: 'You are an expert PHP developer. Generate modern PHP applications using Laravel framework, Composer, and PHP best practices.'
      }
    },
    
    // Language detection patterns
    detection: {
      // Keywords that indicate specific languages
      languageKeywords: {
        react: ['react', 'jsx', 'component', 'hook', 'useState', 'useEffect'],
        vue: ['vue', 'template', 'composition', 'sfc', 'v-model'],
        angular: ['angular', 'typescript', 'component', 'service', 'module'],
        svelte: ['svelte', 'reactive', 'store'],
        nodejs: ['node', 'express', 'server', 'api', 'backend'],
        python: ['python', 'flask', 'fastapi', 'django', 'pip'],
        golang: ['go', 'golang', 'goroutine', 'channel'],
        rust: ['rust', 'cargo', 'ownership', 'borrowing'],
        java: ['java', 'spring', 'maven', 'gradle'],
        csharp: ['csharp', 'dotnet', 'aspnet', 'microsoft'],
        php: ['php', 'laravel', 'composer', 'blade']
      },
      
      // File extensions that indicate languages
      fileExtensions: {
        '.jsx': 'react',
        '.tsx': 'react',
        '.vue': 'vue',
        '.svelte': 'svelte',
        '.py': 'python',
        '.go': 'golang',
        '.rs': 'rust',
        '.java': 'java',
        '.cs': 'csharp',
        '.php': 'php'
      }
    }
  },
  
  // AI Model Configuration
  ai: {
    // Default AI model (using Groq for better reliability)
    defaultModel: 'groq/llama3-8b-8192',
    
    // Available models
    availableModels: [
      'openai/gpt-5',
      'groq/llama3-70b-8192',
      'groq/llama3-8b-8192',
      'groq/mixtral-8x7b-32768',
      'anthropic/claude-sonnet-4-20250514',
      'google/gemini-2.5-pro'
    ],
    
    // Model display names
    modelDisplayNames: {
      'openai/gpt-5': 'GPT-5',
      'groq/llama3-70b-8192': 'Groq AI (Llama3-70B)',
      'groq/llama3-8b-8192': 'Groq AI (Llama3-8B)',
      'groq/mixtral-8x7b-32768': 'Groq AI (Mixtral)',
      'anthropic/claude-sonnet-4-20250514': 'Sonnet 4',
      'google/gemini-2.5-pro': 'Gemini 2.5 Pro'
    },
    
    // Temperature settings for non-reasoning models (lower for faster, more focused generation)
    defaultTemperature: 0.3,
    
    // Max tokens for code generation (reduced for faster response)
    maxTokens: 4000,
    
    // Max tokens for truncation recovery
    truncationRecoveryMaxTokens: 4000,
  },
  
  // Code Application Configuration
  codeApplication: {
    // Delay after applying code before refreshing iframe (milliseconds) - reduced for speed
    defaultRefreshDelay: 1000,
    
    // Delay when packages are installed (milliseconds) - reduced for speed
    packageInstallRefreshDelay: 3000,
    
    // Enable/disable automatic truncation recovery
    enableTruncationRecovery: false, // Disabled - too many false positives
    
    // Maximum number of truncation recovery attempts per file
    maxTruncationRecoveryAttempts: 1,
  },
  
  // UI Configuration
  ui: {
    // Show/hide certain UI elements
    showModelSelector: true,
    showStatusIndicator: true,
    
    // Animation durations (milliseconds)
    animationDuration: 200,
    
    // Toast notification duration (milliseconds)
    toastDuration: 3000,
    
    // Maximum chat messages to keep in memory
    maxChatMessages: 100,
    
    // Maximum recent messages to send as context
    maxRecentMessagesContext: 20,
  },
  
  // Development Configuration
  dev: {
    // Enable debug logging
    enableDebugLogging: true,
    
    // Enable performance monitoring
    enablePerformanceMonitoring: false,
    
    // Log API responses
    logApiResponses: true,
  },
  
  // Package Installation Configuration
  packages: {
    // Use --legacy-peer-deps flag for npm install
    useLegacyPeerDeps: true,
    
    // Package installation timeout (milliseconds)
    installTimeout: 60000,
    
    // Auto-restart Vite after package installation
    autoRestartVite: true,
  },
  
  // File Management Configuration
  files: {
    // Excluded file patterns (files to ignore)
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.log',
      '.DS_Store'
    ],
    
    // Maximum file size to read (bytes)
    maxFileSize: 1024 * 1024, // 1MB
    
    // File extensions to treat as text
    textFileExtensions: [
      '.js', '.jsx', '.ts', '.tsx',
      '.css', '.scss', '.sass',
      '.html', '.xml', '.svg',
      '.json', '.yml', '.yaml',
      '.md', '.txt', '.env',
      '.gitignore', '.dockerignore'
    ],
  },
  
  // API Endpoints Configuration (for external services)
  api: {
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    
    // Request timeout (milliseconds)
    requestTimeout: 30000,
  }
};

// Type-safe config getter
export function getConfig<K extends keyof typeof appConfig>(key: K): typeof appConfig[K] {
  return appConfig[key];
}

// Helper to get nested config values
export function getConfigValue(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], appConfig as any);
}

export default appConfig;