import React, { useCallback } from 'react';
import { Source } from '../types';

interface SourceSidebarProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
}

const SourceSidebar: React.FC<SourceSidebarProps> = ({ sources, onAddSource, onRemoveSource }) => {

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        const newSource: Source = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: 'text',
          content: text,
          timestamp: Date.now()
        };
        onAddSource(newSource);
      };
      reader.readAsText(file);
    });

    event.target.value = '';
  }, [onAddSource]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Sources</h2>
        <div className="relative group">
          <input
            type="file"
            id="source-upload"
            className="hidden"
            multiple
            accept=".txt,.md,.json,.csv"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="source-upload"
            className="flex items-center justify-center w-full px-4 py-2.5 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:shadow-md active:scale-95"
          >
            <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Source
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sources.length === 0 && (
          <div className="text-center p-6 text-slate-400 dark:text-slate-500 text-sm font-medium">
            No sources yet.<br/><span className="text-xs opacity-70">Upload text to start.</span>
          </div>
        )}
        
        {sources.map((source) => (
          <div key={source.id} className="group relative flex items-center justify-between p-3 bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 rounded-xl border border-white/30 dark:border-white/5 shadow-sm transition-all hover:shadow-md cursor-default">
            <div className="flex items-center overflow-hidden w-full">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/20 border border-red-100/50 dark:border-red-500/20 flex items-center justify-center shrink-0 text-red-500 dark:text-red-400 mr-3 shadow-inner">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="truncate flex-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{source.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">{source.content.length} chars</p>
              </div>
            </div>
            <button 
              onClick={() => onRemoveSource(source.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-100/80 dark:bg-red-900/80 hover:bg-red-200 dark:hover:bg-red-800 text-red-500 dark:text-red-300 rounded-lg transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-3 text-[10px] font-medium text-slate-400 dark:text-slate-500 text-center border-t border-white/30 dark:border-white/10 bg-white/10 dark:bg-black/20">
        Processed Locally
      </div>
    </div>
  );
};

export default SourceSidebar;