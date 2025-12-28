import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Notebook, Draft, Note } from '../types';
import { transformContent } from '../services/geminiService';

interface DraftingViewProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DraftingView: React.FC<DraftingViewProps> = ({ notebook, onUpdateNotebook, onBack, isDarkMode, onToggleTheme }) => {
  const [inputType, setInputType] = useState<'notebook' | 'custom'>('notebook');
  const [customText, setCustomText] = useState('');
  const [targetFormat, setTargetFormat] = useState<Draft['type']>('cleanup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraft, setActiveDraft] = useState<Draft | null>(null);

  const handleGenerate = async () => {
    let inputContent = '';
    
    if (inputType === 'notebook') {
      inputContent = notebook.sources.map(s => `[Source: ${s.name}]\n${s.content}`).join('\n\n');
      if (!inputContent.trim()) {
        alert("Your notebook has no sources! Please add sources or switch to 'Paste Text' mode.");
        return;
      }
    } else {
      inputContent = customText;
      if (!inputContent.trim()) {
        alert("Please paste some text to transform.");
        return;
      }
    }

    setIsGenerating(true);
    try {
      const result = await transformContent(inputContent, targetFormat);
      
      const newDraft: Draft = {
        id: Date.now().toString(),
        title: `${formatLabel(targetFormat)} - ${new Date().toLocaleTimeString()}`,
        type: targetFormat,
        content: result,
        createdAt: Date.now()
      };

      const updatedDrafts = [newDraft, ...(notebook.drafts || [])];
      onUpdateNotebook({ ...notebook, drafts: updatedDrafts });
      setActiveDraft(newDraft);

    } catch (e) {
      console.error(e);
      alert("Failed to generate draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!activeDraft) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: `# ${activeDraft.title}\n\n${activeDraft.content}`,
      createdAt: Date.now()
    };

    onUpdateNotebook({
      ...notebook,
      notes: [newNote, ...(notebook.notes || [])]
    });
    
    alert("Saved to Notebook Notes!");
  };

  const handleDeleteDraft = (id: string) => {
    const updatedDrafts = (notebook.drafts || []).filter(d => d.id !== id);
    onUpdateNotebook({ ...notebook, drafts: updatedDrafts });
    if (activeDraft?.id === id) setActiveDraft(null);
  };

  const formatLabel = (type: string) => {
    switch (type) {
      case 'cleanup': return 'Clean Up & Structure';
      case 'essay': return 'Essay Outline';
      case 'study_guide': return 'Study Guide';
      case 'summary': return 'Executive Summary';
      case 'email': return 'Formal Email';
      default: return type;
    }
  };

  const targetOptions: { id: Draft['type'], label: string }[] = [
    { id: 'cleanup', label: 'Clean Up & Structure' },
    { id: 'essay', label: 'Essay Outline' },
    { id: 'study_guide', label: 'Study Guide' },
    { id: 'summary', label: 'Executive Summary' },
    { id: 'email', label: 'Formal Email' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      
      {/* Header */}
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
          <span className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <span className="text-2xl">✨</span> Magic Drafter
          </span>
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
        <div className="w-full md:w-96 bg-white/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl p-6 flex flex-col shrink-0 shadow-xl transition-colors overflow-y-auto">
            
            {/* Input Configuration */}
            <div className="mb-6 space-y-4">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">1. Input Source</h3>
                    <div className="flex bg-white/40 dark:bg-white/5 rounded-xl p-1 border border-white/20 dark:border-white/10">
                        <button 
                            onClick={() => setInputType('notebook')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${inputType === 'notebook' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Notebook Sources
                        </button>
                        <button 
                            onClick={() => setInputType('custom')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${inputType === 'custom' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Paste Text
                        </button>
                    </div>
                </div>

                {inputType === 'custom' && (
                    <textarea 
                        value={customText} 
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Paste your messy notes, ideas, or brain dump here..."
                        className="w-full h-32 p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                )}

                <div>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">2. Target Output</h3>
                    <div className="flex flex-col gap-2">
                        {targetOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setTargetFormat(option.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                                    targetFormat === option.id
                                    ? 'bg-blue-600/90 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'bg-white/40 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
                        isGenerating 
                        ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/30 hover:scale-[1.02]'
                    }`}
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded-full animate-bounce"/>Transforming...</span>
                    ) : (
                        "Convert Mess to Magic"
                    )}
                </button>
            </div>

            <div className="h-px bg-white/30 dark:bg-white/10 mb-6"></div>

            {/* History List */}
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">History</h3>
            <div className="space-y-2">
                {(notebook.drafts || []).map(draft => (
                    <div 
                        key={draft.id}
                        onClick={() => setActiveDraft(draft)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                            activeDraft?.id === draft.id
                            ? 'bg-pink-50/80 dark:bg-pink-900/30 border-pink-400 dark:border-pink-700 ring-1 ring-pink-200 dark:ring-pink-800'
                            : 'bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                        }`}
                    >
                        <div className="overflow-hidden">
                            <h4 className={`text-sm font-semibold truncate ${activeDraft?.id === draft.id ? 'text-pink-700 dark:text-pink-300' : 'text-slate-700 dark:text-slate-300'}`}>{draft.title}</h4>
                            <span className="text-[10px] text-slate-400 uppercase font-medium">{formatLabel(draft.type)}</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteDraft(draft.id); }}
                            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
                {(!notebook.drafts || notebook.drafts.length === 0) && (
                     <p className="text-sm text-slate-400 italic">No drafts yet.</p>
                )}
            </div>
        </div>

        {/* Center: Output Area */}
        <div className="flex-1 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col relative transition-colors">
            {activeDraft ? (
                <>
                    <div className="bg-white/40 dark:bg-slate-900/40 p-4 border-b border-white/40 dark:border-white/10 flex items-center justify-between shrink-0">
                         <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Generated Output</span>
                         <button 
                             onClick={handleSaveToNotes}
                             className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm shadow-md"
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save to Notes
                         </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                         <div className="prose prose-slate dark:prose-invert max-w-none">
                             <ReactMarkdown>{activeDraft.content}</ReactMarkdown>
                         </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <div className="w-24 h-24 bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/20 dark:border-white/10">
                        <svg className="w-10 h-10 text-slate-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold">Transform Messy Notes into Academic Gold</p>
                    <p className="text-sm opacity-80 mt-1 max-w-md text-center">Paste raw text or use your notebook sources to generate essay outlines, study guides, and more.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default DraftingView;