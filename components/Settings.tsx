import React, { useState } from 'react';
import { FiX, FiSettings, FiMonitor, FiEdit3, FiCode, FiSearch, FiFile, FiTerminal, FiGitBranch } from '@/lib/icons';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    editor: {
      fontSize: number;
      fontFamily: string;
      tabSize: number;
      wordWrap: boolean;
      showLineNumbers: boolean;
      showMinimap: boolean;
      autoSave: boolean;
      autoSaveDelay: number;
    };
    theme: {
      colorTheme: string;
      iconTheme: string;
    };
    workbench: {
      startupEditor: string;
      showTabs: boolean;
      enablePreview: boolean;
    };
    terminal: {
      fontSize: number;
      fontFamily: string;
      shell: string;
    };
    files: {
      autoGuessEncoding: boolean;
      trimTrailingWhitespace: boolean;
      insertFinalNewline: boolean;
    };
    search: {
      caseSensitive: boolean;
      wholeWord: boolean;
      regex: boolean;
    };
  };
  onSettingsChange: (category: string, key: string, value: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState('editor');

  if (!isOpen) return null;

  const tabs = [
    { id: 'editor', label: 'Editor', icon: FiEdit3 },
    { id: 'workbench', label: 'Workbench', icon: FiMonitor },
    { id: 'terminal', label: 'Terminal', icon: FiTerminal },
    { id: 'files', label: 'Files', icon: FiFile },
    { id: 'search', label: 'Search', icon: FiSearch },
  ];

  const SettingItem = ({ 
    label, 
    description, 
    children 
  }: { 
    label: string; 
    description?: string; 
    children: React.ReactNode 
  }) => (
    <div className="mb-6">
      <div className="mb-2">
        <label className="text-sm font-medium text-white">{label}</label>
        {description && (
          <p className="text-xs text-[#a0a0a0] mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );

  const renderEditorSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        label="Font Size" 
        description="Controls the font size in pixels"
      >
        <input
          type="number"
          min="8"
          max="72"
          value={settings.editor.fontSize}
          onChange={(e) => onSettingsChange('editor', 'fontSize', parseInt(e.target.value))}
          className="w-20 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        />
      </SettingItem>

      <SettingItem 
        label="Font Family" 
        description="Controls the font family"
      >
        <select
          value={settings.editor.fontFamily}
          onChange={(e) => onSettingsChange('editor', 'fontFamily', e.target.value)}
          className="w-64 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        >
          <option value="Consolas, Monaco, 'Courier New', monospace">Consolas</option>
          <option value="'Fira Code', monospace">Fira Code</option>
          <option value="'Source Code Pro', monospace">Source Code Pro</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          <option value="'Cascadia Code', monospace">Cascadia Code</option>
        </select>
      </SettingItem>

      <SettingItem 
        label="Tab Size" 
        description="The number of spaces a tab is equal to"
      >
        <input
          type="number"
          min="1"
          max="8"
          value={settings.editor.tabSize}
          onChange={(e) => onSettingsChange('editor', 'tabSize', parseInt(e.target.value))}
          className="w-20 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        />
      </SettingItem>

      <SettingItem 
        label="Word Wrap" 
        description="Controls how lines should wrap"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.editor.wordWrap}
            onChange={(e) => onSettingsChange('editor', 'wordWrap', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Enable word wrap</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Line Numbers" 
        description="Controls the display of line numbers"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.editor.showLineNumbers}
            onChange={(e) => onSettingsChange('editor', 'showLineNumbers', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Show line numbers</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Minimap" 
        description="Controls whether the minimap is shown"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.editor.showMinimap}
            onChange={(e) => onSettingsChange('editor', 'showMinimap', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Show minimap</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Auto Save" 
        description="Controls auto save of dirty files"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.editor.autoSave}
            onChange={(e) => onSettingsChange('editor', 'autoSave', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Enable auto save</span>
        </label>
      </SettingItem>

      {settings.editor.autoSave && (
        <SettingItem 
          label="Auto Save Delay" 
          description="Delay in milliseconds after which a dirty file is saved automatically"
        >
          <input
            type="number"
            min="100"
            max="10000"
            step="100"
            value={settings.editor.autoSaveDelay}
            onChange={(e) => onSettingsChange('editor', 'autoSaveDelay', parseInt(e.target.value))}
            className="w-32 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
          />
          <span className="text-xs text-[#a0a0a0] ml-2">ms</span>
        </SettingItem>
      )}
    </div>
  );

  const renderWorkbenchSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        label="Startup Editor" 
        description="Controls which editor is shown at startup"
      >
        <select
          value={settings.workbench.startupEditor}
          onChange={(e) => onSettingsChange('workbench', 'startupEditor', e.target.value)}
          className="w-64 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        >
          <option value="welcomePage">Welcome Page</option>
          <option value="newUntitledFile">New Untitled File</option>
          <option value="reopenClosedEditor">Reopen Closed Editor</option>
          <option value="none">None</option>
        </select>
      </SettingItem>

      <SettingItem 
        label="Show Tabs" 
        description="Controls whether opened editors should show in tabs"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.workbench.showTabs}
            onChange={(e) => onSettingsChange('workbench', 'showTabs', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Show editor tabs</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Enable Preview" 
        description="Controls whether editors opened from the tree should open in preview mode"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.workbench.enablePreview}
            onChange={(e) => onSettingsChange('workbench', 'enablePreview', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Enable preview mode</span>
        </label>
      </SettingItem>
    </div>
  );

  const renderTerminalSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        label="Font Size" 
        description="Controls the font size in pixels of the terminal"
      >
        <input
          type="number"
          min="8"
          max="72"
          value={settings.terminal.fontSize}
          onChange={(e) => onSettingsChange('terminal', 'fontSize', parseInt(e.target.value))}
          className="w-20 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        />
      </SettingItem>

      <SettingItem 
        label="Font Family" 
        description="Controls the font family of the terminal"
      >
        <select
          value={settings.terminal.fontFamily}
          onChange={(e) => onSettingsChange('terminal', 'fontFamily', e.target.value)}
          className="w-64 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        >
          <option value="Consolas, Monaco, 'Courier New', monospace">Consolas</option>
          <option value="'Fira Code', monospace">Fira Code</option>
          <option value="'Source Code Pro', monospace">Source Code Pro</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          <option value="'Cascadia Code', monospace">Cascadia Code</option>
        </select>
      </SettingItem>

      <SettingItem 
        label="Shell Path" 
        description="The path of the shell that the terminal uses"
      >
        <select
          value={settings.terminal.shell}
          onChange={(e) => onSettingsChange('terminal', 'shell', e.target.value)}
          className="w-64 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:outline-none focus:border-[#0066ff]"
        >
          <option value="powershell">PowerShell</option>
          <option value="cmd">Command Prompt</option>
          <option value="bash">Bash</option>
          <option value="wsl">WSL</option>
        </select>
      </SettingItem>
    </div>
  );

  const renderFilesSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        label="Auto Guess Encoding" 
        description="When enabled, will attempt to guess the character set encoding when opening files"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.files.autoGuessEncoding}
            onChange={(e) => onSettingsChange('files', 'autoGuessEncoding', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Auto guess encoding</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Trim Trailing Whitespace" 
        description="When enabled, will trim trailing whitespace when saving a file"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.files.trimTrailingWhitespace}
            onChange={(e) => onSettingsChange('files', 'trimTrailingWhitespace', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Trim trailing whitespace</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Insert Final Newline" 
        description="When enabled, insert a final new line at the end of the file when saving it"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.files.insertFinalNewline}
            onChange={(e) => onSettingsChange('files', 'insertFinalNewline', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Insert final newline</span>
        </label>
      </SettingItem>
    </div>
  );

  const renderSearchSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        label="Case Sensitive" 
        description="Controls whether search should be case sensitive by default"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.search.caseSensitive}
            onChange={(e) => onSettingsChange('search', 'caseSensitive', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Case sensitive by default</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Whole Word" 
        description="Controls whether search should match whole words by default"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.search.wholeWord}
            onChange={(e) => onSettingsChange('search', 'wholeWord', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Whole word by default</span>
        </label>
      </SettingItem>

      <SettingItem 
        label="Regular Expression" 
        description="Controls whether search should use regular expressions by default"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.search.regex}
            onChange={(e) => onSettingsChange('search', 'regex', e.target.checked)}
            className="w-4 h-4 text-[#0066ff] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#0066ff]"
          />
          <span className="text-sm text-white">Regular expression by default</span>
        </label>
      </SettingItem>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return renderEditorSettings();
      case 'workbench':
        return renderWorkbenchSettings();
      case 'terminal':
        return renderTerminalSettings();
      case 'files':
        return renderFilesSettings();
      case 'search':
        return renderSearchSettings();
      default:
        return renderEditorSettings();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[90%] max-w-6xl h-[90%] bg-[#1e1e1e] border border-[#3e3e42] rounded-lg flex">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center justify-between px-4 rounded-t-lg">
          <div className="flex items-center gap-2">
            <FiSettings className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-[#252526] border-r border-[#3e3e42] mt-12">
          <div className="p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0066ff] text-white'
                      : 'text-[#cccccc] hover:bg-[#3e3e42]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 mt-12 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 capitalize">
              {activeTab} Settings
            </h2>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
