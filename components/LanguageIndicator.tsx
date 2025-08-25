'use client';

import React from 'react';
import { getFileIcon, getLanguageColor } from '@/lib/language-icons';

interface LanguageIndicatorProps {
  filename?: string;
  className?: string;
  showName?: boolean;
  size?: number;
}

const LanguageIndicator: React.FC<LanguageIndicatorProps> = ({ 
  filename, 
  className = '',
  showName = true,
  size = 16
}) => {
  if (!filename) return null;

  const IconComponent = getFileIcon(filename);
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const color = getLanguageColor(extension);
  
  // Get language name from extension
  const getLanguageName = (ext: string): string => {
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'React',
      'ts': 'TypeScript',
      'tsx': 'React',
      'py': 'Python',
      'java': 'Java',
      'cs': 'C#',
      'cpp': 'C++',
      'c': 'C',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'kt': 'Kotlin',
      'swift': 'Swift',
      'dart': 'Dart',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      'vue': 'Vue',
      'svelte': 'Svelte',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'sql': 'SQL',
    };
    
    return languageMap[ext] || ext.toUpperCase();
  };
  
  // Fallback if IconComponent is undefined
  if (!IconComponent) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div 
          className="flex-shrink-0 rounded"
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color 
          }}
        />
        {showName && (
          <span className="text-xs text-gray-300">
            {getLanguageName(extension)}
          </span>
        )}
      </div>
    );
  }

  const languageName = getLanguageName(extension);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <IconComponent 
        size={size}
        style={{ color }}
      />
      {showName && (
        <span className="text-xs text-gray-300">
          {languageName}
        </span>
      )}
    </div>
  );
};

export default LanguageIndicator;
