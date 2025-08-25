import React, { useState, useRef } from 'react';
import {
  FiFile, FiFolder, FiFolderPlus, FiSave, FiCopy, FiSettings, 
  FiX, FiMaximize2, FiChevronRight, FiClock, FiShare2,
  FiRefreshCw, FiDownload, FiUpload, FiEdit3
} from '@/lib/icons';

interface FileMenuProps {
  onNewFile: () => void;
  onNewWindow: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onOpenWorkspace: () => void;
  onOpenRecent: (file: string) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onSaveAll: () => void;
  onSaveWorkspaceAs: () => void;
  onAddFolderToWorkspace: () => void;
  onDuplicateWorkspace: () => void;
  onShare: () => void;
  onPreferences: () => void;
  onAutoSave: (enabled: boolean) => void;
  onRevertFile: () => void;
  onCloseEditor: () => void;
  onCloseFolder: () => void;
  onCloseWindow: () => void;
  recentFiles: string[];
  autoSaveEnabled: boolean;
}

const FileMenu: React.FC<FileMenuProps> = ({
  onNewFile, onNewWindow, onOpenFile, onOpenFolder, onOpenWorkspace,
  onOpenRecent, onSave, onSaveAs, onSaveAll, onSaveWorkspaceAs,
  onAddFolderToWorkspace, onDuplicateWorkspace, onShare, onPreferences,
  onAutoSave, onRevertFile, onCloseEditor, onCloseFolder, onCloseWindow,
  recentFiles, autoSaveEnabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRecentSubmenu, setShowRecentSubmenu] = useState(false);
  const [showShareSubmenu, setShowShareSubmenu] = useState(false);
  const [showPreferencesSubmenu, setShowPreferencesSubmenu] = useState(false);
  const [showNewWindowSubmenu, setShowNewWindowSubmenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
    setShowRecentSubmenu(false);
    setShowShareSubmenu(false);
    setShowPreferencesSubmenu(false);
    setShowNewWindowSubmenu(false);
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    shortcut, 
    onClick, 
    hasSubmenu = false,
    showSubmenu = false,
    onMouseEnter,
    disabled = false,
    separator = false 
  }: {
    icon?: any;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    hasSubmenu?: boolean;
    showSubmenu?: boolean;
    onMouseEnter?: () => void;
    disabled?: boolean;
    separator?: boolean;
  }) => {
    if (separator) {
      return <div className="h-px bg-[#3e3e42] my-1" />;
    }

    return (
      <div
        className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
          disabled 
            ? 'text-[#666666] cursor-not-allowed' 
            : 'text-white hover:bg-[#3e3e42]'
        } ${showSubmenu ? 'bg-[#3e3e42]' : ''}`}
        onClick={onClick && !disabled ? () => handleMenuItemClick(onClick) : undefined}
        onMouseEnter={onMouseEnter}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4" />}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {shortcut && (
            <span className="text-xs text-[#cccccc] font-mono">{shortcut}</span>
          )}
          {hasSubmenu && <FiChevronRight className="w-3 h-3" />}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm text-white hover:bg-[#3e3e42] transition-colors"
      >
        File
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setShowRecentSubmenu(false);
              setShowShareSubmenu(false);
              setShowPreferencesSubmenu(false);
              setShowNewWindowSubmenu(false);
            }}
          />
          
          {/* Main Menu */}
          <div className="absolute top-full left-0 z-50 w-80 bg-[#2d2d30] border border-[#3e3e42] rounded shadow-lg py-1">
            <MenuItem
              icon={FiFile}
              label="New Text File"
              shortcut="Ctrl+N"
              onClick={onNewFile}
            />
            <MenuItem
              icon={FiMaximize2}
              label="New Window"
              shortcut="Ctrl+Shift+N"
              hasSubmenu
              showSubmenu={showNewWindowSubmenu}
              onMouseEnter={() => {
                setShowNewWindowSubmenu(true);
                setShowRecentSubmenu(false);
                setShowShareSubmenu(false);
                setShowPreferencesSubmenu(false);
              }}
            />
            <MenuItem
              icon={FiCopy}
              label="New Window with Profile"
              hasSubmenu
              onMouseEnter={() => {
                setShowNewWindowSubmenu(false);
                setShowRecentSubmenu(false);
                setShowShareSubmenu(false);
                setShowPreferencesSubmenu(false);
              }}
            />
            
            <MenuItem separator label="" />
            
            <MenuItem
              icon={FiFolderPlus}
              label="Open File..."
              shortcut="Ctrl+O"
              onClick={onOpenFile}
            />
            <MenuItem
              icon={FiFolder}
              label="Open Folder..."
              shortcut="Ctrl+M Ctrl+O"
              onClick={onOpenFolder}
            />
            <MenuItem
              icon={FiDownload}
              label="Open Workspace from File..."
              onClick={onOpenWorkspace}
            />
            <MenuItem
              icon={FiClock}
              label="Open Recent"
              hasSubmenu
              showSubmenu={showRecentSubmenu}
              onMouseEnter={() => {
                setShowRecentSubmenu(true);
                setShowNewWindowSubmenu(false);
                setShowShareSubmenu(false);
                setShowPreferencesSubmenu(false);
              }}
            />
            
            <MenuItem separator label="" />
            
            <MenuItem
              icon={FiFolderPlus}
              label="Add Folder to Workspace..."
              onClick={onAddFolderToWorkspace}
            />
            <MenuItem
              icon={FiSave}
              label="Save Workspace As..."
              onClick={onSaveWorkspaceAs}
            />
            <MenuItem
              icon={FiCopy}
              label="Duplicate Workspace"
              onClick={onDuplicateWorkspace}
            />
            
            <MenuItem separator label="" />
            
            <MenuItem
              icon={FiSave}
              label="Save"
              shortcut="Ctrl+S"
              onClick={onSave}
            />
            <MenuItem
              icon={FiSave}
              label="Save As..."
              shortcut="Ctrl+Shift+S"
              onClick={onSaveAs}
            />
            <MenuItem
              icon={FiSave}
              label="Save All"
              shortcut="Ctrl+M S"
              onClick={onSaveAll}
            />
            
            <MenuItem separator label="" />
            
            <MenuItem
              icon={FiShare2}
              label="Share"
              hasSubmenu
              showSubmenu={showShareSubmenu}
              onMouseEnter={() => {
                setShowShareSubmenu(true);
                setShowRecentSubmenu(false);
                setShowNewWindowSubmenu(false);
                setShowPreferencesSubmenu(false);
              }}
            />
            
            <MenuItem separator label="" />
            
            <MenuItem
              icon={autoSaveEnabled ? FiSave : FiEdit3}
              label="Auto Save"
              onClick={() => onAutoSave(!autoSaveEnabled)}
            />
            
            <MenuItem
              icon={FiSettings}
              label="Preferences"
              hasSubmenu
              showSubmenu={showPreferencesSubmenu}
              onMouseEnter={() => {
                setShowPreferencesSubmenu(true);
                setShowRecentSubmenu(false);
                setShowShareSubmenu(false);
                setShowNewWindowSubmenu(false);
              }}
            />
            
            <MenuItem separator label="" />
            
            <MenuItem
              icon={FiRefreshCw}
              label="Revert File"
              onClick={onRevertFile}
            />
            <MenuItem
              icon={FiX}
              label="Close Editor"
              shortcut="Ctrl+F4"
              onClick={onCloseEditor}
            />
            <MenuItem
              icon={FiFolder}
              label="Close Folder"
              shortcut="Ctrl+M F"
              onClick={onCloseFolder}
            />
            <MenuItem
              icon={FiX}
              label="Close Window"
              shortcut="Alt+F4"
              onClick={onCloseWindow}
            />

            {/* Recent Files Submenu */}
            {showRecentSubmenu && (
              <div className="absolute left-full top-0 w-80 bg-[#2d2d30] border border-[#3e3e42] rounded shadow-lg py-1 ml-1">
                {recentFiles.length > 0 ? (
                  recentFiles.map((file, index) => (
                    <MenuItem
                      key={index}
                      icon={FiFile}
                      label={file.split('/').pop() || file}
                      onClick={() => onOpenRecent(file)}
                    />
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-[#666666]">No recent files</div>
                )}
                <MenuItem separator label="" />
                <MenuItem
                  icon={FiX}
                  label="Clear Recently Opened"
                  onClick={() => {}}
                />
              </div>
            )}

            {/* Share Submenu */}
            {showShareSubmenu && (
              <div className="absolute left-full top-0 w-64 bg-[#2d2d30] border border-[#3e3e42] rounded shadow-lg py-1 ml-1">
                <MenuItem
                  icon={FiUpload}
                  label="Export to GitHub"
                  onClick={() => onShare()}
                />
                <MenuItem
                  icon={FiShare2}
                  label="Share via Link"
                  onClick={() => onShare()}
                />
                <MenuItem
                  icon={FiDownload}
                  label="Download as ZIP"
                  onClick={() => onShare()}
                />
              </div>
            )}

            {/* Preferences Submenu */}
            {showPreferencesSubmenu && (
              <div className="absolute left-full top-0 w-64 bg-[#2d2d30] border border-[#3e3e42] rounded shadow-lg py-1 ml-1">
                <MenuItem
                  icon={FiSettings}
                  label="Settings"
                  onClick={onPreferences}
                />
                <MenuItem
                  icon={FiSettings}
                  label="Keyboard Shortcuts"
                  onClick={onPreferences}
                />
                <MenuItem
                  icon={FiSettings}
                  label="User Snippets"
                  onClick={onPreferences}
                />
                <MenuItem
                  icon={FiSettings}
                  label="Configure User Tasks"
                  onClick={onPreferences}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FileMenu;
