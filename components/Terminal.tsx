'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiTerminal, FiX, FiMaximize2, FiMinimize2, FiCopy, FiTrash2 } from 'react-icons/fi';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand?: (command: string) => void;
  output?: string;
  isExecuting?: boolean;
  onFileSystemUpdate?: () => void;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

const Terminal: React.FC<TerminalProps> = ({ 
  isOpen, 
  onClose, 
  onCommand, 
  output, 
  isExecuting,
  onFileSystemUpdate
}) => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: 'Terminal ready. Type "help" for available commands.',
      timestamp: new Date()
    }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableCommands = {
    'help': 'Show available commands',
    'clear': 'Clear terminal output',
    'ls': 'List files in current directory',
    'pwd': 'Show current working directory',
    'npm install': 'Install npm packages',
    'npm run dev': 'Start development server',
    'git status': 'Show git status',
    'git add .': 'Stage all changes',
    'git commit -m "message"': 'Commit changes',
    'git push': 'Push to remote repository',
    'node --version': 'Show Node.js version',
    'npm --version': 'Show npm version'
  };

  const executeRealCommand = async (command: string): Promise<string> => {
    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.output || result.error || 'Command executed successfully';
    } catch (error) {
      console.error('Error executing command:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date()
    };

    setTerminalLines(prev => [...prev, newLine]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentCommand('');
    setIsExecutingCommand(true);

    // Add command to history
    if (!commandHistory.includes(command)) {
      setCommandHistory(prev => [...prev, command]);
    }

    let response = '';
    
    try {
      // Execute real command for npm install
      if (command.toLowerCase().startsWith('npm install')) {
        response = await executeRealCommand(command);
        
        // Update file system if packages were installed
        if (response.includes('added') || response.includes('packages') || response.includes('successfully')) {
          // Trigger file system update
          if (onFileSystemUpdate) {
            setTimeout(() => {
              onFileSystemUpdate();
            }, 1000);
          }
        }
      } else {
        // For other commands, use real execution or simulation
        switch (command.toLowerCase()) {
          case 'help':
            response = 'Available commands:\n' + 
              Object.entries(availableCommands)
                .map(([cmd, desc]) => `  ${cmd} - ${desc}`)
                .join('\n');
            break;
          
          case 'clear':
            setTerminalLines([{
              id: Date.now().toString(),
              type: 'info',
              content: 'Terminal cleared.',
              timestamp: new Date()
            }]);
            setIsExecutingCommand(false);
            return;
          
          case 'ls':
            response = await executeRealCommand('dir');
            break;
          
          case 'pwd':
            response = await executeRealCommand('cd');
            break;
          
          case 'npm run dev':
            response = await executeRealCommand(command);
            break;
          
          case 'git status':
            response = await executeRealCommand(command);
            break;
          
          case 'git add .':
            response = await executeRealCommand(command);
            break;
          
          case 'node --version':
            response = await executeRealCommand(command);
            break;
          
          case 'npm --version':
            response = await executeRealCommand(command);
            break;
          
          default:
            if (command.startsWith('git commit -m')) {
              response = await executeRealCommand(command);
            } else if (command === 'git push') {
              response = await executeRealCommand(command);
            } else {
              response = await executeRealCommand(command);
            }
        }
      }
    } catch (error) {
      response = `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    const outputLine: TerminalLine = {
      id: (Date.now() + 1).toString(),
      type: response.includes('error') || response.includes('Error') ? 'error' : 'output',
      content: response,
      timestamp: new Date()
    };

    setTerminalLines(prev => [...prev, outputLine]);
    setIsExecutingCommand(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecutingCommand) {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const clearTerminal = () => {
    setTerminalLines([{
      id: Date.now().toString(),
      type: 'info',
      content: 'Terminal cleared.',
      timestamp: new Date()
    }]);
  };

  const copyOutput = () => {
    const output = terminalLines.map(line => line.content).join('\n');
    navigator.clipboard.writeText(output);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className={`bg-[#0a0a0a] border-t border-[#2a2a2a] transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-80'
      }`}>
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <FiTerminal className="text-green-400" />
            <span className="text-white text-sm font-medium">Terminal</span>
            {(isExecuting || isExecutingCommand) && (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
                <span className="text-green-400 text-xs">Executing...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={copyOutput}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Copy output"
            >
              <FiCopy className="w-4 h-4" />
            </button>
            <button
              onClick={clearTerminal}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Clear terminal"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <FiMaximize2 className="w-4 h-4" /> : <FiMinimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Close terminal"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        {!isMinimized && (
          <>
            <div 
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto h-64 font-mono text-sm"
            >
              {terminalLines.map((line) => (
                <div key={line.id} className="mb-1">
                  <div className={`${
                    line.type === 'input' ? 'text-green-400' :
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'info' ? 'text-blue-400' :
                    'text-gray-300'
                  }`}>
                    {line.content.split('\n').map((part, index) => (
                      <div key={index}>{part}</div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Command Input */}
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white outline-none border-none"
                  placeholder={isExecutingCommand ? "Executing command..." : "Type a command..."}
                  disabled={isExecutingCommand}
                />
              </div>
            </div>

            {/* Quick Commands */}
            <div className="px-4 py-2 bg-[#1a1a1a] border-t border-[#2a2a2a]">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Quick commands:</span>
                {['npm install', 'npm run dev', 'git status', 'clear'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => !isExecutingCommand && executeCommand(cmd)}
                    disabled={isExecutingCommand}
                    className="px-2 py-1 bg-[#2a2a2a] rounded hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Terminal;
