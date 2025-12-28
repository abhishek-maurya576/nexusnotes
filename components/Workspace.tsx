import React, { useState } from 'react';
import { Notebook, Source, Note, ChatMessage } from '../types';
import SourceSidebar from './SourceSidebar';
import ChatInterface from './ChatInterface';
import NotePad from './NotePad';
import { suggestTitle } from '../services/geminiService';

interface WorkspaceProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onBack: () => void;
  onNavigateToInfographic: () => void;
  onNavigateToFlashcards: () => void;
  onNavigateToQuiz: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ notebook, onUpdateNotebook, onBack, onNavigateToInfographic, onNavigateToFlashcards, onNavigateToQuiz, isDarkMode, onToggleTheme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAddSource = async (source: Source) => {
    const updatedNotebook = {
      ...notebook,
      sources: [...notebook.sources, source]
    };
    
    if (notebook.sources.length === 0 && notebook.title === 'Untitled Notebook') {
       const newTitle = await suggestTitle(source.content);
       updatedNotebook.title = newTitle;
    }

    onUpdateNotebook(updatedNotebook);
  };

  const handleRemoveSource = (id: string) => {
    onUpdateNotebook({
      ...notebook,
      sources: notebook.sources.filter(s => s.id !== id)
    });
  };

  const handleAddNote = (note: Note) => {
    onUpdateNotebook({
      ...notebook,
      notes: [note, ...notebook.notes]
    });
  };

  const handleUpdateNote = (id: string, content: string) => {
    onUpdateNotebook({
      ...notebook,
      notes: notebook.notes.map(n => n.id === id ? { ...n, content } : n)
    });
  };

  const handleRemoveNote = (id: string) => {
    onUpdateNotebook({
      ...notebook,
      notes: notebook.notes.filter(n => n.id !== id)
    });
  };

  const allContent = notebook.sources.map(s => s.content).join('\n\n');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Glass Header */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/40 dark:border-white/10 z-20 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/40 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-full text-slate-600 dark:text-slate-300 transition-all border border-white/20 dark:border-white/5 shadow-sm"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="h-8 w-px bg-white/40 dark:bg-white/10 mx-1"></div>
          
          <input 
            value={notebook.title}
            onChange={(e) => onUpdateNotebook({...notebook, title: e.target.value})}
            className="font-bold text-lg text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 focus:bg-white/20 dark:focus:bg-black/20 rounded-lg px-3 py-1 w-72 transition-all placeholder-slate-500/50"
          />
        </div>
        
        <div className="flex items-center gap-4">
           <button
             onClick={onNavigateToQuiz}
             className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-400 bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-all border border-white/40 dark:border-white/10 shadow-sm"
           >
             <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
               <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             Quiz
           </button>
           <button
             onClick={onNavigateToFlashcards}
             className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-all border border-white/40 dark:border-white/10 shadow-sm"
           >
             <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
               <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
             </div>
             Flashcards
           </button>
           <button
             onClick={onNavigateToInfographic}
             className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-all border border-white/40 dark:border-white/10 shadow-sm"
           >
             <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
             Infographic
           </button>
           
           <div className="h-6 w-px bg-white/40 dark:bg-white/10 mx-1"></div>

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
        </div>
      </header>

      {/* Main Content: Floating Glass Panes */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left: Sources Pane */}
        <div className="w-64 flex flex-col rounded-3xl bg-white/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-colors">
          <SourceSidebar 
            sources={notebook.sources} 
            onAddSource={handleAddSource}
            onRemoveSource={handleRemoveSource}
          />
        </div>

        {/* Center: Chat Pane */}
        <div className="flex-1 flex flex-col rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative transition-colors">
           <ChatInterface 
            messages={messages}
            sources={notebook.sources}
            onSendMessage={(msg) => setMessages(prev => [...prev, msg])}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
          />
        </div>

        {/* Right: Notes Pane */}
        <div className="w-80 flex flex-col rounded-3xl bg-white/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-colors">
          <NotePad 
            notes={notebook.notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onRemoveNote={handleRemoveNote}
            currentSourceContent={allContent}
          />
        </div>
      </div>
    </div>
  );
};

export default Workspace;