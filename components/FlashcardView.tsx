import React, { useState } from 'react';
import { Notebook, FlashcardSet } from '../types';
import { generateFlashcards } from '../services/geminiService';

interface FlashcardViewProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ notebook, onUpdateNotebook, onBack, isDarkMode, onToggleTheme }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSetId, setActiveSetId] = useState<string | null>(
    notebook.flashcardSets && notebook.flashcardSets.length > 0 ? notebook.flashcardSets[0].id : null
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSet = notebook.flashcardSets?.find(s => s.id === activeSetId);

  const handleGenerate = async () => {
    const allText = notebook.sources.map(s => s.content).join('\n\n');
    
    if (!allText.trim()) {
      setError("Please add sources to the notebook before generating flashcards.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFlashcards(allText);
      
      const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title: result.title || "Study Set",
        cards: result.cards || [],
        createdAt: Date.now()
      };

      onUpdateNotebook({
        ...notebook,
        flashcardSets: [newSet, ...(notebook.flashcardSets || [])]
      });
      
      setActiveSetId(newSet.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      
    } catch (e) {
      setError("An error occurred during generation.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSet = (id: string) => {
    const updatedSets = (notebook.flashcardSets || []).filter(s => s.id !== id);
    onUpdateNotebook({
      ...notebook,
      flashcardSets: updatedSets
    });
    
    if (activeSetId === id) {
      setActiveSetId(updatedSets.length > 0 ? updatedSets[0].id : null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const nextCard = () => {
    if (!activeSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % activeSet.cards.length);
    }, 200);
  };

  const prevCard = () => {
    if (!activeSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + activeSet.cards.length) % activeSet.cards.length);
    }, 200);
  };

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
          <span className="font-bold text-slate-800 dark:text-white text-lg">Flashcard Studio</span>
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
        
        {/* Left Sidebar */}
        <div className="w-full md:w-80 bg-white/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl p-6 flex flex-col shrink-0 shadow-xl transition-colors">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">My Decks</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Knowledge distillation via Gemini.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
              isGenerating 
                ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/30 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Distilling...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Deck
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded-xl border border-red-100 dark:border-red-900 font-medium">
              {error}
            </div>
          )}

          <div className="mt-8 flex-1 overflow-y-auto space-y-3 pr-1">
            {(notebook.flashcardSets || []).map((set) => (
              <div 
                key={set.id} 
                onClick={() => { setActiveSetId(set.id); setCurrentCardIndex(0); setIsFlipped(false); }}
                className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeSetId === set.id 
                    ? 'bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800 shadow-sm' 
                    : 'bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-md'
                }`}
              >
                <div>
                  <h3 className={`font-semibold text-sm ${activeSetId === set.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {set.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{set.cards.length} cards • {new Date(set.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSet(set.id); }}
                  className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Flashcard Study Area */}
        <div className="flex-1 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col items-center justify-center p-6 relative transition-colors">
          
          {activeSet ? (
            <div className="w-full max-w-2xl flex flex-col items-center">
              <div className="mb-8 flex items-center gap-2 px-4 py-1 bg-white/30 dark:bg-white/5 rounded-full border border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-400 font-semibold text-sm backdrop-blur-md shadow-sm">
                 <span>Card {currentCardIndex + 1} of {activeSet.cards.length}</span>
              </div>

              {/* The Card */}
              <div className="relative w-full aspect-[5/3] perspective-1000 group">
                <div 
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white/60 dark:border-white/10 shadow-inner transition-colors">
                    <span className="absolute top-8 left-8 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Term</span>
                    <p className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {activeSet.cards[currentCardIndex].front}
                    </p>
                    <span className="absolute bottom-8 text-sm text-slate-400 dark:text-slate-500 font-medium opacity-70">Tap to flip</span>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-50/95 to-blue-50/95 dark:from-indigo-900/95 dark:to-blue-900/95 backdrop-blur-md rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-indigo-100/50 dark:border-indigo-800/50 rotate-y-180 shadow-inner transition-colors">
                    <span className="absolute top-8 left-8 text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Definition</span>
                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {activeSet.cards[currentCardIndex].back}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8 mt-12">
                <button 
                  onClick={prevCard}
                  className="p-5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-white/50 dark:border-white/10 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-8 py-4 bg-slate-800/90 dark:bg-slate-200/90 backdrop-blur-md text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl hover:bg-slate-700 dark:hover:bg-white hover:scale-105 transition-all transform active:scale-95 border border-white/10"
                >
                  {isFlipped ? 'Show Term' : 'Show Answer'}
                </button>

                <button 
                  onClick={nextCard}
                  className="p-5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-white/50 dark:border-white/10 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <div className="w-24 h-24 bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/20 dark:border-white/10">
                   <svg className="w-10 h-10 text-slate-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                </div>
                <p className="text-lg font-semibold">No flashcard deck selected.</p>
                <p className="text-sm opacity-80 mt-1">Select or create a deck to distill knowledge.</p>
              </div>
          )}
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardView;