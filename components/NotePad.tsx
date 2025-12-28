import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { generateNote } from '../services/geminiService';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onUpdate: (id: string, content: string) => void;
  onRemove: (id: string) => void;
  onSelect: () => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, isActive, onUpdate, onRemove, onSelect }) => {
  const [content, setContent] = useState(note.content);
  const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  useEffect(() => {
    if (status === 'saved' && note.content !== content) {
      setContent(note.content);
    }
  }, [note.content, status, content]);

  useEffect(() => {
    if (content === note.content) {
      if (status !== 'saved') setStatus('saved');
      return;
    }

    setStatus('unsaved');
    const handler = setTimeout(() => {
      setStatus('saving');
      onUpdate(note.id, content);
    }, 1000);

    return () => clearTimeout(handler);
  }, [content, note.id, onUpdate, note.content]);

  useEffect(() => {
    if (note.content === content) {
      setStatus('saved');
    }
  }, [note.content, content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div 
      className={`relative group bg-yellow-50/90 dark:bg-yellow-900/20 backdrop-blur-sm p-4 rounded-xl shadow-sm border transition-all duration-300 ${isActive ? 'border-yellow-400 ring-2 ring-yellow-200 dark:ring-yellow-800 shadow-md scale-[1.02]' : 'border-yellow-200/50 dark:border-yellow-700/30 hover:border-yellow-300 dark:hover:border-yellow-600'}`}
      onClick={onSelect}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-yellow-200/50 dark:bg-yellow-700/50 rounded-b-md"></div>
      <textarea
        className="w-full h-32 text-sm text-slate-800 dark:text-yellow-50 bg-transparent border-none resize-none focus:ring-0 p-0 font-medium leading-relaxed placeholder-yellow-800/30 dark:placeholder-yellow-200/30"
        value={content}
        placeholder="Type a note..."
        onChange={handleChange}
      />
      <div className="flex justify-between items-center mt-3 border-t border-yellow-200 dark:border-yellow-800/50 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-yellow-700/60 dark:text-yellow-400/60 font-mono">
            {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${
            status === 'saved' ? 'text-yellow-700/40 dark:text-yellow-400/40' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {status === 'saved' ? 'Saved' : (status === 'saving' ? 'Saving...' : 'Unsaved')}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(note.id); }}
          className="p-1 rounded bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface NotePadProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  onUpdateNote: (id: string, newContent: string) => void;
  onRemoveNote: (id: string) => void;
  currentSourceContent: string;
}

const NotePad: React.FC<NotePadProps> = ({ notes, onAddNote, onUpdateNote, onRemoveNote, currentSourceContent }) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      createdAt: Date.now(),
    };
    onAddNote(newNote);
    setActiveNoteId(newNote.id);
  };

  const handleGenerateSummary = async () => {
    if (!currentSourceContent) return;
    
    setIsGenerating(true);
    const summary = await generateNote(currentSourceContent, "Create a concise summary of the key themes in these documents.");
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: `## Summary\n\n${summary}`,
      createdAt: Date.now(),
    };
    onAddNote(newNote);
    setActiveNoteId(newNote.id);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-black/20">
      <div className="p-4 border-b border-white/30 dark:border-white/10 flex justify-between items-center bg-white/20 dark:bg-black/20">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Notes</h2>
        <button onClick={createNewNote} className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div className="p-3 border-b border-white/30 dark:border-white/10">
        <button 
          onClick={handleGenerateSummary}
          disabled={isGenerating || !currentSourceContent}
          className="flex items-center justify-center space-x-2 w-full px-3 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 rounded-xl border border-blue-100 dark:border-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isGenerating ? (
             <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"/>Generating...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Auto-Summarize</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-10 font-medium italic">No notes created.</p>
        )}

        {notes.map(note => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={activeNoteId === note.id}
            onUpdate={onUpdateNote}
            onRemove={onRemoveNote}
            onSelect={() => setActiveNoteId(note.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotePad;