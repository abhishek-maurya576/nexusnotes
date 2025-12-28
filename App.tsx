import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import InfographicView from './components/InfographicView';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import DraftingView from './components/DraftingView';
import { Notebook } from './types';
import { backendRouteSnippet } from './services/backendStub';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'workspace' | 'infographic' | 'flashcards' | 'quiz' | 'drafting'>('dashboard');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_notes_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Apply theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('nexus_notes_theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('nexus_notes_theme', 'light');
    }
  }, [isDarkMode]);

  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_notes_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load notebooks from storage", e);
        }
      }
    }
    return [];
  });
  
  const [currentNotebookId, setCurrentNotebookId] = useState<string | null>(null);

  useEffect(() => {
    console.group("NexusNotes Architecture Info");
    console.log("Mock RAG Backend Route implementation:");
    console.log(backendRouteSnippet);
    console.groupEnd();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_notes_data', JSON.stringify(notebooks));
  }, [notebooks]);

  const handleCreateNotebook = () => {
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      title: 'Untitled Notebook',
      sources: [],
      notes: [],
      infographics: [],
      flashcardSets: [],
      quizzes: [],
      quizResults: [],
      drafts: [],
      createdAt: Date.now(),
    };
    setNotebooks(prev => [newNotebook, ...prev]);
    setCurrentNotebookId(newNotebook.id);
    setView('workspace');
  };

  const handleSelectNotebook = (id: string) => {
    setCurrentNotebookId(id);
    setView('workspace');
  };

  const handleUpdateNotebook = (updated: Notebook) => {
    setNotebooks(prev => prev.map(nb => nb.id === updated.id ? updated : nb));
  };

  const handleDeleteNotebook = (id: string) => {
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    if (currentNotebookId === id) {
      setView('dashboard');
      setCurrentNotebookId(null);
    }
  };

  const currentNotebook = notebooks.find(nb => nb.id === currentNotebookId);

  return (
    <div className="h-screen w-full font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      {view === 'dashboard' && (
        <Dashboard 
          notebooks={notebooks}
          onCreateNotebook={handleCreateNotebook}
          onSelectNotebook={handleSelectNotebook}
          onDeleteNotebook={handleDeleteNotebook}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}

      {view === 'workspace' && currentNotebook && (
        <Workspace 
          notebook={currentNotebook}
          onUpdateNotebook={handleUpdateNotebook}
          onBack={() => setView('dashboard')}
          onNavigateToInfographic={() => setView('infographic')}
          onNavigateToFlashcards={() => setView('flashcards')}
          onNavigateToQuiz={() => setView('quiz')}
          onNavigateToDrafting={() => setView('drafting')}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}

      {view === 'infographic' && currentNotebook && (
        <InfographicView 
          notebook={currentNotebook}
          onUpdateNotebook={handleUpdateNotebook}
          onBack={() => setView('workspace')}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}

      {view === 'flashcards' && currentNotebook && (
        <FlashcardView 
          notebook={currentNotebook}
          onUpdateNotebook={handleUpdateNotebook}
          onBack={() => setView('workspace')}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}

      {view === 'quiz' && currentNotebook && (
        <QuizView
          notebook={currentNotebook}
          onUpdateNotebook={handleUpdateNotebook}
          onBack={() => setView('workspace')}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}

      {view === 'drafting' && currentNotebook && (
        <DraftingView
          notebook={currentNotebook}
          onUpdateNotebook={handleUpdateNotebook}
          onBack={() => setView('workspace')}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;