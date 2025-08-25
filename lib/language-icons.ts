// Language and file type icon mapping utility
import { 
  SiJavascript,
  SiReact,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiC,
  SiPhp,
  SiRuby,
  SiGo,
  SiRust,
  SiKotlin,
  SiSwift,
  SiDart,
  SiHtml5,
  SiCss3,
  SiSass,
  SiLess,
  SiJson,
  SiXml,
  SiYaml,
  SiMarkdown,
  SiNodedotjs,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiDjango,
  SiFlask,
  SiFastapi,
  SiExpress,
  SiSpring,
  SiLaravel,
  SiFlutter,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGit
} from '@/lib/icons';

import { FiFile, FiFolder } from '@/lib/icons';
import { ComponentType } from 'react';

// Type for icon components
type IconComponent = ComponentType<{ className?: string; size?: number }>;

// File extension to icon mapping
export const fileExtensionIcons: Record<string, IconComponent> = {
  // JavaScript/TypeScript
  'js': SiJavascript,
  'jsx': SiReact,
  'ts': SiTypescript,
  'tsx': SiReact,
  'mjs': SiJavascript,
  'cjs': SiJavascript,
  
  // Python
  'py': SiPython,
  'pyx': SiPython,
  'pyi': SiPython,
  'pyw': SiPython,
  
  // Java/JVM Languages
  'java': SiJavascript,
  'scala': SiJavascript,
  'groovy': SiJavascript,
  
  // C/C++
  'c': SiC,
  'cpp': SiCplusplus,
  'cxx': SiCplusplus,
  'cc': SiCplusplus,
  'h': SiC,
  'hpp': SiCplusplus,
  'hxx': SiCplusplus,
  
  // C#
  'cs': FiFile,
  'vb': FiFile,
  
  // Web Technologies
  'html': SiHtml5,
  'htm': SiHtml5,
  'css': SiCss3,
  'scss': SiSass,
  'sass': SiSass,
  'less': SiLess,
  
  // Mobile
  'swift': SiJavascript, // Fallback to Java icon
  'dart': SiJavascript, // Fallback to Java icon
  
  // Other Languages
  'php': SiPhp,
  'rb': SiRuby,
  'go': SiGo,
  'rs': SiRust,
  
  // Data/Config Files
  'json': SiJson,
  'xml': SiXml,
  'yaml': SiYaml,
  'yml': SiYaml,
  'md': SiMarkdown,
  'markdown': SiMarkdown,
  
  // Framework specific
  'vue': SiVuedotjs,
  'svelte': SiSvelte,
  
  // Database
  'sql': SiMysql,
  
  // Docker
  'dockerfile': SiDocker,
  
  // Git
  'gitignore': SiGit,
  'gitconfig': SiGit,
};

// Language name to icon mapping
export const languageIcons: Record<string, IconComponent> = {
  'javascript': SiJavascript,
  'typescript': SiTypescript,
  'react': SiReact,
  'python': SiPython,
  'java': SiJavascript,
  'csharp': FiFile,
  'c#': FiFile,
  'cpp': SiCplusplus,
  'c++': SiCplusplus,
  'c': SiC,
  'php': SiPhp,
  'ruby': SiRuby,
  'go': SiGo,
  'golang': SiGo,
  'rust': SiRust,
  'kotlin': SiJavascript, // Fallback to Java icon
  'swift': SiJavascript, // Fallback to Java icon
  'dart': SiJavascript, // Fallback to Java icon
  'html': SiHtml5,
  'css': SiCss3,
  'sass': SiSass,
  'scss': SiSass,
  'less': SiLess,
  'vue': SiVuedotjs,
  'vuejs': SiVuedotjs,
  'angular': SiAngular,
  'svelte': SiSvelte,
  'nodejs': SiNodedotjs,
  'node': SiNodedotjs,
  'django': SiDjango,
  'flask': SiFlask,
  'fastapi': SiFastapi,
  'express': SiExpress,
  'spring': SiSpring,
  'laravel': SiLaravel,

  'flutter': SiFlutter,
};

// Framework/Library specific colors
export const languageColors: Record<string, string> = {
  'javascript': '#F7DF1E',
  'typescript': '#3178C6',
  'react': '#61DAFB',
  'python': '#3776AB',
  'java': '#ED8B00',
  'csharp': '#239120',
  'cpp': '#00599C',
  'c': '#A8B9CC',
  'php': '#777BB4',
  'ruby': '#CC342D',
  'go': '#00ADD8',
  'rust': '#000000',
  'kotlin': '#7F52FF',
  'swift': '#FA7343',
  'dart': '#0175C2',
  'html': '#E34F26',
  'css': '#1572B6',
  'sass': '#CC6699',
  'vue': '#4FC08D',
  'angular': '#DD0031',
  'svelte': '#FF3E00',
  'nodejs': '#339933',
};

/**
 * Get the appropriate icon for a file based on its extension
 */
export function getFileIcon(filename: string): IconComponent {
  if (!filename) return FiFile;
  
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return FiFile;
  
  return fileExtensionIcons[extension] || FiFile;
}

/**
 * Get the appropriate icon for a language by name
 */
export function getLanguageIcon(language: string): IconComponent {
  const normalizedLanguage = language.toLowerCase().trim();
  return languageIcons[normalizedLanguage] || FiFile;
}

/**
 * Get the color associated with a language
 */
export function getLanguageColor(language: string): string {
  const normalizedLanguage = language.toLowerCase().trim();
  return languageColors[normalizedLanguage] || '#6B7280';
}

/**
 * Get folder icon (can be customized later)
 */
export function getFolderIcon(): IconComponent {
  return FiFolder;
}

/**
 * Get all supported languages with their icons
 */
export function getSupportedLanguagesWithIcons(): Array<{
  name: string;
  displayName: string;
  icon: IconComponent;
  color: string;
}> {
  return [
    { name: 'javascript', displayName: 'JavaScript', icon: SiJavascript, color: languageColors.javascript },
    { name: 'typescript', displayName: 'TypeScript', icon: SiTypescript, color: languageColors.typescript },
    { name: 'react', displayName: 'React', icon: SiReact, color: languageColors.react },
    { name: 'python', displayName: 'Python', icon: SiPython, color: languageColors.python },
    { name: 'java', displayName: 'Java', icon: SiJavascript, color: languageColors.java },
    { name: 'csharp', displayName: 'C#', icon: FiFile, color: languageColors.csharp },
    { name: 'cpp', displayName: 'C++', icon: SiCplusplus, color: languageColors.cpp },
    { name: 'c', displayName: 'C', icon: SiC, color: languageColors.c },
    { name: 'php', displayName: 'PHP', icon: SiPhp, color: languageColors.php },
    { name: 'ruby', displayName: 'Ruby', icon: SiRuby, color: languageColors.ruby },
    { name: 'go', displayName: 'Go', icon: SiGo, color: languageColors.go },
    { name: 'rust', displayName: 'Rust', icon: SiRust, color: languageColors.rust },
    { name: 'vue', displayName: 'Vue.js', icon: SiVuedotjs, color: languageColors.vue },
    { name: 'angular', displayName: 'Angular', icon: SiAngular, color: languageColors.angular },
    { name: 'svelte', displayName: 'Svelte', icon: SiSvelte, color: languageColors.svelte },
    { name: 'nodejs', displayName: 'Node.js', icon: SiNodedotjs, color: languageColors.nodejs },
  ];
}
