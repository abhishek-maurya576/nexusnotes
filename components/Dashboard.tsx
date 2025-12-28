import React from 'react';
import { Notebook } from '../types';

interface DashboardProps {
  notebooks: Notebook[];
  onCreateNotebook: () => void;
  onSelectNotebook: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ notebooks, onCreateNotebook, onSelectNotebook, onDeleteNotebook, isDarkMode, onToggleTheme }) => {
  return (
    <div className="h-full w-full overflow-y-auto p-8 relative">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-12 h-12 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <svg className="w-7 h-7 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight drop-shadow-sm">NexusNotes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Liquid Intelligence Workspace</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleTheme}
            className="p-3 rounded-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all backdrop-blur-md shadow-sm"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={onCreateNotebook}
            className="relative overflow-hidden group px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-indigo-600 dark:to-blue-600 opacity-90 backdrop-blur-md"></div>
            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
            <span className="relative flex items-center gap-2 text-white font-semibold text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Notebook
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Create New Card (Glass Style) */}
          <div 
            onClick={onCreateNotebook}
            className="group animate-fade-in aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-300/50 dark:border-slate-600/30 hover:border-blue-400/50 dark:hover:border-blue-400/50 bg-white/10 dark:bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/5"
          >
            <div className="w-14 h-14 rounded-full bg-white/30 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="mt-4 text-slate-600 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">Create Notebook</span>
          </div>

          {notebooks.map((notebook, index) => (
            <div 
              key={notebook.id}
              onClick={() => onSelectNotebook(notebook.id)}
              className="relative group aspect-[4/3] rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Glass Card Background */}
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl shadow-lg group-hover:shadow-2xl group-hover:bg-white/50 dark:group-hover:bg-slate-800/60 transition-all duration-300"></div>
              
              {/* Liquid Sheen */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ring-1 ring-white/50 dark:ring-white/20 ${
                     notebook.sources.length > 0 
                      ? 'bg-gradient-to-br from-indigo-500 to-blue-500' 
                      : 'bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700'
                  }`}>
                    <span className="font-bold text-xl drop-shadow-md">{notebook.title.charAt(0)}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteNotebook(notebook.id); }}
                    className="p-2 rounded-full bg-white/20 hover:bg-red-500/20 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight">{notebook.title}</h3>
              </div>
              
              <div className="relative z-10 flex items-center gap-3">
                 <div className="px-3 py-1 rounded-full bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/10 backdrop-blur-sm text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${notebook.sources.length ? 'bg-green-400' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    {notebook.sources.length} sources
                 </div>
                 <div className="px-3 py-1 rounded-full bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/10 backdrop-blur-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {notebook.notes.length} notes
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;