import React, { useState } from 'react';
import { Notebook, Infographic } from '../types';
import { generateInfographic } from '../services/geminiService';

interface InfographicViewProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const InfographicView: React.FC<InfographicViewProps> = ({ notebook, onUpdateNotebook, onBack, isDarkMode, onToggleTheme }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const allText = notebook.sources.map(s => s.content).join('\n\n');
    
    if (!allText.trim()) {
      setError("Please add sources to the notebook before generating an infographic.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateInfographic(allText);
      
      if (imageUrl) {
        const newInfographic: Infographic = {
          id: Date.now().toString(),
          imageUrl: imageUrl,
          createdAt: Date.now(),
          prompt: "Generated from notebook sources"
        };

        onUpdateNotebook({
          ...notebook,
          infographics: [newInfographic, ...(notebook.infographics || [])]
        });
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (e) {
      setError("An error occurred during generation.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    onUpdateNotebook({
      ...notebook,
      infographics: (notebook.infographics || []).filter(info => info.id !== id)
    });
  };

  const latestInfographic = notebook.infographics && notebook.infographics.length > 0 
    ? notebook.infographics[0] 
    : null;

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-white/40 dark:border-white/10 flex items-center justify-between px-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl z-10 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/40 dark:hover:border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Workspace
          </button>
          <div className="h-6 w-px bg-white/40 dark:bg-white/10 mx-1"></div>
          <span className="font-bold text-slate-800 dark:text-white text-lg">Infographic Studio</span>
        </div>
        
         <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all backdrop-blur-md"
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
        
        {/* Left Control Panel */}
        <div className="w-full md:w-80 bg-white/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl p-6 flex flex-col shrink-0 shadow-xl transition-colors">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Create Visuals</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Transform your research into professional visuals.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
              isGenerating 
                ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-500/30 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Dreaming...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Generate New
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/50 backdrop-blur-sm text-red-700 dark:text-red-300 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="mt-8 flex-1 overflow-y-auto pr-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">History</h3>
            <div className="space-y-4">
              {(notebook.infographics || []).map((info) => (
                <div key={info.id} className="group relative rounded-xl overflow-hidden border border-white/40 dark:border-white/10 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
                  <img src={info.imageUrl} alt="History thumbnail" className="w-full h-28 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(info.id); }}
                      className="p-2 bg-white rounded-full text-red-500 hover:text-red-700 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {(!notebook.infographics || notebook.infographics.length === 0) && (
                <p className="text-sm text-slate-400 italic font-medium">No history yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Preview Area */}
        <div className="flex-1 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-auto p-4 transition-colors">
          <div className="min-h-full w-full flex flex-col items-center">
            {latestInfographic ? (
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl shadow-2xl max-w-4xl w-full my-auto backdrop-blur-sm border border-white/50 dark:border-white/10">
                <img 
                  src={latestInfographic.imageUrl} 
                  alt="Generated Infographic" 
                  className="w-full h-auto rounded-xl shadow-inner"
                />
                <div className="mt-4 flex justify-between items-center px-2 pb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                     Generated: {new Date(latestInfographic.createdAt).toLocaleString()}
                  </span>
                  <a 
                    href={latestInfographic.imageUrl} 
                    download={`infographic-${latestInfographic.id}.png`}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Download Image
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 my-auto">
                <div className="w-24 h-24 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/40 dark:border-white/10">
                   <svg className="w-10 h-10 text-slate-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </div>
                <p className="font-semibold text-lg">No infographic generated yet.</p>
                <p className="text-sm opacity-80 mt-1">Click "Generate New" to dream one up.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfographicView;