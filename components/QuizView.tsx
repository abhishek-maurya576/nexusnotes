import React, { useState, useRef } from 'react';
import { Notebook, Quiz, QuizResult } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizViewProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ notebook, onUpdateNotebook, onBack, isDarkMode, onToggleTheme }) => {
  // State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Taking Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]); // Index of selected answer per question

  const activeQuiz = notebook.quizzes?.find(q => q.id === activeQuizId);
  const activeResult = notebook.quizResults?.find(r => r.id === activeResultId);

  // --- Actions ---

  const handleGenerate = async () => {
    const allText = notebook.sources.map(s => s.content).join('\n\n');
    if (!allText.trim()) {
      setError("Please add sources before generating a quiz.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateQuiz(allText, numQuestions);
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        title: result.title,
        questions: result.questions,
        createdAt: Date.now()
      };

      onUpdateNotebook({
        ...notebook,
        quizzes: [newQuiz, ...(notebook.quizzes || [])]
      });

      // Start the quiz immediately
      setActiveQuizId(newQuiz.id);
      setActiveResultId(null);
      setUserAnswers(new Array(newQuiz.questions.length).fill(-1));
      setCurrentQuestionIdx(0);

    } catch (e) {
      setError("Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    
    // Calculate Score
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) score++;
    });

    // Don't save yet, just show results state locally first, 
    // but the spec says "provide option for users to save".
    // For smoother UX, we'll create the result object but maybe not "persist" until they click save? 
    // Actually, usually results are saved on finish. Let's save it.
    
    const newResult: QuizResult = {
      id: Date.now().toString(),
      quizId: activeQuiz.id,
      score: score,
      totalQuestions: activeQuiz.questions.length,
      date: Date.now(),
      userAnswers: userAnswers
    };

    onUpdateNotebook({
      ...notebook,
      quizResults: [newResult, ...(notebook.quizResults || [])]
    });

    setActiveResultId(newResult.id);
    setActiveQuizId(null); // Exit taking mode
  };

  const handleDeleteQuiz = (id: string) => {
      const updatedQuizzes = (notebook.quizzes || []).filter(q => q.id !== id);
      // Also delete associated results
      const updatedResults = (notebook.quizResults || []).filter(r => r.quizId !== id);
      
      onUpdateNotebook({
          ...notebook,
          quizzes: updatedQuizzes,
          quizResults: updatedResults
      });
      if(activeQuizId === id) setActiveQuizId(null);
  };

  // --- Image Generation (Canvas) ---
  const downloadRef = useRef<HTMLAnchorElement>(null);
  
  const handleDownloadPerformance = () => {
    if (!activeResult) return;
    const quizTitle = notebook.quizzes?.find(q => q.id === activeResult.quizId)?.title || "Quiz Result";
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Colors
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (isDarkMode) {
        bgGradient.addColorStop(0, '#0f172a'); // Slate 900
        bgGradient.addColorStop(1, '#1e1b4b'); // Indigo 950
    } else {
        bgGradient.addColorStop(0, '#f0f9ff'); // Sky 50
        bgGradient.addColorStop(1, '#e0f2fe'); // Sky 100
    }
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Shapes (Liquid effect)
    ctx.fillStyle = isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(700, 50, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.2)';
    ctx.beginPath();
    ctx.arc(100, 350, 200, 0, Math.PI * 2);
    ctx.fill();

    // Text Config
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const accentColor = '#3b82f6'; // Blue 500

    // Branding
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText("NexusNotes", 40, 50);

    // Title
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText("Performance Report", 40, 120);

    // Quiz Name
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
    ctx.fillText(quizTitle, 40, 160);

    // Score Circle
    const centerX = 600;
    const centerY = 200;
    const radius = 80;
    
    // Circle track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = 15;
    ctx.strokeStyle = isDarkMode ? '#334155' : '#cbd5e1';
    ctx.stroke();

    // Progress arc
    const percentage = activeResult.score / activeResult.totalQuestions;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * percentage);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 15;
    ctx.strokeStyle = percentage > 0.7 ? '#22c55e' : (percentage > 0.4 ? '#eab308' : '#ef4444');
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score Text
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = textColor;
    const scoreText = `${Math.round(percentage * 100)}%`;
    const textMetrics = ctx.measureText(scoreText);
    ctx.fillText(scoreText, centerX - textMetrics.width / 2, centerY + 15);

    // Details
    ctx.font = '20px sans-serif';
    ctx.fillStyle = isDarkMode ? '#94a3b8' : '#64748b';
    ctx.fillText(`${activeResult.score} / ${activeResult.totalQuestions} Correct`, 40, 250);
    ctx.fillText(`Date: ${new Date(activeResult.date).toLocaleDateString()}`, 40, 280);

    // Export
    const dataUrl = canvas.toDataURL('image/png');
    if (downloadRef.current) {
        downloadRef.current.href = dataUrl;
        downloadRef.current.download = `NexusNotes-Result-${activeResult.id}.png`;
        downloadRef.current.click();
    }
  };


  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <a ref={downloadRef} className="hidden" />
      
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
          <span className="font-bold text-slate-800 dark:text-white text-lg">Quiz Studio</span>
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
        
        {/* Left Sidebar: History & Generation Control */}
        <div className="w-full md:w-80 bg-white/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl p-6 flex flex-col shrink-0 shadow-xl transition-colors">
            
            {/* Generator Panel */}
            <div className="mb-8 p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Generate New</h3>
                
                <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Questions: {numQuestions}
                    </label>
                    <input 
                        type="range" 
                        min="3" 
                        max="20" 
                        value={numQuestions} 
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
                        isGenerating 
                        ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:scale-[1.02]'
                    }`}
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded-full animate-bounce"/>Generating...</span>
                    ) : (
                        "Generate Quiz"
                    )}
                </button>
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>

            {/* History List */}
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">History</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {(notebook.quizzes || []).map(quiz => {
                    const result = notebook.quizResults?.find(r => r.quizId === quiz.id);
                    const isSelected = activeQuizId === quiz.id || (activeResultId && activeResult?.quizId === quiz.id);
                    
                    return (
                        <div 
                            key={quiz.id}
                            onClick={() => {
                                if (result) {
                                    setActiveResultId(result.id);
                                    setActiveQuizId(null);
                                } else {
                                    setActiveQuizId(quiz.id);
                                    setActiveResultId(null);
                                    // Reset user answers if retaking/continuing (simple logic for now resets)
                                    if(activeQuizId !== quiz.id) {
                                         setUserAnswers(new Array(quiz.questions.length).fill(-1));
                                         setCurrentQuestionIdx(0);
                                    }
                                }
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                                isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-400 dark:border-blue-700 ring-1 ring-blue-200 dark:ring-blue-800'
                                : 'bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                            }`}
                        >
                            <div className="overflow-hidden">
                                <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{quiz.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400">{quiz.questions.length} Qs</span>
                                    {result && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                            (result.score/result.totalQuestions) > 0.7 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                        }`}>
                                            {Math.round((result.score / result.totalQuestions) * 100)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                                className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
                {(!notebook.quizzes || notebook.quizzes.length === 0) && (
                     <p className="text-sm text-slate-400 italic">No quizzes yet.</p>
                )}
            </div>
        </div>

        {/* Center: Quiz Interface or Results */}
        <div className="flex-1 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col relative transition-colors">
            
            {/* --- IDLE STATE --- */}
            {!activeQuizId && !activeResultId && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <div className="w-24 h-24 bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/20 dark:border-white/10">
                        <svg className="w-10 h-10 text-slate-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold">Select or Generate a Quiz</p>
                    <p className="text-sm opacity-80 mt-1">Test your knowledge against your notes.</p>
                </div>
            )}

            {/* --- TAKING QUIZ STATE --- */}
            {activeQuizId && activeQuiz && !activeResultId && (
                <div className="flex flex-col h-full max-w-3xl mx-auto w-full p-8">
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                            Question {currentQuestionIdx + 1} / {activeQuiz.questions.length}
                        </span>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-snug">
                            {activeQuiz.questions[currentQuestionIdx].question}
                        </h2>

                        <div className="space-y-3">
                            {activeQuiz.questions[currentQuestionIdx].options.map((option, idx) => {
                                const isSelected = userAnswers[currentQuestionIdx] === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectAnswer(idx)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.01]' 
                                            : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800/80'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                isSelected ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                            </div>
                                            <span className="text-lg font-medium">{option}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIdx === 0}
                            className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-white/40 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        
                        {currentQuestionIdx === activeQuiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={userAnswers.includes(-1)}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Finish Quiz
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.min(activeQuiz.questions.length - 1, prev + 1))}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- RESULTS STATE --- */}
            {activeResultId && activeResult && (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Result Header */}
                    <div className="bg-white/40 dark:bg-slate-900/40 p-6 border-b border-white/40 dark:border-white/10 flex items-center justify-between shrink-0">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Performance Report</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                You scored {activeResult.score} out of {activeResult.totalQuestions}
                            </p>
                         </div>
                         <button 
                             onClick={handleDownloadPerformance}
                             className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Save Image
                         </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Score Card */}
                        <div className="flex justify-center mb-8">
                             <div className="relative w-40 h-40 flex items-center justify-center">
                                 <svg className="w-full h-full transform -rotate-90">
                                     <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                                     <circle 
                                        cx="80" 
                                        cy="80" 
                                        r="70" 
                                        stroke="currentColor" 
                                        strokeWidth="12" 
                                        fill="transparent" 
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * (activeResult.score / activeResult.totalQuestions))}
                                        className={`${(activeResult.score / activeResult.totalQuestions) > 0.7 ? 'text-green-500' : 'text-yellow-500'}`} 
                                    />
                                 </svg>
                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                                     <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{Math.round((activeResult.score / activeResult.totalQuestions) * 100)}%</span>
                                     <span className="text-xs font-semibold text-slate-400 uppercase">Score</span>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Question Review */}
                        {notebook.quizzes?.find(q => q.id === activeResult.quizId)?.questions.map((q, idx) => {
                            const userAnswer = activeResult.userAnswers[idx];
                            const isCorrect = userAnswer === q.correctAnswerIndex;
                            
                            return (
                                <div key={q.id} className="bg-white/50 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/50 dark:border-white/5">
                                    <div className="flex gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {isCorrect ? '✓' : '✕'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-3">{q.question}</h3>
                                            
                                            <div className="space-y-2 mb-4">
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className={`p-3 rounded-lg text-sm flex justify-between ${
                                                        optIdx === q.correctAnswerIndex 
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                                                        : optIdx === userAnswer && !isCorrect
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                                                            : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                        <span>{opt}</span>
                                                        {optIdx === q.correctAnswerIndex && <span className="font-bold">Correct Answer</span>}
                                                        {optIdx === userAnswer && !isCorrect && <span className="font-bold">Your Answer</span>}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-blue-100 dark:border-blue-900/50">
                                                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Explanation:</span>
                                                {q.explanation}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;