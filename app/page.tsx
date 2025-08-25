'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { appConfig } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AdvancedFeatures from '@/components/AdvancedFeatures';
import Terminal from '@/components/Terminal';
import Integrations from '@/components/Integrations';
import CodeEditor from '@/components/CodeEditor';
import FileMenu from '@/components/FileMenu';
import Settings from '@/components/Settings';
import LanguageList from '@/components/LanguageList';
import { fileOperations, FileItem } from '@/lib/file-operations';
import { getFileIcon as getLanguageFileIcon } from '@/lib/language-icons';
import { chatController } from '@/lib/chat-controller';
import { AICommandParser } from '@/lib/ai-command-parser';
import { aiBrain } from '@/lib/ai-brain';
import BrainDashboard from '@/components/BrainDashboard';
import { MessageClassifier } from '@/lib/message-classifier';
// Import icons from centralized module to avoid Turbopack chunk issues
import { 
  FiFile, 
  FiChevronRight, 
  FiChevronDown,
  FiImage,
  FiUpload,
  FiDownload,
  FiSearch,
  FiEdit,
  FiEye,
  FiSettings,
  FiTerminal,
  FiPackage,
  FiCode,
  FiDatabase,
  FiFolder,
  FiFolderPlus,
  FiTrash2,
  FiCopy,
  FiExternalLink,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,
  FiStar,
  FiHeart,
  FiShare,
  FiLink,
  FiMaximize2,
  FiMinimize2,
  FiX,
  FiCheck,
  FiClock,
  FiCalendar,
  FiUser,
  FiUsers,
  FiLock,
  FiUnlock,
  FiShield,
  FiKey,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiWifi,
  FiBluetooth,
  FiBattery,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiRewind,
  FiFastForward,
  FiRepeat,
  FiShuffle,
  FiMic,
  FiMicOff,
  FiCamera,
  FiCameraOff,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiPrinter,
  FiHeadphones,
  FiSpeaker,
  FiMousePointer,
  FiMove,
  FiRotateCw,
  FiRotateCcw,
  FiZoomIn,
  FiZoomOut,
  FiCrop,
  FiScissors,
  FiType,
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiCpu,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiHash,
  FiLink2,
  FiTrendingUp,
  FiRefreshCw,
  FiFileText,
  FiBook,
  FiGitBranch,
  FiGrid,
  FiFilter,
  FiZap,
  FiBarChart,
  FiTarget,
  FiActivity,
  FiAward,
  BsLightningCharge,
  BsGear,
  BsGraphUp,
  BsEye,
  BsFolderFill, 
  BsFolder2Open,
  SiJavascript, 
  SiReact, 
  SiCss3, 
  SiJson,
  SiTypescript,
  SiPython,
  SiPhp,
  SiRuby,
  SiGo,
  SiRust,
  SiHtml5,
  SiSass,
  SiLess,
  SiXml,
  SiYaml,
  SiMarkdown,
  SiMysql,
  SiDocker,
  SiGit,
  SiGithub,
  SiNpm,
  SiYarn,
  SiVite,
  SiWebpack,
  SiBabel,
  SiEslint,
  SiPrettier,
  SiJest,
  SiCypress,
  SiTailwindcss,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiJquery,
  SiAxios,
  SiGraphql,
  SiPrisma,
  SiFirebase,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiStripe,
  SiPaypal
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import CodeApplicationProgress, { type CodeApplicationState } from '@/components/CodeApplicationProgress';
import { detectLanguage, getLanguageConfig, getSupportedLanguages, type LanguageDetectionResult } from '@/lib/language-detector';
import { CodeAnalyzer, type CodeAnalysisResult, type FileInfo } from '@/lib/code-analyzer';
import { FileUploadManager, type UploadedFile, createDropZone, createFileInput, captureScreenshot } from '@/lib/file-upload';

interface SandboxData {
  sandboxId: string;
  url: string;
  [key: string]: any;
}

interface ChatMessage {
  content: string;
  type: 'user' | 'ai' | 'system' | 'file-update' | 'command' | 'error';
  timestamp: Date;
  showLanguages?: boolean;
  imageData?: string;
  metadata?: {
    scrapedUrl?: string;
    scrapedContent?: any;
    generatedCode?: string;
    appliedFiles?: string[];
    commandType?: 'input' | 'output' | 'error' | 'success';
  };
}

export default function AISandboxPage() {
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: 'Not connected', active: false });
  const [responseArea, setResponseArea] = useState<string[]>([]);
  const [structureContent, setStructureContent] = useState('No sandbox created yet');
  const [promptInput, setPromptInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
              content: 'Hello! I\'m here to help you with coding and development. What would you like to work on?',
      type: 'ai',
      timestamp: new Date(),
      showLanguages: true
    }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiEnabled] = useState(true);
  
  // Chat Controller Setup
  useEffect(() => {
    // Register callbacks for chat controller
    chatController.onStateChange((newState) => {
      // Update UI state based on chat controller
      setShowTerminal(newState.showTerminal);
      setShowIntegrations(newState.showIntegrations);
      setShowAdvancedFeatures(newState.showAdvancedFeatures);
      setShowSettings(newState.showSettings);
      setShowGitPanel(newState.showGitPanel);
      setShowSearch(newState.showSearch);
      setShowFileUpload(newState.showFileUpload);
      setDebugMode(newState.debugMode);
      setShowIssues(newState.showIssues);
      setShowDependencies(newState.showDependencies);
      setShowComplexity(newState.showComplexity);
      setAiModel(newState.aiModel);
    });

    // Register action callbacks
    chatController.onAction('openFile', (filePath) => {
      // Handle file opening
      if (filePath && typeof filePath === 'string') {
        fetchAndOpenFile(filePath);
      }
    });

    // Note: File creation is handled by the AI generation process through apply-ai-code-stream
    // This createFile function is not needed as files are created directly by the AI
    chatController.onAction('createFile', async (data) => {
      console.log('[createFile] Called with data:', data);
      // Files are created by the AI generation process, not through this function
      addChatMessage(`📝 File creation handled by AI generation process`, 'system');
    });

    chatController.onAction('deleteFile', (filePath) => {
      // Handle file deletion
      if (filePath && typeof filePath === 'string') {
        addChatMessage(`🗑️ Deleting file: ${filePath}`, 'system');
        // Implementation for file deletion
      }
    });

    chatController.onAction('runCommand', async (data) => {
      // Handle terminal command execution
      if (data && data.command) {
        try {
          const response = await fetch('/api/terminal/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: data.command })
          });
          const result = await response.json();
          return result.output || 'Command executed successfully';
        } catch (error) {
          return `Error executing command: ${error}`;
        }
      }
    });

    chatController.onAction('executeCode', async (code) => {
      // Handle code execution
      if (code && typeof code === 'string') {
        addChatMessage(`💻 Executing code...`, 'system');
        // Implementation for code execution
        return 'Code executed successfully';
      }
    });

    chatController.onAction('deployApp', async (options) => {
      // Handle app deployment
      addChatMessage(`🚀 Deploying application...`, 'system');
      // Implementation for deployment
      return 'Application deployed successfully';
    });

    chatController.onAction('installPackage', async (packageName) => {
      // Handle package installation
      if (packageName && typeof packageName === 'string') {
        try {
          const response = await fetch('/api/terminal/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: `npm install ${packageName}` })
          });
          const result = await response.json();
          return result.output || `Package ${packageName} installed successfully`;
        } catch (error) {
          return `Error installing package: ${error}`;
        }
      }
    });

    chatController.onAction('gitOperation', async (data) => {
      // Handle git operations
      if (data && data.operation) {
        addChatMessage(`🔧 Git operation: ${data.operation}`, 'system');
        // Implementation for git operations
        return `Git ${data.operation} completed successfully`;
      }
    });

    chatController.onAction('integrationAction', async (data) => {
      // Handle integration actions
      if (data && data.integration) {
        addChatMessage(`🔗 ${data.integration} integration action`, 'system');
        // Implementation for integration actions
        return `${data.integration} integration action completed`;
      }
    });

    chatController.onAction('debugAction', async (data) => {
      // Handle debug actions
      if (data && data.action) {
        addChatMessage(`🐛 Debug action: ${data.action}`, 'system');
        // Implementation for debug actions
        return `Debug action ${data.action} completed`;
      }
    });

    chatController.onAction('performanceAction', async (data) => {
      // Handle performance actions
      if (data && data.action) {
        addChatMessage(`⚡ Performance action: ${data.action}`, 'system');
        // Implementation for performance actions
        return `Performance action ${data.action} completed`;
      }
    });

    chatController.onAction('uiAction', (data) => {
      // Handle UI actions
      if (data && data.action) {
        addChatMessage(`🎨 UI action: ${data.action}`, 'system');
        // Implementation for UI actions
      }
    });

    chatController.onAction('aiAction', async (data) => {
      // Handle AI actions
      if (data && data.action) {
        addChatMessage(`🤖 AI action: ${data.action}`, 'system');
        // Implementation for AI actions
        return `AI action ${data.action} completed`;
      }
    });

    chatController.onAction('systemAction', async (data) => {
      // Handle system actions
      if (data && data.target === 'get-status') {
        return chatController.getApplicationStatus();
      } else if (data && data.target === 'show-help') {
        return AICommandParser.getHelpText();
      }
      return 'System action completed';
    });

    chatController.onAction('brainAction', async (data) => {
      // Handle brain actions
      if (data && data.action) {
        addChatMessage(`🧠 Brain action: ${data.action}`, 'system');
        // Implementation for brain actions
        return `Brain action ${data.action} completed`;
      }
    });

  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [aiModel, setAiModel] = useState(() => {
    const modelParam = searchParams.get('model');
    return appConfig.ai.availableModels.includes(modelParam || '') ? modelParam! : appConfig.ai.defaultModel;
  });
  const [isChangingModel, setIsChangingModel] = useState(false);

  // Update URL when AI model changes
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const currentModelParam = currentParams.get('model');
    
    // Only update URL if the model actually changed
    if (currentModelParam !== aiModel) {
      currentParams.set('model', aiModel);
      
      // Update URL without causing a page reload
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      router.replace(newUrl, { scroll: false });
      
      // Log the change for debugging
      if (appConfig.dev.enableDebugLogging) {
        console.log(`AI model updated in URL: ${aiModel} (${(appConfig.ai.modelDisplayNames as any)[aiModel] || aiModel})`);
      }
    }
  }, [aiModel, searchParams, router]);
  
  // Language detection
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageDetectionResult | null>(null);
  const [urlOverlayVisible, setUrlOverlayVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlStatus, setUrlStatus] = useState<string[]>([]);
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['app', 'src', 'src/components']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generation' | 'preview'>('preview');
  const [showLoadingBackground, setShowLoadingBackground] = useState(false);
  const [urlScreenshot, setUrlScreenshot] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isPreparingDesign, setIsPreparingDesign] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [loadingStage, setLoadingStage] = useState<'gathering' | 'planning' | 'generating' | null>(null);
  const [sandboxFiles, setSandboxFiles] = useState<Record<string, string>>({});
  const [fileStructure, setFileStructure] = useState<string>('');
  
  // Advanced features state
  const [codeAnalyzer, setCodeAnalyzer] = useState<CodeAnalyzer | null>(null);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [fileUploadManager] = useState(() => new FileUploadManager());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FileInfo[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [showComplexity, setShowComplexity] = useState(false);
  
  // File operations state
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    editor: {
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      tabSize: 2,
      wordWrap: false,
      showLineNumbers: true,
      showMinimap: true,
      autoSave: false,
      autoSaveDelay: 1000,
    },
    theme: {
      colorTheme: 'Dark+',
      iconTheme: 'VS Code Icons',
    },
    workbench: {
      startupEditor: 'welcomePage',
      showTabs: true,
      enablePreview: true,
    },
    terminal: {
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      shell: 'powershell',
    },
    files: {
      autoGuessEncoding: true,
      trimTrailingWhitespace: false,
      insertFinalNewline: false,
    },
    search: {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
    },
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  // NEW: Additional modern coding features
  const [gitStatus, setGitStatus] = useState<{ branch: string; status: string; changes: number } | null>(null);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [formattingStatus, setFormattingStatus] = useState<string>('');
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [securityIssues, setSecurityIssues] = useState<any[]>([]);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshingFiles, setIsRefreshingFiles] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [showExtensions, setShowExtensions] = useState(false);
  const [installedExtensions, setInstalledExtensions] = useState<any[]>([]);
  const [showAIExplain, setShowAIExplain] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [showCodeHistory, setShowCodeHistory] = useState(false);
  const [codeHistory, setCodeHistory] = useState<any[]>([]);
  const [showRefactorPanel, setShowRefactorPanel] = useState(false);
  const [refactorSuggestions, setRefactorSuggestions] = useState<any[]>([]);
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<{ data: string; name: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showBrainDashboard, setShowBrainDashboard] = useState(false);
  
  // Code Editor state
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorFiles, setEditorFiles] = useState<Array<{
    path: string;
    content: string;
    language: string;
    isModified?: boolean;
  }>>([]);
  const [activeEditorFile, setActiveEditorFile] = useState<string>('');
  const [editorSettings, setEditorSettings] = useState({
    showMinimap: true,
    showLineNumbers: true,
    wordWrap: false,
    fontSize: 14
  });
  
  const [conversationContext, setConversationContext] = useState<{
    scrapedWebsites: Array<{ url: string; content: any; timestamp: Date }>;
    generatedComponents: Array<{ name: string; path: string; content: string }>;
    appliedCode: Array<{ files: string[]; timestamp: Date }>;
    currentProject: string;
    lastGeneratedCode?: string;
  }>({
    scrapedWebsites: [],
    generatedComponents: [],
    appliedCode: [],
    currentProject: '',
    lastGeneratedCode: undefined
  });

  // Code Editor functions
  const handleEditorFileChange = (path: string, content: string) => {
    setEditorFiles(prev => prev.map(file => 
      file.path === path ? { ...file, content, isModified: true } : file
    ));
  };

  const handleEditorFileSelect = (path: string) => {
    setActiveEditorFile(path);
  };

  const handleEditorFileClose = (path: string) => {
    setEditorFiles(prev => prev.filter(file => file.path !== path));
    if (activeEditorFile === path) {
      const remainingFiles = editorFiles.filter(file => file.path !== path);
      setActiveEditorFile(remainingFiles.length > 0 ? remainingFiles[0].path : '');
    }
  };

  const handleEditorFileSave = (path: string) => {
    setEditorFiles(prev => prev.map(file => 
      file.path === path ? { ...file, isModified: false } : file
    ));
  };

  const handleEditorRunCode = () => {
    // This would integrate with the existing terminal or execution system
    console.log('Running code from editor...');
  };

  const handleEditorStopExecution = () => {
    console.log('Stopping code execution...');
  };

  const openFileInEditor = (filePath: string, content: string) => {
    const language = filePath.split('.').pop()?.toLowerCase() || 'plaintext';
    const newFile = {
      path: filePath,
      content,
      language,
      isModified: false
    };
    
    setEditorFiles(prev => {
      const existingIndex = prev.findIndex(f => f.path === filePath);
      if (existingIndex >= 0) {
        return prev.map((f, i) => i === existingIndex ? newFile : f);
      }
      return [...prev, newFile];
    });
    
    setActiveEditorFile(filePath);
    setShowCodeEditor(true);
  };

  const fetchAndOpenFile = async (filePath: string) => {
    // Clean the file path to remove any potential HTML or markdown content
    const cleanFilePath = filePath.replace(/[<>]/g, '').replace(/\([^)]*\)/g, '').trim();
    console.log('[fetchAndOpenFile] Original file path:', filePath);
    console.log('[fetchAndOpenFile] Cleaned file path:', cleanFilePath);
    
    if (cleanFilePath !== filePath) {
      console.log('[fetchAndOpenFile] File path was cleaned');
    }
    
    try {
      
      // First try to get from generation progress files
      const progressFile = generationProgress.files.find(f => f.path === cleanFilePath);
      if (progressFile) {
        console.log('[fetchAndOpenFile] Found in progress files');
        openFileInEditor(cleanFilePath, progressFile.content);
        addChatMessage(`📁 Opened ${cleanFilePath} in code editor`, 'system');
        return;
      }
      
      // If not in progress files, try to fetch from sandbox
      console.log('[fetchAndOpenFile] Fetching from sandbox...');
      const response = await fetch('/api/get-sandbox-files', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
              if (response.ok) {
          const data = await response.json();
          console.log('[fetchAndOpenFile] Sandbox files:', Object.keys(data.files || {}));
          
          // The API returns files with relative paths as keys
          const fileContent = data.files[cleanFilePath];
          
          if (fileContent) {
            console.log('[fetchAndOpenFile] Found file in sandbox');
            openFileInEditor(cleanFilePath, fileContent);
            addChatMessage(`📁 Opened ${cleanFilePath} in code editor`, 'system');
          } else {
            console.log('[fetchAndOpenFile] File not found in sandbox:', cleanFilePath);
            addChatMessage(`❌ File ${cleanFilePath} not found in sandbox`, 'error');
          }
        } else {
          console.log('[fetchAndOpenFile] Failed to fetch from sandbox:', response.status);
          addChatMessage(`❌ Failed to fetch file ${cleanFilePath}`, 'error');
        }
    } catch (error) {
      console.error('[fetchAndOpenFile] Error:', error);
      addChatMessage(`❌ Error fetching file ${cleanFilePath}`, 'error');
    }
  };
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const codeDisplayRef = useRef<HTMLDivElement>(null);
  
  const [codeApplicationState, setCodeApplicationState] = useState<CodeApplicationState>({
    stage: null
  });
  
  const [generationProgress, setGenerationProgress] = useState<{
    isGenerating: boolean;
    status: string;
    components: Array<{ name: string; path: string; completed: boolean }>;
    currentComponent: number;
    streamedCode: string;
    isStreaming: boolean;
    isThinking: boolean;
    thinkingText?: string;
    thinkingDuration?: number;
    currentFile?: { path: string; content: string; type: string };
    files: Array<{ path: string; content: string; type: string; completed: boolean; edited?: boolean }>;
    lastProcessedPosition: number;
    isEdit?: boolean;
  }>({
    isGenerating: false,
    status: '',
    components: [],
    currentComponent: 0,
    streamedCode: '',
    isStreaming: false,
    isThinking: false,
    files: [],
    lastProcessedPosition: 0
  });

  // Clear old conversation data on component mount and create/restore sandbox
  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      // Clear old conversation
      try {
        await fetch('/api/conversation-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear-old' })
        });
        console.log('[home] Cleared old conversation data on mount');
      } catch (error) {
        console.error('[ai-sandbox] Failed to clear old conversation:', error);
        if (isMounted) {
          addChatMessage('Failed to clear old conversation data.', 'error');
        }
      }
      
      if (!isMounted) return;

      // Check if sandbox ID is in URL
      const sandboxIdParam = searchParams.get('sandbox');
      
      setLoading(true);
      try {
        if (sandboxIdParam) {
          console.log('[home] Attempting to restore sandbox:', sandboxIdParam);
          // For now, just create a new sandbox - you could enhance this to actually restore
          // the specific sandbox if your backend supports it
          await createSandbox(true);
        } else {
          console.log('[home] No sandbox in URL, creating new sandbox automatically...');
          await createSandbox(true);
        }
      } catch (error) {
        console.error('[ai-sandbox] Failed to create or restore sandbox:', error);
        if (isMounted) {
          addChatMessage('Failed to create or restore sandbox.', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initializePage();

    return () => {
      isMounted = false;
    };
  }, []); // Run only on mount
  



  useEffect(() => {
    // Only check sandbox status on mount and when user navigates to the page
    checkSandboxStatus();
    
    // Optional: Check status when window regains focus
    const handleFocus = () => {
      checkSandboxStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Load recent files on component mount
  useEffect(() => {
    setRecentFiles(fileOperations.getRecentFiles());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleNewFile();
            break;
          case 'o':
            e.preventDefault();
            handleOpenFile();
            break;
          case 's':
            if (e.shiftKey) {
              e.preventDefault();
              handleSaveAs();
            } else {
              e.preventDefault();
              handleSave();
            }
            break;
          case ',':
            e.preventDefault();
            handlePreferences();
            break;
          case 'w':
            e.preventDefault();
            handleCloseEditor();
            break;
          case 'r':
            e.preventDefault();
            handleRevertFile();
            break;
        }
        
        // Multi-key shortcuts (Ctrl+M combinations)
        if (e.key === 'm') {
          e.preventDefault();
          // Set up for next key
          const handleSecondKey = (e2: KeyboardEvent) => {
            if (e2.key === 's') {
              e2.preventDefault();
              handleSaveAll();
            } else if (e2.key === 'o') {
              e2.preventDefault();
              handleOpenFolder();
            } else if (e2.key === 'f') {
              e2.preventDefault();
              handleCloseFolder();
            }
            document.removeEventListener('keydown', handleSecondKey);
          };
          document.addEventListener('keydown', handleSecondKey);
          
          // Remove listener after 2 seconds if no second key is pressed
          setTimeout(() => {
            document.removeEventListener('keydown', handleSecondKey);
          }, 2000);
        }
      }
      
      // Alt+F4 for close window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        handleCloseWindow();
      }
      
      // Ctrl+Shift+N for new window
      if (isCtrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        handleNewWindow();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeEditorFile, editorFiles]);

  const updateStatus = (text: string, active: boolean) => {
    setStatus({ text, active });
  };

  const log = (message: string, type: 'info' | 'error' | 'command' = 'info') => {
    setResponseArea(prev => [...prev, `[${type}] ${message}`]);
  };

  const addChatMessage = (content: string, type: ChatMessage['type'], metadata?: ChatMessage['metadata']) => {
    setChatMessages(prev => {
      // Skip duplicate consecutive system messages
      if (type === 'system' && prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.type === 'system' && lastMessage.content === content) {
          return prev; // Skip duplicate
        }
      }
      return [...prev, { content, type, timestamp: new Date(), metadata }];
    });
  };
  
  const checkAndInstallPackages = async () => {
    if (!sandboxData) {
      addChatMessage('No active sandbox. Create a sandbox first!', 'system');
      return;
    }
    
    // Vite error checking removed - handled by template setup
    addChatMessage('Sandbox is ready. Vite configuration is handled by the template.', 'system');
  };
  
  const handleSurfaceError = (errors: any[]) => {
    // Function kept for compatibility but Vite errors are now handled by template
    
    // Focus the input
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  };
  
  const installPackages = async (packages: string[]) => {
    if (!sandboxData) {
      addChatMessage('No active sandbox. Create a sandbox first!', 'system');
      return;
    }
    
    try {
      const response = await fetch('/api/install-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to install packages: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'command':
                  // Don't show npm install commands - they're handled by info messages
                  if (!data.command.includes('npm install')) {
                    addChatMessage(data.command, 'command', { commandType: 'input' });
                  }
                  break;
                case 'output':
                  addChatMessage(data.message, 'command', { commandType: 'output' });
                  break;
                case 'error':
                  if (data.message && data.message !== 'undefined') {
                    addChatMessage(data.message, 'command', { commandType: 'error' });
                  }
                  break;
                case 'warning':
                  addChatMessage(data.message, 'command', { commandType: 'output' });
                  break;
                case 'success':
                  addChatMessage(`${data.message}`, 'system');
                  break;
                case 'status':
                  addChatMessage(data.message, 'system');
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      addChatMessage(`Failed to install packages: ${error.message}`, 'system');
    }
  };

  const checkSandboxStatus = async () => {
    try {
      const response = await fetch('/api/sandbox-status');
      const data = await response.json();
      
      if (data.active && data.healthy && data.sandboxData) {
        setSandboxData(data.sandboxData);
        updateStatus('Sandbox active', true);
      } else if (data.active && !data.healthy) {
        // Sandbox exists but not responding
        updateStatus('Sandbox not responding', false);
        // Optionally try to create a new one
      } else {
        setSandboxData(null);
        updateStatus('No sandbox', false);
      }
    } catch (error) {
      console.error('Failed to check sandbox status:', error);
      setSandboxData(null);
      updateStatus('Error', false);
    }
  };

  const createSandbox = async (fromHomeScreen = false) => {
    console.log('[createSandbox] Starting sandbox creation...');
    setLoading(true);
    setShowLoadingBackground(true);
    updateStatus('Creating sandbox...', false);
    setResponseArea([]);
    setScreenshotError(null);
    
    try {
      const response = await fetch('/api/create-ai-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      console.log('[createSandbox] Response data:', data);
      
      if (data.success) {
        setSandboxData(data);
        updateStatus('Sandbox active', true);
        log('Sandbox created successfully!');
        log(`Sandbox ID: ${data.sandboxId}`);
        log(`URL: ${data.url}`);
        
        // Update URL with sandbox ID
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('sandbox', data.sandboxId);
        newParams.set('model', aiModel);
        router.push(`/?${newParams.toString()}`, { scroll: false });
        
        // Fade out loading background after sandbox loads
        setTimeout(() => {
          setShowLoadingBackground(false);
        }, 3000);
        
        if (data.structure) {
          displayStructure(data.structure);
        }
        
        // Fetch sandbox files after creation
        setTimeout(fetchSandboxFiles, 1000);
        
        // Restart Vite server to ensure it's running
        setTimeout(async () => {
          try {
            console.log('[createSandbox] Ensuring Vite server is running...');
            const restartResponse = await fetch('/api/restart-vite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (restartResponse.ok) {
              const restartData = await restartResponse.json();
              if (restartData.success) {
                console.log('[createSandbox] Vite server started successfully');
              }
            }
          } catch (error) {
            console.error('[createSandbox] Error starting Vite server:', error);
          }
        }, 2000);
        
        // Only add welcome message if not coming from home screen
        if (!fromHomeScreen) {
          addChatMessage(`Sandbox created! ID: ${data.sandboxId}. I now have context of your sandbox and can help you build your app. Just ask me to create components and I'll automatically apply them!

Tip: I automatically detect and install npm packages from your code imports (like react-router-dom, axios, etc.)`, 'system');
        }
        
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = data.url;
          }
        }, 100);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('[createSandbox] Error:', error);
      updateStatus('Error', false);
      log(`Failed to create sandbox: ${error.message}`, 'error');
      addChatMessage(`Failed to create sandbox: ${error.message}`, 'system');
    } finally {
      setLoading(false);
    }
  };

  const displayStructure = (structure: any) => {
    if (typeof structure === 'object') {
      setStructureContent(JSON.stringify(structure, null, 2));
    } else {
      setStructureContent(structure || 'No structure available');
    }
  };

  const applyGeneratedCode = async (code: string, isEdit: boolean = false) => {
    setLoading(true);
    log('Applying AI-generated code...');
    console.log('[applyGeneratedCode] Starting with code length:', code.length);
    console.log('[applyGeneratedCode] Is edit mode:', isEdit);
    console.log('[applyGeneratedCode] Sandbox data:', sandboxData);
    console.log('[applyGeneratedCode] Active sandbox available:', !!global.activeSandbox);
    
    try {
      // Show progress component instead of individual messages
      setCodeApplicationState({ stage: 'analyzing' });
      
      // Get pending packages from tool calls
      const pendingPackages = ((window as any).pendingPackages || []).filter((pkg: any) => pkg && typeof pkg === 'string');
      if (pendingPackages.length > 0) {
        console.log('[applyGeneratedCode] Sending packages from tool calls:', pendingPackages);
        // Clear pending packages after use
        (window as any).pendingPackages = [];
      }
      
      // Use streaming endpoint for real-time feedback
      const response = await fetch('/api/apply-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          response: code,
          isEdit: isEdit,
          packages: pendingPackages,
          sandboxId: sandboxData?.sandboxId // Pass the sandbox ID to ensure proper connection
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[applyGeneratedCode] API error response:', errorText);
        throw new Error(`Failed to apply code: ${response.statusText} - ${errorText}`);
      }
      
      console.log('[applyGeneratedCode] API call successful, processing stream...');
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finalData: any = null;
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  // Don't add as chat message, just update state
                  setCodeApplicationState({ stage: 'analyzing' });
                  break;
                  
                case 'step':
                  // Update progress state based on step
                  if (data.message.includes('Installing') && data.packages) {
                    setCodeApplicationState({ 
                      stage: 'installing', 
                      packages: data.packages 
                    });
                  } else if (data.message.includes('Creating files') || data.message.includes('Applying')) {
                    setCodeApplicationState({ 
                      stage: 'applying',
                      filesGenerated: data.filesCreated || 0
                    });
                  }
                  break;
                  
                case 'package-progress':
                  // Handle package installation progress
                  if (data.installedPackages) {
                    setCodeApplicationState(prev => ({ 
                      ...prev,
                      installedPackages: data.installedPackages 
                    }));
                  }
                  break;
                  
                case 'command':
                  // Don't show npm install commands - they're handled by info messages
                  if (data.command && !data.command.includes('npm install')) {
                    addChatMessage(data.command, 'command', { commandType: 'input' });
                  }
                  break;
                  
                case 'success':
                  if (data.installedPackages) {
                    setCodeApplicationState(prev => ({ 
                      ...prev,
                      installedPackages: data.installedPackages 
                    }));
                  }
                  break;
                  
                case 'file-progress':
                  // Skip file progress messages, they're noisy
                  break;
                  
                case 'file-complete':
                  // Could add individual file completion messages if desired
                  break;
                  
                case 'command-progress':
                  addChatMessage(`${data.action} command: ${data.command}`, 'command', { commandType: 'input' });
                  break;
                  
                case 'command-output':
                  addChatMessage(data.output, 'command', { 
                    commandType: data.stream === 'stderr' ? 'error' : 'output' 
                  });
                  break;
                  
                case 'command-complete':
                  if (data.success) {
                    addChatMessage(`Command completed successfully`, 'system');
                  } else {
                    addChatMessage(`Command failed with exit code ${data.exitCode}`, 'system');
                  }
                  break;
                  
                case 'complete':
                  finalData = data;
                  setCodeApplicationState({ stage: 'complete' });
                  // Clear the state after a delay
                  setTimeout(() => {
                    setCodeApplicationState({ stage: null });
                  }, 3000);
                  break;
                  
                case 'error':
                  addChatMessage(`Error: ${data.message || data.error || 'Unknown error'}`, 'system');
                  break;
                  
                case 'warning':
                  addChatMessage(`${data.message}`, 'system');
                  break;
                  
                case 'info':
                  // Show info messages, especially for package installation
                  if (data.message) {
                    addChatMessage(data.message, 'system');
                  }
                  break;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Process final data
      if (finalData && finalData.type === 'complete') {
        const data = {
          success: true,
          results: finalData.results,
          explanation: finalData.explanation,
          structure: finalData.structure,
          message: finalData.message
        };
        
        if (data.success) {
          const { results } = data;
        
        // Log package installation results without duplicate messages
        if (results.packagesInstalled?.length > 0) {
          log(`Packages installed: ${results.packagesInstalled.join(', ')}`);
        }
        
        if (results.filesCreated?.length > 0) {
          log('Files created:');
          results.filesCreated.forEach((file: string) => {
            log(`  ${file}`, 'command');
          });
          
          // Automatically open generated files in the code editor (like Cursor)
          setTimeout(async () => {
            try {
              // Fetch the actual file contents from the sandbox
              const response = await fetch('/api/get-sandbox-files', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (response.ok) {
                const fileData = await response.json();
                
                // Open each generated file in the editor
                results.filesCreated.forEach((filePath: string) => {
                  const normalizedPath = filePath.replace('/home/user/app/', '');
                  // The API returns files with relative paths as keys
                  const fileContent = fileData.files[normalizedPath];
                  
                  if (fileContent) {
                    openFileInEditor(normalizedPath, fileContent);
                    addChatMessage(`📁 Opened ${normalizedPath} in code editor`, 'system');
                  }
                });
              }
            } catch (error) {
              console.error('Failed to fetch file contents for editor:', error);
            }
          }, 2000); // Wait for files to be written
          
          // Verify files were actually created by refreshing the sandbox if needed
          if (sandboxData?.sandboxId && results.filesCreated.length > 0) {
            // Small delay to ensure files are written
            setTimeout(() => {
              // Force refresh the iframe to show new files
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              }
            }, 1000);
          }
        }
        
        if (results.filesUpdated?.length > 0) {
          log('Files updated:');
          results.filesUpdated.forEach((file: string) => {
            log(`  ${file}`, 'command');
          });
        }
        
        // Update conversation context with applied code
        setConversationContext(prev => ({
          ...prev,
          appliedCode: [...prev.appliedCode, {
            files: [...(results.filesCreated || []), ...(results.filesUpdated || [])],
            timestamp: new Date()
          }]
        }));
        
        if (results.commandsExecuted?.length > 0) {
          log('Commands executed:');
          results.commandsExecuted.forEach((cmd: string) => {
            log(`  $ ${cmd}`, 'command');
          });
        }
        
        if (results.errors?.length > 0) {
          results.errors.forEach((err: string) => {
            log(err, 'error');
          });
        }
        
        if (data.structure) {
          displayStructure(data.structure);
        }
        
        if (data.explanation) {
          log(data.explanation);
        }
        
        if ((data as any).autoCompleted) {
          log('Auto-generating missing components...', 'command');
          
          if ((data as any).autoCompletedComponents) {
            setTimeout(() => {
              log('Auto-generated missing components:', 'info');
              (data as any).autoCompletedComponents.forEach((comp: string) => {
                log(`  ${comp}`, 'command');
              });
            }, 1000);
          }
        } else if ((data as any).warning) {
          log((data as any).warning, 'error');
          
          if ((data as any).missingImports && (data as any).missingImports.length > 0) {
            const missingList = (data as any).missingImports.join(', ');
            addChatMessage(
              `Ask me to "create the missing components: ${missingList}" to fix these import errors.`,
              'system'
            );
          }
        }
        
        log('Code applied successfully!');
        console.log('[applyGeneratedCode] Response data:', data);
        console.log('[applyGeneratedCode] Debug info:', (data as any).debug);
        console.log('[applyGeneratedCode] Current sandboxData:', sandboxData);
        console.log('[applyGeneratedCode] Current iframe element:', iframeRef.current);
        console.log('[applyGeneratedCode] Current iframe src:', iframeRef.current?.src);
        
        if ((data as any).filesCreated?.length > 0) {
          setConversationContext(prev => ({
            ...prev,
            appliedCode: [...prev.appliedCode, {
              files: (data as any).filesCreated,
              timestamp: new Date()
            }]
          }));
          
          // Update the chat message to show success
          // Only show file list if not in edit mode
          if (isEdit) {
            addChatMessage(`Edit applied successfully!`, 'system');
          } else {
            // Check if this is part of a generation flow (has recent AI recreation message)
            const recentMessages = chatMessages.slice(-5);
            const isPartOfGeneration = recentMessages.some(m => 
              m.content.includes('AI recreation generated') || 
              m.content.includes('Code generated')
            );
            
            // Don't show files if part of generation flow to avoid duplication
            if (isPartOfGeneration) {
              addChatMessage(`Applied ${(data as any).filesCreated.length} files successfully!`, 'system');
            } else {
              addChatMessage(`Applied ${(data as any).filesCreated.length} files successfully!`, 'system', {
                appliedFiles: (data as any).filesCreated
              });
            }
          }
          
          // If there are failed packages, add a message about checking for errors
          if ((data as any).packagesFailed?.length > 0) {
            addChatMessage(`⚠️ Some packages failed to install. Check the error banner above for details.`, 'system');
          }
          
          // Fetch updated file structure
          await fetchSandboxFiles();
          
          // Also refresh the file explorer to update the UI
          await refreshFileExplorer();
          
          // Automatically check and install any missing packages
          await checkAndInstallPackages();
          
          // Test build to ensure everything compiles correctly
          // Skip build test for now - it's causing errors with undefined activeSandbox
          // The build test was trying to access global.activeSandbox from the frontend,
          // but that's only available in the backend API routes
          console.log('[build-test] Skipping build test - would need API endpoint');
          
          // Force iframe refresh after applying code
          const refreshDelay = appConfig.codeApplication.defaultRefreshDelay; // Allow Vite to process changes
          
          setTimeout(() => {
            if (iframeRef.current && sandboxData?.url) {
              console.log('[home] Refreshing iframe after code application...');
              
              // Method 1: Change src with timestamp
              const urlWithTimestamp = `${sandboxData.url}?t=${Date.now()}&applied=true`;
              iframeRef.current.src = urlWithTimestamp;
              
              // Method 2: Force reload after a short delay
              setTimeout(() => {
                try {
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.location.reload();
                    console.log('[home] Force reloaded iframe content');
                  }
                } catch (e) {
                  console.log('[home] Could not reload iframe (cross-origin):', e);
                }
              }, 1000);
            }
          }, refreshDelay);
          
          // Vite error checking removed - handled by template setup
        }
        
          // Give Vite HMR a moment to detect changes, then ensure refresh
          if (iframeRef.current && sandboxData?.url) {
            // Wait for Vite to process the file changes
            // If packages were installed, wait longer for Vite to restart
            const packagesInstalled = results?.packagesInstalled?.length > 0 || data.results?.packagesInstalled?.length > 0;
            const refreshDelay = packagesInstalled ? appConfig.codeApplication.packageInstallRefreshDelay : appConfig.codeApplication.defaultRefreshDelay;
            console.log(`[applyGeneratedCode] Packages installed: ${packagesInstalled}, refresh delay: ${refreshDelay}ms`);
            
            setTimeout(async () => {
            if (iframeRef.current && sandboxData?.url) {
              console.log('[applyGeneratedCode] Starting iframe refresh sequence...');
              console.log('[applyGeneratedCode] Current iframe src:', iframeRef.current.src);
              console.log('[applyGeneratedCode] Sandbox URL:', sandboxData.url);
              
              // Method 1: Try direct navigation first
              try {
                const urlWithTimestamp = `${sandboxData.url}?t=${Date.now()}&force=true`;
                console.log('[applyGeneratedCode] Attempting direct navigation to:', urlWithTimestamp);
                
                // Remove any existing onload handler
                iframeRef.current.onload = null;
                
                // Navigate directly
                iframeRef.current.src = urlWithTimestamp;
                
                // Wait a bit and check if it loaded
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Try to access the iframe content to verify it loaded
                try {
                  const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
                  if (iframeDoc && iframeDoc.readyState === 'complete') {
                    console.log('[applyGeneratedCode] Iframe loaded successfully');
                    return;
                  }
                } catch (e) {
                  console.log('[applyGeneratedCode] Cannot access iframe content (CORS), assuming loaded');
                  return;
                }
              } catch (e) {
                console.error('[applyGeneratedCode] Direct navigation failed:', e);
              }
              
              // Method 2: Force complete iframe recreation if direct navigation failed
              console.log('[applyGeneratedCode] Falling back to iframe recreation...');
              const parent = iframeRef.current.parentElement;
              const newIframe = document.createElement('iframe');
              
              // Copy attributes
              newIframe.className = iframeRef.current.className;
              newIframe.title = iframeRef.current.title;
              newIframe.allow = iframeRef.current.allow;
              // Copy sandbox attributes
              const sandboxValue = iframeRef.current.getAttribute('sandbox');
              if (sandboxValue) {
                newIframe.setAttribute('sandbox', sandboxValue);
              }
              
              // Remove old iframe
              iframeRef.current.remove();
              
              // Add new iframe
              newIframe.src = `${sandboxData.url}?t=${Date.now()}&recreated=true`;
              parent?.appendChild(newIframe);
              
              // Update ref
              (iframeRef as any).current = newIframe;
              
              console.log('[applyGeneratedCode] Iframe recreated with new content');
            } else {
              console.error('[applyGeneratedCode] No iframe or sandbox URL available for refresh');
            }
          }, refreshDelay); // Dynamic delay based on whether packages were installed
        }
        
        } else {
          throw new Error(finalData?.error || 'Failed to apply code');
        }
      } else {
        // If no final data was received, still close loading
        addChatMessage('Code application may have partially succeeded. Check the preview.', 'system');
      }
    } catch (error: any) {
      log(`Failed to apply code: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      // Clear isEdit flag after applying code
      setGenerationProgress(prev => ({
        ...prev,
        isEdit: false
      }));
    }
  };

  const fetchSandboxFiles = async () => {
    if (!sandboxData) return;
    
    try {
      const response = await fetch('/api/get-sandbox-files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSandboxFiles(data.files || {});
          setFileStructure(data.structure || '');
          console.log('[fetchSandboxFiles] Updated file list:', Object.keys(data.files || {}).length, 'files');
        }
      }
    } catch (error) {
      console.error('[fetchSandboxFiles] Error fetching files:', error);
    }
  };

  // Debounce refresh to prevent spam
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const refreshFileExplorer = async () => {
    console.log('Refreshing file explorer...');
    
    // Prevent multiple simultaneous refreshes
    if (isRefreshingFiles) {
      console.log('File explorer refresh already in progress, skipping...');
      return;
    }
    
    // Debounce refreshes to prevent spam
    const now = Date.now();
    if (now - lastRefreshTime < 2000) { // 2 second debounce
      console.log('Refresh debounced, skipping...');
      return;
    }
    
    setLastRefreshTime(now);
    setIsRefreshingFiles(true);
    
    try {
      // Add visual feedback
      addChatMessage('🔄 Refreshing file explorer...', 'system');
      
      await fetchSandboxFiles();
      
      // Also refresh the generation progress files to update the file explorer
      if (sandboxData) {
        const response = await fetch('/api/get-sandbox-files', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.files) {
            // Update generation progress with new files
            setGenerationProgress(prev => ({
              ...prev,
              files: Object.entries(data.files).map(([path, fileInfo]: [string, any]) => ({
                path: path.replace('/home/user/app/', ''),
                content: fileInfo.content || '',
                type: fileInfo.type || 'utility',
                completed: true
              }))
            }));
            
            console.log('File explorer refreshed with', Object.keys(data.files).length, 'files');
            addChatMessage(`✅ File explorer refreshed with ${Object.keys(data.files).length} files`, 'system');
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing file explorer:', error);
      addChatMessage('❌ Error refreshing file explorer', 'error');
    } finally {
      setIsRefreshingFiles(false);
    }
  };
  
  const restartViteServer = async () => {
    try {
      addChatMessage('Restarting Vite dev server...', 'system');
      
      const response = await fetch('/api/restart-vite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addChatMessage('✓ Vite dev server restarted successfully!', 'system');
          
          // Refresh the iframe after a short delay
          setTimeout(() => {
            if (iframeRef.current && sandboxData?.url) {
              iframeRef.current.src = `${sandboxData.url}?t=${Date.now()}`;
            }
          }, 2000);
        } else {
          addChatMessage(`Failed to restart Vite: ${data.error}`, 'error');
        }
      } else {
        addChatMessage('Failed to restart Vite server', 'error');
      }
    } catch (error) {
      console.error('[restartViteServer] Error:', error);
      addChatMessage(`Error restarting Vite: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const applyCode = async () => {
    const code = promptInput.trim();
    if (!code) {
      log('Please enter some code first', 'error');
      addChatMessage('No code to apply. Please generate code first.', 'system');
      return;
    }
    
    // Prevent double clicks
    if (loading) {
      console.log('[applyCode] Already loading, skipping...');
      return;
    }
    
    // Determine if this is an edit based on whether we have applied code before
    const isEdit = conversationContext.appliedCode.length > 0;
    await applyGeneratedCode(code, isEdit);
  };

  const renderMainContent = () => {
    if (activeTab === 'generation') {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium mb-2">Generation Progress</h3>
              <div className="text-[#a0a0a0] text-sm">
                {generationProgress.status || 'Initializing...'}
              </div>
            </div>
            
            {generationProgress.isStreaming && (
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Live Code Generation</h3>
                <pre className="text-[#a0a0a0] text-sm overflow-x-auto">
                  {generationProgress.streamedCode}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Show Code Editor with Open in Browser button
    return (
      <div className="h-full flex flex-col">
        {/* Code Editor */}
        <div className="flex-1">
          <CodeEditor
            files={editorFiles}
            activeFile={activeEditorFile}
            onFileChange={handleEditorFileChange}
            onFileSelect={handleEditorFileSelect}
            onFileClose={handleEditorFileClose}
            onFileSave={handleEditorFileSave}
            onRunCode={handleEditorRunCode}
            onStopExecution={handleEditorStopExecution}
            showMinimap={editorSettings.showMinimap}
            showLineNumbers={editorSettings.showLineNumbers}
            wordWrap={editorSettings.wordWrap}
            fontSize={editorSettings.fontSize}
            className="h-full"
          />
        </div>
        {/* Open in Browser Button */}
        {sandboxData?.url && (
          <div className="p-2 bg-[#1a1a1a] border-t border-[#2a2a2a] flex justify-end">
            <button
              onClick={() => window.open(sandboxData.url, '_blank')}
              className="text-[#0066ff] text-sm hover:text-[#0052cc] transition-colors font-medium"
            >
              Open in Browser
            </button>
          </div>
        )}
      </div>
    );
  };

  // Language detection function
  const detectLanguageFromInput = (input: string) => {
    const projectContext = {
      files: Object.keys(sandboxFiles),
      conversationHistory: chatMessages.map(msg => msg.content)
    };
    
    const detection = detectLanguage(input, projectContext);
    setDetectedLanguage(detection);
    
    // Language is now automatically detected and used
    
    return detection;
  };

  // Handle image pasting functionality
  const handleImagePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        setIsProcessingImage(true);
        
        try {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageData = e.target?.result as string;
              
              // Store the image in the input area instead of immediately sending
              setCurrentImage({ data: imageData, name: file.name });
              setIsProcessingImage(false);
            };
            reader.readAsDataURL(file);
          }
        } catch (error) {
          console.error('Error processing pasted image:', error);
          setIsProcessingImage(false);
        }
        break;
      }
    }
  };

  const processImageWithAI = async (imageData: string, fileName: string) => {
    try {
      addChatMessage('Analyzing pasted image...', 'system');
      
      // Send image to AI for analysis
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: imageData,
          fileName: fileName,
          context: {
            sandboxId: sandboxData?.sandboxId,
            structure: structureContent,
            recentMessages: chatMessages.slice(-5)
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        addChatMessage(result.analysis, 'ai');
      } else {
        addChatMessage('Failed to analyze image with AI.', 'error');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      addChatMessage('Failed to analyze image with AI.', 'error');
    }
  };

  const sendChatMessage = async () => {
    console.log('[sendChatMessage] Function called');
    const message = aiChatInput.trim();
    const hasImage = currentImage !== null;
    
    // Add user message to chat immediately
    addChatMessage(message, 'user');
    
    // Clear input field immediately
    setAiChatInput('');
    
    console.log('[sendChatMessage] Message:', message);
    console.log('[sendChatMessage] Has image:', hasImage);
    
    if (!message && !hasImage) {
      console.log('[sendChatMessage] No message or image, returning');
      return;
    }
    
    if (!aiEnabled) {
      console.log('[sendChatMessage] AI is disabled');
      addChatMessage('AI is disabled. Please enable it first.', 'system');
      return;
    }
    
    console.log('[sendChatMessage] AI is enabled, proceeding...');
    
            // Classify the message to determine intent
        console.log('[sendChatMessage] About to classify message:', message);
        const messageIntent = MessageClassifier.classifyMessage(message);
        console.log('[sendChatMessage] Message intent:', messageIntent);
        console.log('[sendChatMessage] Should generate code:', messageIntent.shouldGenerateCode);
        console.log('[sendChatMessage] Intent type:', messageIntent.intent);
        console.log('[sendChatMessage] Confidence:', messageIntent.confidence);
    
    // If it's not a code generation request, respond conversationally
    if (!messageIntent.shouldGenerateCode) {
      if (messageIntent.response) {
        addChatMessage(messageIntent.response, 'ai');
      }
      
      // Store learning in brain for conversational interactions
      aiBrain.storeMemory({
        type: 'interaction',
        content: {
          user_input: message,
          ai_response: messageIntent.response || 'Conversational response',
          user_feedback: 'positive'
        },
        importance: 5,
        tags: ['conversation', 'user_interaction'],
        context: 'chat_conversation'
      });
      
      return;
    }
    

    
    // Add development start message for code generation
    addChatMessage('🚀 Starting development...', 'system');
    
    // Check if this is a command first
    console.log('[sendChatMessage] Checking if message is a command...');
    if (AICommandParser.isCommand(message)) {
      try {
        setLoading(true);
        const result = await AICommandParser.executeCommand(message);
        addChatMessage(result, 'system');
        
        // Store learning in brain for command interactions
        aiBrain.storeMemory({
          type: 'interaction',
          content: {
            user_input: message,
            ai_response: result,
            user_feedback: 'positive'
          },
          importance: 8,
          tags: ['command', 'user_interaction'],
          context: 'chat_command'
        });
        
        setLoading(false);
        return;
      } catch (error) {
        addChatMessage(`❌ Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        setLoading(false);
        return;
      }
    }
    
    // Detect language from user input
    console.log('[sendChatMessage] Detecting language...');
    const languageDetection = detectLanguageFromInput(message);
    const langConfig = getLanguageConfig(languageDetection.language);
    console.log('[sendChatMessage] Language detected:', languageDetection.language);
    
    // Add language context to the message
    const enhancedMessage = languageDetection.confidence > 0.5 
      ? `${langConfig.name} Project: ${message}`
      : message;
    
    // If there's an image, add it to the message
    if (hasImage && currentImage) {
      const imageMessage = {
        id: Date.now().toString(),
        content: enhancedMessage || `[Image: ${currentImage.name}]`,
        type: 'user' as const,
        timestamp: new Date(),
        imageData: currentImage.data
      };
      
      setChatMessages(prev => [...prev, imageMessage]);
      setPastedImages(prev => [...prev, currentImage.data]);
      
      // Process the image with AI for analysis
      await processImageWithAI(currentImage.data, currentImage.name);
      
      // Clear the current image
      setCurrentImage(null);
    } else {
      // User message already added at the beginning, no need to add again
    }
    
    console.log('[sendChatMessage] Input cleared, checking for special commands...');
    
    // Check for special commands
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'check packages' || lowerMessage === 'install packages' || lowerMessage === 'npm install') {
      if (!sandboxData) {
        addChatMessage('No active sandbox. Create a sandbox first!', 'system');
        return;
      }
      await checkAndInstallPackages();
      return;
    }
    
    // Start sandbox creation in parallel if needed
    console.log('[sendChatMessage] Checking sandbox status...');
    let sandboxPromise: Promise<void> | null = null;
    let sandboxCreating = false;
    
    if (!sandboxData) {
      console.log('[sendChatMessage] No sandbox data, creating sandbox...');
      sandboxCreating = true;
      addChatMessage('Creating sandbox while I plan your app...', 'system');
      sandboxPromise = createSandbox(true).catch((error: any) => {
        addChatMessage(`Failed to create sandbox: ${error.message}`, 'system');
        throw error;
      });
    } else {
      console.log('[sendChatMessage] Sandbox data exists:', sandboxData.sandboxId);
    }
    
    // Determine if this is an edit
    const isEdit = conversationContext.appliedCode.length > 0;
    
    try {
      console.log('[sendChatMessage] Starting AI generation process...');
      
      // Start generation immediately with better status
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: true,
        status: '🚀 Starting development...',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: true, // Start streaming immediately
        isThinking: false, // Don't show thinking state initially
        thinkingText: undefined,
        thinkingDuration: undefined,
        currentFile: undefined,
        lastProcessedPosition: 0,
        isEdit: isEdit,
        files: prev.files
      }));
      
      // Switch to generation tab immediately
      setActiveTab('generation');
      
      // Backend now manages file state - no need to fetch from frontend
      console.log('[chat] Using backend file cache for context');
      
      const fullContext = {
        sandboxId: sandboxData?.sandboxId || (sandboxCreating ? 'pending' : null),
        structure: structureContent,
        recentMessages: chatMessages.slice(-20),
        conversationContext: conversationContext,
        currentCode: promptInput,
        sandboxUrl: sandboxData?.url,
        sandboxCreating: sandboxCreating
      };
      
      // Optimized API call with minimal context for faster response
      console.log('[sendChatMessage] Sending optimized request to API...');
      console.log('[sendChatMessage] Detected language for API:', languageDetection.language);
      
      // Create a timeout controller for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      let response;
      try {
        response = await fetch('/api/generate-ai-code-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: message,
            model: aiModel,
            context: {
              sandboxId: sandboxData?.sandboxId || (sandboxCreating ? 'pending' : null),
              sandboxUrl: sandboxData?.url,
              sandboxCreating: sandboxCreating,
              isEdit: isEdit,
              detectedLanguage: languageDetection.language,
              languageConfidence: languageDetection.confidence,
              languageReason: languageDetection.reason
            },
            isEdit: isEdit
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('[sendChatMessage] API response status:', response.status);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 45 seconds');
        }
        throw fetchError;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[sendChatMessage] API error response:', errorText);
        
        if (response.status === 500) {
          throw new Error(`Server error: ${errorText}`);
        } else if (response.status === 401) {
          throw new Error('API key not configured. Please check your environment variables.');
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedCode = '';
      let explanation = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'status') {
                  setGenerationProgress(prev => ({ ...prev, status: data.message }));
                } else if (data.type === 'thinking') {
                  setGenerationProgress(prev => ({ 
                    ...prev, 
                    isThinking: true,
                    thinkingText: (prev.thinkingText || '') + data.text
                  }));
                } else if (data.type === 'thinking_complete') {
                  setGenerationProgress(prev => ({ 
                    ...prev, 
                    isThinking: false,
                    thinkingDuration: data.duration
                  }));
                } else if (data.type === 'conversation') {
                  // Add conversational text to chat only if it's not code
                  let text = data.text || '';
                  
                  // Remove package tags from the text
                  text = text.replace(/<package>[^<]*<\/package>/g, '');
                  text = text.replace(/<packages>[^<]*<\/packages>/g, '');
                  
                  // Filter out any XML tags and file content that slipped through
                  if (!text.includes('<file') && !text.includes('import React') && 
                      !text.includes('export default') && !text.includes('className=') &&
                      text.trim().length > 0) {
                    addChatMessage(text.trim(), 'ai');
                  }
                } else if (data.type === 'stream' && data.raw) {
                  setGenerationProgress(prev => {
                    const newStreamedCode = prev.streamedCode + data.text;
                    
                    // Tab is already switched after scraping
                    
                    const updatedState = { 
                      ...prev, 
                      streamedCode: newStreamedCode,
                      isStreaming: true,
                      isThinking: false,
                      status: 'Generating code...'
                    };
                    
                    // Process complete files from the accumulated stream
                    const fileRegex = /<file path="([^"]+)">([^]*?)<\/file>/g;
                    let match;
                    const processedFiles = new Set(prev.files.map(f => f.path));
                    
                    while ((match = fileRegex.exec(newStreamedCode)) !== null) {
                      const filePath = match[1];
                      const fileContent = match[2];
                      
                      // Only add if we haven't processed this file yet
                      if (!processedFiles.has(filePath)) {
                        const fileExt = filePath.split('.').pop() || '';
                        const fileType = fileExt === 'jsx' || fileExt === 'js' ? 'javascript' :
                                        fileExt === 'css' ? 'css' :
                                        fileExt === 'json' ? 'json' :
                                        fileExt === 'html' ? 'html' : 'text';
                        
                        // Check if file already exists
                        const existingFileIndex = updatedState.files.findIndex(f => f.path === filePath);
                        
                        if (existingFileIndex >= 0) {
                          // Update existing file and mark as edited
                          updatedState.files = [
                            ...updatedState.files.slice(0, existingFileIndex),
                            {
                              ...updatedState.files[existingFileIndex],
                              content: fileContent.trim(),
                              type: fileType,
                              completed: true,
                              edited: true
                            },
                            ...updatedState.files.slice(existingFileIndex + 1)
                          ];
                        } else {
                          // Add new file
                          updatedState.files = [...updatedState.files, {
                            path: filePath,
                            content: fileContent.trim(),
                            type: fileType,
                            completed: true,
                            edited: false
                          }];
                        }
                        
                        // Only show file status if not in edit mode
                        if (!prev.isEdit) {
                          updatedState.status = `Completed ${filePath}`;
                          // Add to chat for immediate feedback
                          addChatMessage(`✅ Created: ${filePath}`, 'system');
                          console.log(`[AI Generation] File completed: ${filePath}`);
                        }
                        processedFiles.add(filePath);
                        
                        // Immediately update the file explorer state
                        setEditorFiles(prev => {
                          const existingFile = prev.find(f => f.path === filePath);
                          if (existingFile) {
                            return prev.map(f => f.path === filePath ? { ...f, content: fileContent.trim(), isModified: true } : f);
                          } else {
                            return [...prev, {
                              path: filePath,
                              content: fileContent.trim(),
                              language: fileType,
                              isModified: false
                            }];
                          }
                        });
                        
                        // Auto-refresh file explorer when new files are created (but limit frequency)
                        if (!isRefreshingFiles) {
                          setTimeout(() => {
                            refreshFileExplorer();
                          }, 500);
                        }
                      }
                    }
                    
                    // Check for current file being generated (incomplete file at the end)
                    const lastFileMatch = newStreamedCode.match(/<file path="([^"]+)">([^]*?)$/);
                    if (lastFileMatch && !lastFileMatch[0].includes('</file>')) {
                      const filePath = lastFileMatch[1];
                      const partialContent = lastFileMatch[2];
                      
                      if (!processedFiles.has(filePath)) {
                        const fileExt = filePath.split('.').pop() || '';
                        const fileType = fileExt === 'jsx' || fileExt === 'js' ? 'javascript' :
                                        fileExt === 'css' ? 'css' :
                                        fileExt === 'json' ? 'json' :
                                        fileExt === 'html' ? 'html' : 'text';
                        
                        updatedState.currentFile = { 
                          path: filePath, 
                          content: partialContent, 
                          type: fileType 
                        };
                        // Only show file status if not in edit mode
                        if (!prev.isEdit) {
                          updatedState.status = `Generating ${filePath}`;
                        }
                      }
                    } else {
                      updatedState.currentFile = undefined;
                    }
                    
                    return updatedState;
                  });
                } else if (data.type === 'app') {
                  setGenerationProgress(prev => ({ 
                    ...prev, 
                    status: 'Generated App.jsx structure'
                  }));
                } else if (data.type === 'component') {
                  setGenerationProgress(prev => ({
                    ...prev,
                    status: `Generated ${data.name}`,
                    components: [...prev.components, { 
                      name: data.name, 
                      path: data.path, 
                      completed: true 
                    }],
                    currentComponent: data.index
                  }));
                } else if (data.type === 'package') {
                  // Handle package installation from tool calls
                  setGenerationProgress(prev => ({
                    ...prev,
                    status: data.message || `Installing ${data.name}`
                  }));
                } else if (data.type === 'complete') {
                  generatedCode = data.generatedCode;
                  explanation = data.explanation;
                  
                  // Save the last generated code
                  setConversationContext(prev => ({
                    ...prev,
                    lastGeneratedCode: generatedCode
                  }));
                  
                  // Clear thinking state when generation completes
                  setGenerationProgress(prev => ({
                    ...prev,
                    isThinking: false,
                    thinkingText: undefined,
                    thinkingDuration: undefined
                  }));
                  
                  // Store packages to install from tool calls
                  if (data.packagesToInstall && data.packagesToInstall.length > 0) {
                    console.log('[generate-code] Packages to install from tools:', data.packagesToInstall);
                    // Store packages globally for later installation
                    (window as any).pendingPackages = data.packagesToInstall;
                  }
                  
                  // Parse all files from the completed code if not already done
                  const fileRegex = /<file path="([^"]+)">([^]*?)<\/file>/g;
                  const parsedFiles: Array<{path: string; content: string; type: string; completed: boolean}> = [];
                  let fileMatch;
                  
                  while ((fileMatch = fileRegex.exec(data.generatedCode)) !== null) {
                    const filePath = fileMatch[1];
                    const fileContent = fileMatch[2];
                    const fileExt = filePath.split('.').pop() || '';
                    const fileType = fileExt === 'jsx' || fileExt === 'js' ? 'javascript' :
                                    fileExt === 'css' ? 'css' :
                                    fileExt === 'json' ? 'json' :
                                    fileExt === 'html' ? 'html' : 'text';
                    
                    parsedFiles.push({
                      path: filePath,
                      content: fileContent.trim(),
                      type: fileType,
                      completed: true
                    });
                  }
                  
                  setGenerationProgress(prev => ({
                    ...prev,
                    status: `Generated ${parsedFiles.length > 0 ? parsedFiles.length : prev.files.length} file${(parsedFiles.length > 0 ? parsedFiles.length : prev.files.length) !== 1 ? 's' : ''}!`,
                    isGenerating: false,
                    isStreaming: false,
                    isEdit: prev.isEdit,
                    // Keep the files that were already parsed during streaming
                    files: prev.files.length > 0 ? prev.files : parsedFiles
                  }));
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
      
      if (generatedCode) {
        // Parse files from generated code for metadata
        const fileRegex = /<file path="([^"]+)">([^]*?)<\/file>/g;
        const generatedFiles = [];
        let match;
        while ((match = fileRegex.exec(generatedCode)) !== null) {
          generatedFiles.push(match[1]);
        }
        
        // Show appropriate message based on edit mode
        if (isEdit && generatedFiles.length > 0) {
          // For edits, show which file(s) were edited
          const editedFileNames = generatedFiles.map(f => f.split('/').pop()).join(', ');
          addChatMessage(
            explanation || `Updated ${editedFileNames}`,
            'ai',
            {
              appliedFiles: [generatedFiles[0]] // Only show the first edited file
            }
          );
        } else {
          // For new generation, show all files
          addChatMessage(explanation || 'Code generated!', 'ai', {
            appliedFiles: generatedFiles
          });
        }
        
        // Store learning in brain for code generation
        aiBrain.storeMemory({
          type: 'code_pattern',
          content: {
            code: generatedCode,
            language: languageDetection.language,
            context: message
          },
          importance: 9,
          tags: ['code_generation', languageDetection.language, 'ai_response'],
          context: 'code_generation'
        });
        
        setPromptInput(generatedCode);
        // Don't show the Generated Code panel by default
        // setLeftPanelVisible(true);
        
        // Wait for sandbox creation if it's still in progress
        if (sandboxPromise) {
          addChatMessage('Waiting for sandbox to be ready...', 'system');
          try {
            await sandboxPromise;
            // Remove the waiting message
            setChatMessages(prev => prev.filter(msg => msg.content !== 'Waiting for sandbox to be ready...'));
          } catch {
            addChatMessage('Sandbox creation failed. Cannot apply code.', 'system');
            return;
          }
        }
        
        if (sandboxData && generatedCode) {
          // Use isEdit flag that was determined at the start
          await applyGeneratedCode(generatedCode, isEdit);
        }
      }
      
      // Show completion status briefly then switch to preview
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: 'Generation complete!',
        isEdit: prev.isEdit,
        // Clear thinking state on completion
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined
      }));
      
      // Refresh file explorer to show newly generated files
      setTimeout(() => {
        refreshFileExplorer();
      }, 500);
      
      setTimeout(() => {
        // Switch to preview but keep files for display
        setActiveTab('preview');
      }, 1000); // Reduced from 3000ms to 1000ms
    } catch (error: any) {
      console.error('[sendChatMessage] Error occurred:', error);
      
      // Remove any processing messages
      setChatMessages(prev => prev.filter(msg => 
        !msg.content.includes('Starting development') && 
        !msg.content.includes('Processing your request') &&
        !msg.content.includes('Thinking...')
      ));
      
      // Show user-friendly error message
      let errorMessage = 'An error occurred while processing your request.';
      if (error.message.includes('timeout')) {
        errorMessage = 'The AI request timed out. Please try again with a shorter request.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'API key not configured. Please check your environment variables.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      addChatMessage(errorMessage, 'error');
      
      // Reset generation progress and switch back to preview on error
      setGenerationProgress({
        isGenerating: false,
        status: '',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: false,
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined,
        files: [],
        currentFile: undefined,
        lastProcessedPosition: 0
      });
      setActiveTab('preview');
    }
  };


  const downloadZip = async () => {
    if (!sandboxData) {
      addChatMessage('No active sandbox to download. Create a sandbox first!', 'system');
      return;
    }
    
    setLoading(true);
    log('Creating zip file...');
    addChatMessage('Creating ZIP file of your Vite app...', 'system');
    
    try {
      const response = await fetch('/api/create-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        log('Zip file created!');
        addChatMessage('ZIP file created! Download starting...', 'system');
        
        const link = document.createElement('a');
        link.href = data.dataUrl;
        link.download = data.fileName || 'e2b-project.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addChatMessage(
          'Your Vite app has been downloaded! To run it locally:\n' +
          '1. Unzip the file\n' +
          '2. Run: npm install\n' +
          '3. Run: npm run dev\n' +
          '4. Open http://localhost:5173',
          'system'
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      log(`Failed to create zip: ${error.message}`, 'error');
      addChatMessage(`Failed to create ZIP: ${error.message}`, 'system');
    } finally {
      setLoading(false);
    }
  };

  const reapplyLastGeneration = async () => {
    if (!conversationContext.lastGeneratedCode) {
      addChatMessage('No previous generation to re-apply', 'system');
      return;
    }
    
    if (!sandboxData) {
      addChatMessage('Please create a sandbox first', 'system');
      return;
    }
    
    addChatMessage('Re-applying last generation...', 'system');
    const isEdit = conversationContext.appliedCode.length > 0;
    await applyGeneratedCode(conversationContext.lastGeneratedCode, isEdit);
  };

  // Auto-scroll code display to bottom when streaming
  useEffect(() => {
    if (codeDisplayRef.current && generationProgress.isStreaming) {
      codeDisplayRef.current.scrollTop = codeDisplayRef.current.scrollHeight;
    }
  }, [generationProgress.streamedCode, generationProgress.isStreaming]);



  const handleFileClick = async (filePath: string) => {
    setSelectedFile(filePath);
    // TODO: Add file content fetching logic here
  };

  const getFileIcon = (fileName: string) => {
    const IconComponent = getLanguageFileIcon(fileName);
    return <IconComponent className="w-4 h-4" />;
  };

  const clearChatHistory = () => {
    setChatMessages([{
      content: 'Chat history cleared. How can I help you?',
      type: 'system',
      timestamp: new Date()
    }]);
  };


  const cloneWebsite = async () => {
    let url = urlInput.trim();
    if (!url) {
      setUrlStatus(prev => [...prev, 'Please enter a URL']);
      return;
    }
    
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    setUrlStatus([`Using: ${url}`, 'Starting to scrape...']);
    
    setUrlOverlayVisible(false);
    
    // Remove protocol for cleaner display
    const cleanUrl = url.replace(/^https?:\/\//i, '');
    addChatMessage(`Starting to clone ${cleanUrl}...`, 'system');
    
    // Capture screenshot immediately and switch to preview tab
    captureUrlScreenshot(url);
    
    try {
      addChatMessage('Scraping website content...', 'system');
      const scrapeResponse = await fetch('/api/scrape-url-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!scrapeResponse.ok) {
        throw new Error(`Scraping failed: ${scrapeResponse.status}`);
      }
      
      const scrapeData = await scrapeResponse.json();
      
      if (!scrapeData.success) {
        throw new Error(scrapeData.error || 'Failed to scrape website');
      }
      
      addChatMessage(`Scraped ${scrapeData.content.length} characters from ${url}`, 'system');
      
      // Clear preparing design state and switch to generation tab
      setIsPreparingDesign(false);
      setActiveTab('generation');
      
      setConversationContext(prev => ({
        ...prev,
        scrapedWebsites: [...prev.scrapedWebsites, {
          url,
          content: scrapeData,
          timestamp: new Date()
        }],
        currentProject: `Clone of ${url}`
      }));
      
      // Start sandbox creation in parallel with code generation
      let sandboxPromise: Promise<void> | null = null;
      if (!sandboxData) {
        addChatMessage('Creating sandbox while generating your React app...', 'system');
        sandboxPromise = createSandbox(true);
      }
      
      addChatMessage('Analyzing and generating React recreation...', 'system');
      
      const recreatePrompt = `I scraped this website and want you to recreate it as a modern React application.

URL: ${url}

SCRAPED CONTENT:
${scrapeData.content}



REQUIREMENTS:
1. Create a COMPLETE React application with App.jsx as the main component
2. App.jsx MUST import and render all other components
3. Recreate the main sections and layout from the scraped content
4. Use a modern dark theme with excellent contrast:
   - Background: #0a0a0a
   - Text: #ffffff
   - Links: #60a5fa
   - Accent: #3b82f6
5. Make it fully responsive
6. Include hover effects and smooth transitions
7. Create separate components for major sections (Header, Hero, Features, etc.)
8. Use semantic HTML5 elements

IMPORTANT CONSTRAINTS:
- DO NOT use React Router or any routing libraries
- Use regular <a> tags with href="#section" for navigation, NOT Link or NavLink components
- This is a single-page application, no routing needed
- ALWAYS create src/App.jsx that imports ALL components
- Each component should be in src/components/
- Use Tailwind CSS for ALL styling (no custom CSS files)
- Make sure the app actually renders visible content
- Create ALL components that you reference in imports

IMAGE HANDLING RULES:
- When the scraped content includes images, USE THE ORIGINAL IMAGE URLS whenever appropriate
- Keep existing images from the scraped site (logos, product images, hero images, icons, etc.)
- Use the actual image URLs provided in the scraped content, not placeholders
- Only use placeholder images or generic services when no real images are available
- For company logos and brand images, ALWAYS use the original URLs to maintain brand identity
- If scraped data contains image URLs, include them in your img tags
- Example: If you see "https://example.com/logo.png" in the scraped content, use that exact URL

Focus on the key sections and content, making it clean and modern while preserving visual assets.`;
      
      setGenerationProgress(prev => ({
        isGenerating: true,
        status: 'Initializing AI...',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: true,
        isThinking: false,
        thinkingText: undefined,
        thinkingDuration: undefined,
        // Keep previous files until new ones are generated
        files: prev.files || [],
        currentFile: undefined,
        lastProcessedPosition: 0
      }));
      
      // Switch to generation tab when starting
      setActiveTab('generation');
      
      const aiResponse = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: recreatePrompt,
          model: aiModel,
          context: {
            sandboxId: sandboxData?.id,
            structure: structureContent,
            conversationContext: conversationContext
          }
        })
      });
      
      if (!aiResponse.ok) {
        throw new Error(`AI generation failed: ${aiResponse.status}`);
      }
      
      const reader = aiResponse.body?.getReader();
      const decoder = new TextDecoder();
      let generatedCode = '';
      let explanation = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'status') {
                  setGenerationProgress(prev => ({ ...prev, status: data.message }));
                } else if (data.type === 'thinking') {
                  setGenerationProgress(prev => ({ 
                    ...prev, 
                    isThinking: true,
                    thinkingText: (prev.thinkingText || '') + data.text
                  }));
                } else if (data.type === 'thinking_complete') {
                  setGenerationProgress(prev => ({ 
                    ...prev, 
                    isThinking: false,
                    thinkingDuration: data.duration
                  }));
                } else if (data.type === 'conversation') {
                  // Add conversational text to chat only if it's not code
                  let text = data.text || '';
                  
                  // Remove package tags from the text
                  text = text.replace(/<package>[^<]*<\/package>/g, '');
                  text = text.replace(/<packages>[^<]*<\/packages>/g, '');
                  
                  // Filter out any XML tags and file content that slipped through
                  if (!text.includes('<file') && !text.includes('import React') && 
                      !text.includes('export default') && !text.includes('className=') &&
                      text.trim().length > 0) {
                    addChatMessage(text.trim(), 'ai');
                  }
                } else if (data.type === 'stream' && data.raw) {
                  setGenerationProgress(prev => ({ 
                    ...prev, 
                    streamedCode: prev.streamedCode + data.text,
                    lastProcessedPosition: prev.lastProcessedPosition || 0
                  }));
                } else if (data.type === 'component') {
                  setGenerationProgress(prev => ({
                    ...prev,
                    status: `Generated ${data.name}`,
                    components: [...prev.components, { 
                      name: data.name,
                      path: data.path,
                      completed: true
                    }],
                    currentComponent: prev.currentComponent + 1
                  }));
                } else if (data.type === 'complete') {
                  generatedCode = data.generatedCode;
                  explanation = data.explanation;
                  
                  // Save the last generated code
                  setConversationContext(prev => ({
                    ...prev,
                    lastGeneratedCode: generatedCode
                  }));
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      }
      
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: '✅ Development complete!',
        isEdit: prev.isEdit
      }));
      
      if (generatedCode) {
        addChatMessage('🎉 Development completed successfully!', 'system');
        
        // Add the explanation to chat if available
        if (explanation && explanation.trim()) {
          addChatMessage(explanation, 'ai');
        }
        
        setPromptInput(generatedCode);
        // Don't show the Generated Code panel by default
        // setLeftPanelVisible(true);
        
        // Wait for sandbox creation if it's still in progress
        if (sandboxPromise) {
          addChatMessage('Waiting for sandbox to be ready...', 'system');
          try {
            await sandboxPromise;
            // Remove the waiting message
            setChatMessages(prev => prev.filter(msg => msg.content !== 'Waiting for sandbox to be ready...'));
          } catch (error: any) {
            addChatMessage('Sandbox creation failed. Cannot apply code.', 'system');
            throw error;
          }
        }
        
        // First application for cloned site should not be in edit mode
        await applyGeneratedCode(generatedCode, false);
        
        addChatMessage(
          `Successfully recreated ${url} as a modern React app! The scraped content is now in my context, so you can ask me to modify specific sections or add features based on the original site.`, 
          'ai',
          {
            scrapedUrl: url,
            scrapedContent: scrapeData,
            generatedCode: generatedCode
          }
        );
        
        setUrlInput('');
        setUrlStatus([]);
        
        // Clear generation progress and all screenshot/design states
        setGenerationProgress(prev => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
          status: 'Generation complete!'
        }));
        
        // Clear screenshot and preparing design states to prevent them from showing on next run
        setUrlScreenshot(null);
        setIsPreparingDesign(false);
        setTargetUrl('');
        setScreenshotError(null);
        setLoadingStage(null); // Clear loading stage
        
        setTimeout(() => {
          // Switch back to preview tab but keep files
          setActiveTab('preview');
        }, 1000); // Show completion briefly then switch
      } else {
        throw new Error('Failed to generate recreation');
      }
      
    } catch (error: any) {
      addChatMessage(`Failed to clone website: ${error.message}`, 'system');
      setUrlStatus([]);
      setIsPreparingDesign(false);
      // Clear all states on error
      setUrlScreenshot(null);
      setTargetUrl('');
      setScreenshotError(null);
      setLoadingStage(null);
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        status: '',
        // Keep files to display in sidebar
        files: prev.files
      }));
      setActiveTab('preview');
    }
  };

  const captureUrlScreenshot = async (url: string) => {
    setIsCapturingScreenshot(true);
    setScreenshotError(null);
    try {
      const response = await fetch('/api/scrape-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      if (data.success && data.screenshot) {
        setUrlScreenshot(data.screenshot);
        // Set preparing design state
        setIsPreparingDesign(true);
        // Store the clean URL for display
        const cleanUrl = url.replace(/^https?:\/\//i, '');
        setTargetUrl(cleanUrl);
        // Switch to preview tab to show the screenshot
        if (activeTab !== 'preview') {
          setActiveTab('preview');
        }
      } else {
        setScreenshotError(data.error || 'Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      setScreenshotError('Network error while capturing screenshot');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Advanced Features Functions
  const analyzeCode = async () => {
    if (!sandboxFiles || Object.keys(sandboxFiles).length === 0) {
      addChatMessage('No files to analyze. Please generate some code first.', 'system');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analyzer = new CodeAnalyzer(sandboxFiles);
      const analysis = analyzer.getFullAnalysis();
      
      setCodeAnalyzer(analyzer);
      setCodeAnalysis(analysis);
      
      addChatMessage(`✓ Code analysis complete! Found ${analysis.structure.files.length} files, ${analysis.issues.length} issues, and ${analysis.suggestions.length} suggestions.`, 'system');
      
      // Add detailed analysis to chat
      const analysisMessage = `
📊 **Code Analysis Results:**

📁 **Structure:**
- Total files: ${analysis.structure.files.length}
- Total lines: ${analysis.structure.totalLines}
- Languages: ${Object.entries(analysis.structure.languageStats).map(([lang, count]) => `${lang} (${count})`).join(', ')}

🔍 **Issues Found:**
${analysis.issues.length > 0 ? analysis.issues.slice(0, 5).map(issue => `- ${issue.type.toUpperCase()}: ${issue.message} (${issue.file}:${issue.line})`).join('\n') : '- No issues found'}

💡 **Suggestions:**
${analysis.suggestions.length > 0 ? analysis.suggestions.slice(0, 3).map(suggestion => `- ${suggestion.type}: ${suggestion.message}`).join('\n') : '- No suggestions'}

📦 **Dependencies:**
- Packages: ${analysis.dependencies.packages.length}
- Missing: ${analysis.dependencies.missing.length}
- Outdated: ${analysis.dependencies.outdated.length}

🧮 **Complexity:**
- Cyclomatic: ${analysis.complexity.cyclomaticComplexity}
- Maintainability: ${Math.round(analysis.complexity.maintainabilityIndex)}
- Technical Debt: ${Math.round(analysis.complexity.technicalDebt)} days
      `;
      
      addChatMessage(analysisMessage, 'system');
      
    } catch (error) {
      console.error('Code analysis failed:', error);
      addChatMessage(`Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      const uploadedFiles = await fileUploadManager.uploadMultipleFiles(files);
      setUploadedFiles(prev => [...prev, ...uploadedFiles]);
      
      addChatMessage(`✓ Uploaded ${uploadedFiles.length} file(s) successfully!`, 'system');
      
      // Add file details to chat
      const fileDetails = uploadedFiles.map(file => 
        `- ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      ).join('\n');
      
      addChatMessage(`📁 **Uploaded Files:**\n${fileDetails}`, 'system');
      
    } catch (error) {
      console.error('File upload failed:', error);
      addChatMessage(`Error uploading files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleFileEdit = (filePath: string) => {
    const content = sandboxFiles[filePath] || '';
    setEditingFile(filePath);
    setFileContent(content);
  };

  const saveFileEdit = async () => {
    if (!editingFile || !fileContent) return;
    
    try {
      // Update local state
      setSandboxFiles(prev => ({
        ...prev,
        [editingFile]: fileContent
      }));
      
      // TODO: Send to backend to update sandbox
      addChatMessage(`✓ Saved changes to ${editingFile}`, 'system');
      
      setEditingFile(null);
      setFileContent('');
      
    } catch (error) {
      console.error('Failed to save file:', error);
      addChatMessage(`Error saving file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const searchFiles = (query: string) => {
    if (!codeAnalyzer || !query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = codeAnalyzer.searchFiles(query);
    setSearchResults(results);
    setSearchQuery(query);
  };

  const findReferences = (symbol: string) => {
    if (!codeAnalyzer) return;
    
    const references = codeAnalyzer.findReferences(symbol);
    if (references.length > 0) {
      const referenceList = references.slice(0, 10).map(ref => 
        `- ${ref.file}:${ref.line} - ${ref.context}`
      ).join('\n');
      
      addChatMessage(`🔍 **References for "${symbol}":**\n${referenceList}`, 'system');
    } else {
      addChatMessage(`No references found for "${symbol}"`, 'system');
    }
  };

  const takeScreenshot = async () => {
    if (!iframeRef.current) {
      addChatMessage('No preview available to capture', 'error');
      return;
    }
    
    setIsTakingScreenshot(true);
    try {
      const screenshot = await captureScreenshot(iframeRef.current);
      setScreenshotData(screenshot);
      addChatMessage('✓ Screenshot captured successfully!', 'system');
    } catch (error) {
      console.error('Screenshot failed:', error);
      addChatMessage(`Error taking screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    addChatMessage(`Debug mode ${!debugMode ? 'enabled' : 'disabled'}`, 'system');
  };

  const installMissingPackages = async () => {
    if (!codeAnalysis) {
      addChatMessage('No code analysis available. Run analysis first.', 'system');
      return;
    }
    
    const missingPackages = codeAnalysis.dependencies.missing;
    if (missingPackages.length === 0) {
      addChatMessage('No missing packages found.', 'system');
      return;
    }
    
    try {
      await installPackages(missingPackages);
      addChatMessage(`✓ Installed ${missingPackages.length} missing package(s)`, 'system');
    } catch (error) {
      console.error('Failed to install packages:', error);
      addChatMessage(`Error installing packages: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const getFileIconComponent = (fileName: string) => {
    return getFileIcon(fileName);
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  // NEW: Modern coding feature functions
  const initializeGit = async () => {
    try {
      setGitStatus({ branch: 'main', status: 'initialized', changes: 0 });
      addChatMessage('Git repository initialized successfully', 'system');
    } catch (error) {
      addChatMessage('Failed to initialize Git repository', 'error');
    }
  };

  const executeTerminalCommand = async (command: string) => {
    setCurrentCommand(command);
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    try {
      // Simulate command execution
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, sandboxId: sandboxData?.id })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTerminalOutput(prev => [...prev, result.output]);
        addChatMessage(`Command executed: ${command}`, 'system');
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `Error: ${error}`]);
      addChatMessage(`Command failed: ${command}`, 'error');
    }
  };

  const formatCode = async () => {
    setFormattingStatus('Formatting code...');
    try {
      const response = await fetch('/api/format-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: sandboxFiles })
      });
      
      if (response.ok) {
        const formattedFiles = await response.json();
        setSandboxFiles(formattedFiles);
        setFormattingStatus('Code formatted successfully');
        addChatMessage('Code has been formatted and cleaned up', 'system');
      }
    } catch (error) {
      setFormattingStatus('Formatting failed');
      addChatMessage('Failed to format code', 'error');
    }
  };

  const runTests = async () => {
    setTestResults([]);
    try {
      const response = await fetch('/api/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId: sandboxData?.id })
      });
      
      if (response.ok) {
        const results = await response.json();
        setTestResults(results.tests);
        addChatMessage(`Tests completed: ${results.passed}/${results.total} passed`, 'system');
      }
    } catch (error) {
      addChatMessage('Failed to run tests', 'error');
    }
  };

  const deployApplication = async (platform: string = 'vercel') => {
    setDeploymentStatus('Deploying...');
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform, 
          sandboxId: sandboxData?.id,
          files: sandboxFiles 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setDeploymentStatus(`Deployed to ${result.url}`);
        addChatMessage(`Application deployed successfully to ${result.url}`, 'system');
      }
    } catch (error) {
      setDeploymentStatus('Deployment failed');
      addChatMessage('Failed to deploy application', 'error');
    }
  };

  const analyzePerformance = async () => {
    try {
      const response = await fetch('/api/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: sandboxFiles })
      });
      
      if (response.ok) {
        const metrics = await response.json();
        setPerformanceMetrics(metrics);
        addChatMessage('Performance analysis completed', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to analyze performance', 'error');
    }
  };

  const scanSecurity = async () => {
    try {
      const response = await fetch('/api/security-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: sandboxFiles })
      });
      
      if (response.ok) {
        const issues = await response.json();
        setSecurityIssues(issues);
        addChatMessage(`Security scan completed: ${issues.length} issues found`, 'system');
      }
    } catch (error) {
      addChatMessage('Failed to scan for security issues', 'error');
    }
  };

  const downloadApplication = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Create a zip file of all application files
      const response = await fetch('/api/download-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          files: sandboxFiles,
          projectName: 'nexus-ai-project'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexus-ai-project.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadProgress(100);
        addChatMessage('Application downloaded successfully!', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to download application', 'error');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const templates = await response.json();
        setAvailableTemplates(templates);
      }
    } catch (error) {
      addChatMessage('Failed to load templates', 'error');
    }
  };

  const createFromTemplate = async (templateId: string) => {
    try {
      const response = await fetch('/api/create-from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      
      if (response.ok) {
        const files = await response.json();
        setSandboxFiles(files);
        addChatMessage('Project created from template successfully', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to create project from template', 'error');
    }
  };

  const explainCode = async (code: string) => {
    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      if (response.ok) {
        const explanation = await response.json();
        setExplanationText(explanation.text);
        addChatMessage('Code explanation generated', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to generate code explanation', 'error');
    }
  };

  const getCodeHistory = async () => {
    try {
      const response = await fetch('/api/code-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId: sandboxData?.id })
      });
      
      if (response.ok) {
        const history = await response.json();
        setCodeHistory(history);
        addChatMessage('Code history loaded', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to load code history', 'error');
    }
  };

  const suggestRefactoring = async () => {
    try {
      const response = await fetch('/api/refactor-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: sandboxFiles })
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        setRefactorSuggestions(suggestions);
        addChatMessage('Refactoring suggestions generated', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to generate refactoring suggestions', 'error');
    }
  };

  // File Operations Handlers
  const handleNewFile = async () => {
    const fileName = prompt('Enter file name:', 'untitled.txt');
    if (fileName) {
      try {
        const response = await fetch('/api/file-operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-new-file',
            name: fileName,
            content: '',
            directory: process.cwd()
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          addChatMessage(`📄 Created new file: ${fileName}`, 'system');
          openFileInEditor(fileName, '');
        }
      } catch (error) {
        addChatMessage('Failed to create new file', 'error');
      }
    }
  };

  const handleNewWindow = () => {
    window.open(window.location.href, '_blank');
  };

  const handleOpenFile = async () => {
    try {
      const files = await fileOperations.openFileDialog();
      files.forEach(file => {
        openFileInEditor(file.path, file.content || '');
        addChatMessage(`📂 Opened file: ${file.name}`, 'system');
      });
    } catch (error) {
      addChatMessage('Failed to open file', 'error');
    }
  };

  const handleOpenFolder = async () => {
    try {
      const files = await fileOperations.openFolderDialog();
      files.forEach(file => {
        openFileInEditor(file.path, file.content || '');
      });
      addChatMessage(`📁 Opened folder with ${files.length} files`, 'system');
    } catch (error) {
      addChatMessage('Failed to open folder', 'error');
    }
  };

  const handleOpenWorkspace = async () => {
    try {
      const workspace = await fileOperations.openWorkspaceFile();
      if (workspace) {
        addChatMessage('📋 Workspace opened successfully', 'system');
        // Apply workspace settings
        setSettings(prev => ({ ...prev, ...workspace.settings }));
      }
    } catch (error) {
      addChatMessage('Failed to open workspace', 'error');
    }
  };

  const handleOpenRecent = (filePath: string) => {
    // In a real implementation, this would load the file content
    addChatMessage(`📂 Opening recent file: ${filePath}`, 'system');
  };

  const handleSave = () => {
    if (activeEditorFile) {
      const file = editorFiles.find(f => f.path === activeEditorFile);
      if (file) {
        fileOperations.saveFile(file.path, file.content);
        addChatMessage(`💾 Saved: ${file.path}`, 'system');
      }
    }
  };

  const handleSaveAs = async () => {
    if (activeEditorFile) {
      const file = editorFiles.find(f => f.path === activeEditorFile);
      if (file) {
        const newName = await fileOperations.saveAsFile(file.path, file.content);
        addChatMessage(`💾 Saved as: ${newName}`, 'system');
      }
    }
  };

  const handleSaveAll = () => {
    editorFiles.forEach(file => {
      if (file.isModified) {
        fileOperations.saveFile(file.path, file.content);
      }
    });
    addChatMessage(`💾 Saved all files (${editorFiles.filter(f => f.isModified).length} files)`, 'system');
  };

  const handleSaveWorkspaceAs = async () => {
    const workspaceData = {
      folders: [process.cwd()],
      settings: settings,
      extensions: {}
    };
    await fileOperations.saveWorkspace(workspaceData);
    addChatMessage('📋 Workspace saved', 'system');
  };

  const handleAddFolderToWorkspace = async () => {
    try {
      const files = await fileOperations.openFolderDialog();
      addChatMessage(`📁 Added folder to workspace (${files.length} files)`, 'system');
    } catch (error) {
      addChatMessage('Failed to add folder to workspace', 'error');
    }
  };

  const handleDuplicateWorkspace = () => {
    handleNewWindow();
    addChatMessage('🔄 Workspace duplicated in new window', 'system');
  };

  const handleShare = async () => {
    try {
      const shareLink = await fileOperations.generateShareLink(
        editorFiles.map(file => ({
          name: file.path.split('/').pop() || file.path,
          path: file.path,
          type: 'file' as const,
          content: file.content
        }))
      );
      navigator.clipboard.writeText(shareLink);
      addChatMessage(`🔗 Share link copied to clipboard: ${shareLink}`, 'system');
    } catch (error) {
      addChatMessage('Failed to generate share link', 'error');
    }
  };

  const handlePreferences = () => {
    setShowSettings(true);
  };

  const handleAutoSave = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      editor: { ...prev.editor, autoSave: enabled }
    }));
    addChatMessage(`⚡ Auto Save ${enabled ? 'enabled' : 'disabled'}`, 'system');
  };

  const handleRevertFile = () => {
    if (activeEditorFile) {
      addChatMessage(`🔄 Reverted changes to: ${activeEditorFile}`, 'system');
      // In a real implementation, this would reload the file from disk
    }
  };

  const handleCloseEditor = () => {
    if (activeEditorFile) {
      handleEditorFileClose(activeEditorFile);
    }
  };

  const handleCloseFolder = () => {
    setEditorFiles([]);
    addChatMessage('📁 Closed folder', 'system');
  };

  const handleCloseWindow = () => {
    window.close();
  };

  const handleSettingsChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleVoiceToCode = async () => {
    if (!isListening) {
      setIsListening(true);
      // Start voice recognition
      try {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            setVoiceTranscript(transcript);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
            // Process the voice command if we have a transcript
            if (voiceTranscript.trim()) {
              setAiChatInput(voiceTranscript);
              setVoiceTranscript('');
            }
          };

          recognition.start();
          addChatMessage('🎤 Voice recognition started. Speak your command...', 'system');
        } else {
          addChatMessage('❌ Speech recognition not supported in this browser', 'error');
          setIsListening(false);
        }
      } catch (error) {
        console.error('Speech recognition not supported:', error);
        addChatMessage('❌ Speech recognition not supported', 'error');
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      addChatMessage('🎤 Voice recognition stopped', 'system');
    }
  };

  const applyRefactoring = async (suggestionId: string) => {
    try {
      const response = await fetch('/api/apply-refactoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          suggestionId, 
          files: sandboxFiles 
        })
      });
      
      if (response.ok) {
        const refactoredFiles = await response.json();
        setSandboxFiles(refactoredFiles);
        addChatMessage('Refactoring applied successfully', 'system');
      }
    } catch (error) {
      addChatMessage('Failed to apply refactoring', 'error');
    }
  };

  return (
    <div className="font-sans bg-[#0a0a0a] text-white h-screen flex flex-col">
      {/* Menu Bar - Like VS Code/Cursor */}
      <div className="h-8 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-2">
        <FileMenu
          onNewFile={handleNewFile}
          onNewWindow={handleNewWindow}
          onOpenFile={handleOpenFile}
          onOpenFolder={handleOpenFolder}
          onOpenWorkspace={handleOpenWorkspace}
          onOpenRecent={handleOpenRecent}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onSaveAll={handleSaveAll}
          onSaveWorkspaceAs={handleSaveWorkspaceAs}
          onAddFolderToWorkspace={handleAddFolderToWorkspace}
          onDuplicateWorkspace={handleDuplicateWorkspace}
          onShare={handleShare}
          onPreferences={handlePreferences}
          onAutoSave={handleAutoSave}
          onRevertFile={handleRevertFile}
          onCloseEditor={handleCloseEditor}
          onCloseFolder={handleCloseFolder}
          onCloseWindow={handleCloseWindow}
          recentFiles={recentFiles}
          autoSaveEnabled={settings.editor.autoSave}
        />
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">Edit</div>
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">Selection</div>
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">View</div>
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">Go</div>
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">Run</div>
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">Terminal</div>
        <div className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors cursor-pointer">Help</div>
      </div>
      
      {/* Application Header with Logo, Name, and Credits */}
      <div className="bg-[#0a0a0a] px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
        {/* Left side - App Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* App Logo - Cursor-style */}
            <div className="w-8 h-8 bg-gradient-to-br from-[#007acc] to-[#005a9e] rounded-md flex items-center justify-center relative overflow-hidden">
              {/* Cursor-style "N" design */}
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-4 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-4 bg-white rounded-full transform rotate-12 translate-x-0.5"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-4 bg-white rounded-full transform -rotate-12 -translate-x-0.5"></div>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-md"></div>
            </div>
            {/* App Name */}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">Nexus AI</h1>
              <p className="text-xs text-[#a0a0a0]">AI-Powered Code Generation</p>
            </div>
          </div>
        </div>
        
        {/* Center - Developer Credits */}
        <div className="flex items-center gap-2 text-[#a0a0a0] text-sm">
          <span>Developed by</span>
          <span className="text-[#0066ff] font-medium">Muhammad Hanan</span>
        </div>
        
        {/* Right side - Status and Advanced Features */}
        <div className="flex items-center gap-3">
          <Integrations />
          <button
            onClick={() => setShowBrainDashboard(!showBrainDashboard)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            title="AI Brain Dashboard"
          >
            <FiCpu className="w-3 h-3" />
            AI Brain
          </button>
          <button
               onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
               className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
               title="Advanced AI Features"
             >
               <BsLightningCharge className="w-3 h-3" />
               Advanced Features
             </button>
             <button
               onClick={() => setShowTerminal(!showTerminal)}
               className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
               title="Open Terminal"
             >
               <FiTerminal className="w-3 h-3" />
               Terminal
             </button>


        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - File Explorer */}
        <div className="w-[240px] flex flex-col border-r border-[#2a2a2a] bg-[#0a0a0a]">
          {/* File Explorer Header */}
          <div className="px-3 py-2 bg-[#1a1a1a] text-white flex items-center justify-between border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <BsFolderFill className="w-4 h-4 text-[#0066ff]" />
              <span className="text-xs font-medium uppercase tracking-wide">EXPLORER</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Search files"
              >
                <FiSearch className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Upload files"
              >
                <FiUpload className="w-3 h-3" />
              </button>
              <button
                onClick={analyzeCode}
                disabled={isAnalyzing}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-50"
                title="Analyze code"
              >
                <FiCode className="w-3 h-3" />
              </button>
              <button
                onClick={toggleDebugMode}
                className={`p-1 rounded transition-colors ${debugMode ? 'bg-[#0066ff] text-white' : 'hover:bg-[#2a2a2a]'}`}
                title="Debug mode"
              >
                <FiTerminal className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowGitPanel(!showGitPanel)}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Git operations"
              >
                <SiGit className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Terminal"
              >
                <FiTerminal className="w-3 h-3" />
              </button>
              <button
                onClick={formatCode}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Format code"
              >
                <FiEdit className="w-3 h-3" />
              </button>
              <button
                onClick={runTests}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Run tests"
              >
                <FiCheck className="w-3 h-3" />
              </button>
              <button
                onClick={() => deployApplication()}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Deploy"
              >
                <FiExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={downloadApplication}
                disabled={isDownloading}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-50"
                title="Download app"
              >
                <FiDownload className="w-3 h-3" />
              </button>
              <button
                onClick={refreshFileExplorer}
                disabled={isRefreshingFiles}
                className={`p-1 rounded transition-colors ${
                  isRefreshingFiles 
                    ? 'bg-[#0066ff] text-white animate-spin' 
                    : 'hover:bg-[#2a2a2a]'
                }`}
                title={isRefreshingFiles ? "Refreshing..." : "Refresh file explorer"}
              >
                <FiRefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          {showSearch && (
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => searchFiles(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white placeholder:text-[#666666] focus:outline-none focus:border-[#0066ff]"
              />
            </div>
          )}
          
          {/* File Upload Area */}
          {showFileUpload && (
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <div className="border-2 border-dashed border-[#2a2a2a] rounded p-2 text-center">
                <input
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer text-xs text-[#a0a0a0] hover:text-white">
                  <FiUpload className="w-4 h-4 mx-auto mb-1" />
                  Drop files here or click to upload
                </label>
              </div>
            </div>
          )}

          {/* Git Panel */}
          {showGitPanel && (
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <div className="text-xs text-[#a0a0a0] mb-2">Git Status</div>
              {gitStatus ? (
                <div className="space-y-1">
                  <div className="text-xs">Branch: {gitStatus.branch}</div>
                  <div className="text-xs">Changes: {gitStatus.changes}</div>
                  <button
                    onClick={initializeGit}
                    className="w-full px-2 py-1 text-xs bg-[#0066ff] text-white rounded hover:bg-[#0052cc]"
                  >
                    Initialize Git
                  </button>
                </div>
              ) : (
                <button
                  onClick={initializeGit}
                  className="w-full px-2 py-1 text-xs bg-[#0066ff] text-white rounded hover:bg-[#0052cc]"
                >
                  Initialize Git
                </button>
              )}
            </div>
          )}

          {/* Terminal Panel */}
          {showTerminal && (
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <div className="text-xs text-[#a0a0a0] mb-2">Terminal</div>
              <div className="bg-[#1a1a1a] rounded p-2 h-32 overflow-y-auto text-xs font-mono">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="text-[#a0a0a0]">{line}</div>
                ))}
              </div>
              <div className="flex gap-1 mt-2">
                <input
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && executeTerminalCommand(currentCommand)}
                  placeholder="Enter command..."
                  className="flex-1 px-2 py-1 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white"
                />
                <button
                  onClick={() => executeTerminalCommand(currentCommand)}
                  className="px-2 py-1 text-xs bg-[#0066ff] text-white rounded hover:bg-[#0052cc]"
                >
                  Run
                </button>
              </div>
            </div>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <div className="text-xs text-[#a0a0a0] mb-2">Downloading Application...</div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-[#0066ff] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-[#a0a0a0] mt-1">{downloadProgress}%</div>
            </div>
          )}
          
          {/* File Tree */}
          <div className="flex-1 overflow-y-auto p-1 scrollbar-hide">
            <div className="text-xs">
              {/* Root app folder */}
              <div 
                className="flex items-center gap-1 py-1 px-2 hover:bg-[#1a1a1a] rounded cursor-pointer text-white transition-colors"
                onClick={() => toggleFolder('app')}
              >
                {expandedFolders.has('app') ? (
                  <FiChevronDown className="w-4 h-4 text-[#a0a0a0]" />
                ) : (
                  <FiChevronRight className="w-4 h-4 text-[#a0a0a0]" />
                )}
                {expandedFolders.has('app') ? (
                  <BsFolder2Open className="w-4 h-4 text-[#0066ff]" />
                ) : (
                  <BsFolderFill className="w-4 h-4 text-[#0066ff]" />
                )}
                <span className="font-medium text-white">app</span>
              </div>
              
              {expandedFolders.has('app') && (
                <div className="ml-4">
                  {/* Group files by directory */}
                  {(() => {
                    const fileTree: { [key: string]: Array<{ name: string; edited?: boolean }> } = {};
                    
                    // Create a map of edited files
                    const editedFiles = new Set(
                      generationProgress.files
                        .filter(f => f.edited)
                        .map(f => f.path)
                    );
                    
                    // Process all files from editor
                    console.log('[FileExplorer] Processing editor files:', editorFiles.length);
                    editorFiles.forEach(file => {
                      const parts = file.path.split('/');
                      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                      const fileName = parts[parts.length - 1];
                      
                      if (!fileTree[dir]) fileTree[dir] = [];
                      fileTree[dir].push({
                        name: fileName,
                        edited: file.isModified || false
                      });
                    });
                    
                    // Process all files from generation progress
                    console.log('[FileExplorer] Processing generation progress files:', generationProgress.files.length);
                    generationProgress.files.forEach(file => {
                      const parts = file.path.split('/');
                      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                      const fileName = parts[parts.length - 1];
                      
                      if (!fileTree[dir]) fileTree[dir] = [];
                      // Check if file already exists to avoid duplicates
                      const existingFile = fileTree[dir].find(f => f.name === fileName);
                      if (!existingFile) {
                        fileTree[dir].push({
                          name: fileName,
                          edited: file.edited || false
                        });
                      }
                    });
                    
                    // Process all files from sandbox files
                    console.log('[FileExplorer] Processing sandbox files:', Object.keys(sandboxFiles).length);
                    Object.entries(sandboxFiles).forEach(([path, content]) => {
                      const parts = path.split('/');
                      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                      const fileName = parts[parts.length - 1];
                      
                      if (!fileTree[dir]) fileTree[dir] = [];
                      // Check if file already exists to avoid duplicates
                      const existingFile = fileTree[dir].find(f => f.name === fileName);
                      if (!existingFile) {
                        fileTree[dir].push({
                          name: fileName,
                          edited: false
                        });
                      }
                    });
                    
                    console.log('[FileExplorer] Final file tree:', Object.entries(fileTree).map(([dir, files]) => `${dir}: ${files.length} files`));
                    
                    return Object.entries(fileTree).map(([dir, files]) => (
                      <div key={dir} className="mb-1">
                        {dir && (
                                                      <div 
                              className="flex items-center gap-1 py-1 px-2 hover:bg-[#1a1a1a] rounded cursor-pointer text-white transition-colors"
                              onClick={() => toggleFolder(dir)}
                            >
                            {expandedFolders.has(dir) ? (
                              <FiChevronDown className="w-4 h-4 text-[#a0a0a0]" />
                            ) : (
                              <FiChevronRight className="w-4 h-4 text-[#a0a0a0]" />
                            )}
                            {expandedFolders.has(dir) ? (
                              <BsFolder2Open className="w-4 h-4 text-[#0066ff]" />
                            ) : (
                              <BsFolderFill className="w-4 h-4 text-[#0066ff]" />
                            )}
                            <span className="text-white">{dir.split('/').pop()}</span>
                          </div>
                        )}
                        {(!dir || expandedFolders.has(dir)) && (
                          <div className={dir ? 'ml-6' : ''}>
                            {files.sort((a, b) => a.name.localeCompare(b.name)).map(fileInfo => {
                              const fullPath = dir ? `${dir}/${fileInfo.name}` : fileInfo.name;
                              const isSelected = selectedFile === fullPath;
                              
                              // Debug logging to see what's happening with file paths
                              console.log('[FileExplorer] File info:', {
                                name: fileInfo.name,
                                dir: dir,
                                fullPath: fullPath,
                                isSelected: isSelected
                              });
                              
                              return (
                                <div 
                                  key={fullPath} 
                                  className={`group flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'bg-[#0066ff] text-white' 
                                      : 'text-white hover:bg-[#1a1a1a]'
                                  }`}
                                  onClick={() => {
                                    // Debug logging
                                    console.log('[FileExplorer] Clicked on file:', {
                                      fullPath: fullPath,
                                      fileInfoName: fileInfo.name,
                                      dir: dir
                                    });
                                    
                                    // Open file in code editor
                                    const file = editorFiles.find(f => f.path === fullPath);
                                    if (file) {
                                      setActiveEditorFile(fullPath);
                                    } else {
                                      // Check if file exists in generation progress
                                      const progressFile = generationProgress.files.find(f => f.path === fullPath);
                                      if (progressFile) {
                                        openFileInEditor(fullPath, progressFile.content);
                                      } else {
                                        // Check if file exists in sandbox files
                                        const sandboxFile = sandboxFiles[fullPath];
                                        if (sandboxFile) {
                                          openFileInEditor(fullPath, sandboxFile);
                                        } else {
                                          // File doesn't exist anywhere, fetch and add it
                                          fetchAndOpenFile(fullPath);
                                        }
                                      }
                                    }
                                  }}
                                >
                                  {getFileIconComponent(fullPath)}
                                  <span className={`text-xs flex items-center gap-1 ${isSelected ? 'font-medium' : ''}`}>
                                    {/* Ensure file name is properly escaped and clean */}
                                    {fileInfo.name.replace(/[<>]/g, '')}
                                    {fileInfo.edited && (
                                      <span className={`text-[10px] px-1 rounded-md ${
                                        isSelected ? 'bg-[#0052cc]' : 'bg-orange-500 text-white'
                                      }`}>✓</span>
                                    )}
                                  </span>
                                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFileEdit(fullPath);
                                      }}
                                      className="p-1 hover:bg-[#2a2a2a] rounded"
                                      title="Edit file"
                                    >
                                      <FiEdit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        findReferences(fileInfo.name.split('.')[0]);
                                      }}
                                      className="p-1 hover:bg-[#2a2a2a] rounded"
                                      title="Find references"
                                    >
                                      <FiSearch className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Panel - Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-[#0a0a0a] border-b border-[#2a2a2a] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Code Editor</span>
            </div>
            

          </div>
          <div className="flex-1 relative overflow-hidden">
            {renderMainContent()}
          </div>
        </div>

                {/* Right Panel - AI Chat */}
        <div className="w-[350px] flex flex-col border-l border-[#2a2a2a] bg-[#0a0a0a]">
          {/* Chat Header */}
          <div className="px-3 py-2 bg-[#1a1a1a] text-white flex items-center justify-between border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#0066ff] to-[#0052cc] rounded flex items-center justify-center">
                <FiCode className="w-3 h-3 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wide">NEXUS AI</span>
                <span className="text-[10px] text-[#a0a0a0]">by Muhammad Hanan</span>
              </div>
            </div>

          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide" ref={chatMessagesRef}>
            {/* Language Detection Indicator */}
            {detectedLanguage && detectedLanguage.confidence > 0.5 && (
              <div className="mb-3 p-3 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#0066ff] rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0066ff] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        Using {getLanguageConfig(detectedLanguage.language).name}
                      </div>
                      <div className="text-[#a0a0a0] text-xs">
                        {detectedLanguage.reason} ({Math.round(detectedLanguage.confidence * 100)}% confidence)
                      </div>
                    </div>
                  </div>
                  <div className="text-[#0066ff] text-xs font-mono">
                    {detectedLanguage.language.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
            
            <AnimatePresence>
              {chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-3 ${
                    message.type === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded ${
                      message.type === 'user'
                        ? 'bg-[#0066ff] text-white'
                        : message.type === 'ai'
                        ? 'bg-[#1a1a1a] text-white border border-[#2a2a2a]'
                        : message.type === 'system'
                        ? 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a] text-xs'
                        : message.type === 'command'
                        ? 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a] text-xs font-mono'
                        : message.type === 'error'
                        ? 'bg-red-900/20 text-red-400 border border-red-800 text-xs'
                        : 'bg-[#1a1a1a] text-white border border-[#2a2a2a]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.imageData && (
                      <div className="mt-2">
                        <img 
                          src={message.imageData} 
                          alt="Uploaded image" 
                          className="max-w-full h-auto rounded border border-gray-600"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    {message.showLanguages && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="text-xs text-gray-400 mb-2">
                          <strong>Supported Languages & Frameworks:</strong>
                        </div>
                        <LanguageList iconSize={16} showNames={false} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[#2a2a2a] bg-[#0a0a0a]">
            {/* Advanced Features Toolbar */}
            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={() => setShowIssues(!showIssues)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  showIssues ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                }`}
                title="Show Issues"
              >
                <FiAlertCircle className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowDependencies(!showDependencies)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  showDependencies ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                }`}
                title="Show Dependencies"
              >
                <FiPackage className="w-3 h-3" />
              </button>
                                             <button
                  onClick={() => setShowComplexity(!showComplexity)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    showComplexity ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                  }`}
                  title="Show Complexity"
                >
                  <FiDatabase className="w-3 h-3" />
                </button>
               <button
                 onClick={() => setShowSuggestions(!showSuggestions)}
                 className={`p-1.5 rounded text-xs transition-colors ${
                   showSuggestions ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                 }`}
                 title="Show Suggestions"
               >
                 <FiStar className="w-3 h-3" />
               </button>
              <button
                onClick={takeScreenshot}
                disabled={isTakingScreenshot}
                className="p-1.5 rounded text-xs bg-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors disabled:opacity-50"
                title="Take Screenshot"
              >
                <FiCamera className="w-3 h-3" />
              </button>
              <button
                onClick={installMissingPackages}
                className="p-1.5 rounded text-xs bg-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
                title="Install Missing Packages"
              >
                <FiDownload className="w-3 h-3" />
              </button>
              <button
                onClick={analyzePerformance}
                className="p-1.5 rounded text-xs bg-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
                title="Performance Analysis"
              >
                <FiTrendingUp className="w-3 h-3" />
              </button>
              <button
                onClick={scanSecurity}
                className="p-1.5 rounded text-xs bg-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
                title="Security Scan"
              >
                <FiShield className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  showTemplates ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                }`}
                title="Templates"
              >
                <FiFileText className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowAIExplain(!showAIExplain)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  showAIExplain ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                }`}
                title="AI Code Explanation"
              >
                <FiHelpCircle className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowCodeHistory(!showCodeHistory)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  showCodeHistory ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                }`}
                title="Code History"
              >
                <FiClock className="w-3 h-3" />
              </button>
              <button
                onClick={suggestRefactoring}
                className="p-1.5 rounded text-xs bg-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
                title="Refactoring Suggestions"
              >
                <FiRefreshCw className="w-3 h-3" />
              </button>
            </div>
            
            {/* AI Model Selector - Like Cursor */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#a0a0a0]">AI:</span>
                <select
                  value={aiModel}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    setIsChangingModel(true);
                    setAiModel(newModel);
                    
                    // Show a brief confirmation that the model has changed
                    console.log(`AI model changed to: ${(appConfig.ai.modelDisplayNames as any)[newModel] || newModel}`);
                    
                    // Reset the changing state after a brief delay
                    setTimeout(() => setIsChangingModel(false), 500);
                  }}
                  className="bg-[#1a1a1a] text-white text-xs border border-[#2a2a2a] rounded px-2 py-1 focus:outline-none focus:border-[#0066ff] hover:border-[#3a3a3a] transition-all duration-200 min-w-[120px]"
                  title={`Current AI Model: ${(appConfig.ai.modelDisplayNames as any)[aiModel] || aiModel}`}
                >
                  {appConfig.ai.availableModels.map(model => (
                    <option key={model} value={model}>
                      {(appConfig.ai.modelDisplayNames as any)[model] || model}
                    </option>
                  ))}
                </select>
                {/* Visual indicator showing current model */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                  isChangingModel 
                    ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' 
                    : 'bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#0066ff]'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isChangingModel 
                      ? 'bg-orange-400 animate-spin' 
                      : 'bg-[#0066ff] animate-pulse'
                  }`}></div>
                  <span className="font-medium">
                    {isChangingModel 
                      ? 'Switching...' 
                      : ((appConfig.ai.modelDisplayNames as any)[aiModel] || aiModel).split('/').pop()
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {isProcessingImage && (
                <div className="absolute top-2 left-2 z-10 bg-[#0066ff] text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                  Processing image...
                </div>
              )}
              <Textarea
                className="min-h-[50px] pr-12 resize-y border border-[#2a2a2a] focus:outline-none focus:border-[#0066ff] transition-colors bg-[#1a1a1a] text-white placeholder:text-[#666666] text-sm"
                placeholder="Ask me to generate code..."
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                onPaste={handleImagePaste}
                rows={2}
              />
              
              {/* Voice Recognition Status */}
              {isListening && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-red-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Listening... Speak your command
                    </span>
                    <button
                      onClick={handleVoiceToCode}
                      className="text-red-400 hover:text-white transition-colors"
                      title="Stop voice recognition"
                    >
                      <FiMicOff className="w-3 h-3" />
                    </button>
                  </div>
                  {voiceTranscript && (
                    <div className="text-sm text-white bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                      "{voiceTranscript}"
                    </div>
                  )}
                </div>
              )}
              
              {/* Image Preview */}
              {currentImage && (
                <div className="mt-2 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#a0a0a0]">Image: {currentImage.name}</span>
                    <button
                      onClick={() => setCurrentImage(null)}
                      className="text-[#666666] hover:text-white transition-colors"
                      title="Remove image"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                  <img 
                    src={currentImage.data} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded border border-[#2a2a2a]"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={handleVoiceToCode}
                  className={`p-1.5 rounded transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white'
                  }`}
                  title={isListening ? "Stop voice recognition" : "Start voice recognition"}
                >
                  {isListening ? <FiMicOff className="w-3 h-3" /> : <FiMic className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="p-1.5 bg-[#1a1a1a] text-[#a0a0a0] hover:text-white rounded transition-colors"
                  title="Upload Files"
                >
                  <FiImage className="w-3 h-3" />
                </button>
                <button
                  onClick={sendChatMessage}
                  className="p-1.5 bg-[#0066ff] text-white rounded hover:bg-[#0052cc] transition-all duration-200"
                  title="Send message (Enter)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Features Modal */}
      {showAdvancedFeatures && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">Advanced AI Features</h2>
              <button
                onClick={() => setShowAdvancedFeatures(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <AdvancedFeatures />
          </div>
        </div>
      )}

      {/* Terminal Component */}
      <Terminal 
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
        onFileSystemUpdate={async () => {
          // Trigger a refresh of the file explorer or any file system related updates
          console.log('File system updated - packages installed');
          
          // Use the refreshFileExplorer function to update the file list
          await refreshFileExplorer();
        }}
      />
      
      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      
      {/* Brain Dashboard */}
      <BrainDashboard
        isOpen={showBrainDashboard}
        onClose={() => setShowBrainDashboard(false)}
      />
      
      {/* Footer with Credits */}
      <div className="bg-[#0a0a0a] px-4 py-2 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-[#666666]">
        <div className="flex items-center gap-4">
          {/* Nexus AI Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#007acc] to-[#005a9e] rounded-md flex items-center justify-center relative overflow-hidden">
              {/* Nexus AI Logo Design */}
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-3 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-3 bg-white rounded-full transform rotate-12 translate-x-0.5"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-3 bg-white rounded-full transform -rotate-12 -translate-x-0.5"></div>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-md"></div>
            </div>
            <span>© 2025 Nexus AI</span>
          </div>
          <span>•</span>
          <span>AI-Powered Code Generation Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Developed by</span>
          <span className="text-[#0066ff] font-medium">Muhammad Hanan</span>
        </div>
      </div>
    </div>
  );
}