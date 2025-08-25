'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  FiSearch, 
  FiX, 
  FiSave,
  FiFile,
  FiFolder,
  FiPlay,
  FiSettings,
  FiZoomIn,
  FiZoomOut,
  FiCode,
  FiEye,
  FiEyeOff
} from '@/lib/icons';
import LanguageIndicator from '@/components/LanguageIndicator';

interface CodeEditorProps {
  files: Array<{
    path: string;
    content: string;
    language: string;
    isModified?: boolean;
  }>;
  activeFile: string;
  onFileChange: (path: string, content: string) => void;
  onFileSelect: (path: string) => void;
  onFileClose: (path: string) => void;
  onFileSave: (path: string) => void;
  onRunCode: () => void;
  onStopExecution: () => void;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  readOnly?: boolean;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFile,
  onFileChange,
  onFileSelect,
  onFileClose,
  onFileSave,
  onRunCode,
  onStopExecution,
  showMinimap = true,
  showLineNumbers = true,
  wordWrap = false,
  fontSize = 14,
  readOnly = false,
  className = ''
}) => {
  const [tabs, setTabs] = useState<Array<{
    path: string;
    content: string;
    language: string;
    isModified: boolean;
    isActive: boolean;
  }>>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize tabs from files
  useEffect(() => {
    const newTabs = files.map(file => ({
      path: file.path,
      content: file.content,
      language: file.language,
      isModified: file.isModified || false,
      isActive: file.path === activeFile
    }));
    
    setTabs(newTabs);
    setActiveTabIndex(newTabs.findIndex(tab => tab.path === activeFile));
  }, [files, activeFile]);

  // Focus textarea when active tab changes
  useEffect(() => {
    if (textareaRef.current && activeTabIndex >= 0) {
      textareaRef.current.focus();
      // Ensure cursor is at the end of the content
      const content = tabs[activeTabIndex]?.content || '';
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [activeTabIndex, tabs]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            const activeTab = tabs[activeTabIndex];
            if (activeTab) {
              onFileSave(activeTab.path);
            }
            break;
          case 'f':
            e.preventDefault();
            setShowFindReplace(true);
            break;
          case 'r':
            e.preventDefault();
            onRunCode();
            break;
          case '=':
          case '+':
            e.preventDefault();
            setZoom(prev => Math.min(prev + 0.1, 2));
            break;
          case '-':
            e.preventDefault();
            setZoom(prev => Math.max(prev - 0.1, 0.5));
            break;
        }
      }

      if (e.key === 'Escape') {
        setShowFindReplace(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabIndex, onFileSave, onRunCode]);

  // Handle content changes
  const handleContentChange = (path: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.path === path 
        ? { ...tab, content, isModified: true }
        : tab
    ));
    onFileChange(path, content);
  };

  // Handle tab selection
  const handleTabSelect = (index: number) => {
    setActiveTabIndex(index);
    setTabs(prev => prev.map((tab, i) => ({
      ...tab,
      isActive: i === index
    })));
    onFileSelect(tabs[index].path);
  };

  // Handle tab close
  const handleTabClose = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const tab = tabs[index];
    if (tab.isModified) {
      if (confirm('Save changes to ' + tab.path + '?')) {
        onFileSave(tab.path);
      }
    }
    onFileClose(tab.path);
  };

  // Get language for syntax highlighting
  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const activeTab = tabs[activeTabIndex];

  return (
    <div className={`flex flex-col h-full bg-[#1e1e1e] text-white ${className}`}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d30] border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFileSave(activeTab?.path || '')}
            className="p-1.5 hover:bg-[#3e3e42] rounded transition-colors"
            title="Save (Ctrl+S)"
          >
            <FiSave className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFindReplace(true)}
            className="p-1.5 hover:bg-[#3e3e42] rounded transition-colors"
            title="Find (Ctrl+F)"
          >
            <FiSearch className="w-4 h-4" />
          </button>
          <button
            onClick={onRunCode}
            disabled={isExecuting}
            className={`p-1.5 rounded transition-colors ${
              isExecuting 
                ? 'bg-[#3e3e42] text-[#666666]' 
                : 'hover:bg-[#3e3e42]'
            }`}
            title="Run Code (Ctrl+R)"
          >
            <FiPlay className="w-4 h-4" />
          </button>
          <button
            onClick={onStopExecution}
            disabled={!isExecuting}
            className={`p-1.5 rounded transition-colors ${
              isExecuting
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-[#3e3e42] text-[#666666]'
            }`}
            title="Stop Execution"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
            className="p-1.5 hover:bg-[#3e3e42] rounded transition-colors"
            title="Zoom Out (Ctrl+-)"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#cccccc] min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            className="p-1.5 hover:bg-[#3e3e42] rounded transition-colors"
            title="Zoom In (Ctrl+=)"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#2d2d30] border-b border-[#3e3e42] overflow-x-auto">
        {tabs.map((tab, index) => (
          <div
            key={tab.path}
            className={`flex items-center gap-2 px-3 py-2 border-r border-[#3e3e42] cursor-pointer transition-colors ${
              tab.isActive 
                ? 'bg-[#1e1e1e] text-white' 
                : 'bg-[#2d2d30] text-[#cccccc] hover:bg-[#3e3e42]'
            }`}
            onClick={() => handleTabSelect(index)}
          >
            <LanguageIndicator 
              filename={tab.path} 
              showName={false} 
              size={12}
              className="flex-shrink-0"
            />
            <span className="text-sm whitespace-nowrap">
              {tab.path.split('/').pop()}
              {tab.isModified && <span className="text-[#007acc] ml-1">•</span>}
            </span>
            <button
              onClick={(e) => handleTabClose(index, e)}
              className="p-0.5 hover:bg-[#3e3e42] rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Close tab"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Find and Replace Bar */}
      {showFindReplace && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d30] border-b border-[#3e3e42]">
          <div className="flex items-center gap-2">
            <FiSearch className="w-4 h-4 text-[#cccccc]" />
            <input
              type="text"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder="Find"
              className="px-2 py-1 bg-[#1e1e1e] border border-[#3e3e42] rounded text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#007acc]"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiSearch className="w-4 h-4 text-[#cccccc]" />
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace"
              className="px-2 py-1 bg-[#1e1e1e] border border-[#3e3e42] rounded text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#007acc]"
            />
          </div>
          <button
            onClick={() => setShowFindReplace(false)}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
            title="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className="w-12 bg-[#1e1e1e] border-r border-[#3e3e42] text-right text-[#858585] text-sm font-mono select-none overflow-hidden">
            {activeTab?.content.split('\n').map((_, index) => (
              <div key={index} className="px-2 py-0.5">
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* Code Editor */}
        <div 
          className="flex-1 relative"
          onClick={() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }}
        >
          {/* Textarea for input handling */}
          <textarea
            ref={textareaRef}
            value={activeTab?.content || ''}
            onChange={(e) => activeTab && handleContentChange(activeTab.path, e.target.value)}
            onKeyDown={(e) => {
              // Handle tab key
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newValue = activeTab?.content.substring(0, start) + '  ' + activeTab?.content.substring(end);
                if (activeTab) {
                  handleContentChange(activeTab.path, newValue);
                  // Set cursor position after tab
                  setTimeout(() => {
                    e.currentTarget.setSelectionRange(start + 2, start + 2);
                  }, 0);
                }
              }
            }}
            onFocus={() => {
              // Ensure cursor is visible when focused
              if (textareaRef.current) {
                textareaRef.current.style.caretColor = '#ffffff';
              }
            }}
            onBlur={() => {
              // Keep cursor visible even when not focused
              if (textareaRef.current) {
                textareaRef.current.style.caretColor = '#ffffff';
              }
            }}
            className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-6 p-4 z-10"
            style={{
              fontSize: `${fontSize * zoom}px`,
              lineHeight: `${fontSize * zoom * 1.5}px`,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              caretColor: '#ffffff',
              color: 'transparent',
              caretShape: 'block'
            }}
            readOnly={readOnly}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            wrap={wordWrap ? 'soft' : 'off'}
          />
          
          {/* Syntax Highlighted Code */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <SyntaxHighlighter
              language={getLanguage(activeTab?.path || '')}
              style={vscDarkPlus}
              customStyle={{
                background: 'transparent',
                fontSize: `${fontSize * zoom}px`,
                lineHeight: `${fontSize * zoom * 1.5}px`,
                padding: '1rem',
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace'
              }}
              showLineNumbers={false}
              wrapLines={wordWrap}
            >
              {activeTab?.content || ''}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Minimap */}
        {showMinimap && (
          <div className="w-32 bg-[#1e1e1e] border-l border-[#3e3e42] relative">
            <div className="absolute inset-0 opacity-30">
              <SyntaxHighlighter
                language={getLanguage(activeTab?.path || '')}
                style={vscDarkPlus}
                customStyle={{
                  background: 'transparent',
                  fontSize: '2px',
                  lineHeight: '3px',
                  padding: '4px',
                  margin: 0,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                }}
                showLineNumbers={false}
              >
                {activeTab?.content || ''}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#007acc] text-white text-xs">
        <div className="flex items-center gap-4">
          <span>{activeTab?.content.split('\n').length || 0} lines</span>
          <span>•</span>
          <span>{activeTab?.content.length || 0} characters</span>
        </div>
        <div className="flex items-center gap-4">
          {activeTab && (
            <LanguageIndicator 
              filename={activeTab.path} 
              showName={true} 
              size={12}
              className="text-white"
            />
          )}
          <span>•</span>
          <span>{wordWrap ? 'Word Wrap: On' : 'Word Wrap: Off'}</span>
          {isExecuting && <span className="animate-pulse">Running...</span>}
        </div>
      </div>

      {/* Execution Output Panel */}
      {executionOutput.length > 0 && (
        <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d30] border-b border-[#3e3e42]">
            <span className="text-sm font-medium">Output</span>
            <button
              onClick={() => setExecutionOutput([])}
              className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
              title="Clear output"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {executionOutput.map((line, index) => (
              <div key={index} className="text-[#cccccc]">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
