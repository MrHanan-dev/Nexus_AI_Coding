'use client';

import React from 'react';
import { getSupportedLanguagesWithIcons } from '@/lib/language-icons';

interface LanguageListProps {
  className?: string;
  iconSize?: number;
  showNames?: boolean;
  inline?: boolean;
}

const LanguageList: React.FC<LanguageListProps> = ({ 
  className = '', 
  iconSize = 20, 
  showNames = true,
  inline = false 
}) => {
  const languages = getSupportedLanguagesWithIcons();
  
  if (inline) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
                 {languages.map((lang) => {
           const IconComponent = lang.icon;
           // Fallback to a simple div if icon is undefined
           if (!IconComponent) {
             return (
               <div 
                 key={lang.name} 
                 className="flex items-center gap-1 text-sm"
                 title={lang.displayName}
               >
                 <div 
                   className="flex-shrink-0 w-4 h-4 rounded bg-gray-600"
                   style={{ backgroundColor: lang.color }}
                 />
                 {showNames && (
                   <span className="text-gray-300">{lang.displayName}</span>
                 )}
               </div>
             );
           }
           return (
             <div 
               key={lang.name} 
               className="flex items-center gap-1 text-sm"
               title={lang.displayName}
             >
               <IconComponent 
                 className="flex-shrink-0" 
                 size={iconSize}
                 style={{ color: lang.color }}
               />
               {showNames && (
                 <span className="text-gray-300">{lang.displayName}</span>
               )}
             </div>
           );
         })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 ${className}`}>
             {languages.map((lang) => {
         const IconComponent = lang.icon;
         // Fallback to a simple div if icon is undefined
         if (!IconComponent) {
           return (
             <div 
               key={lang.name} 
               className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
               title={lang.displayName}
             >
               <div 
                 className="mb-1 w-6 h-6 rounded"
                 style={{ backgroundColor: lang.color }}
               />
               {showNames && (
                 <span className="text-xs text-gray-300">{lang.displayName}</span>
               )}
             </div>
           );
         }
         return (
           <div 
             key={lang.name} 
             className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
             title={lang.displayName}
           >
             <IconComponent 
               className="mb-1" 
               size={iconSize}
               style={{ color: lang.color }}
             />
             {showNames && (
               <span className="text-xs text-gray-300">{lang.displayName}</span>
             )}
           </div>
         );
       })}
    </div>
  );
};

export default LanguageList;
