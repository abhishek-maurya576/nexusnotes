import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Source } from '../types';
import { queryNotebook } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  sources: Source[];
  onSendMessage: (msg: ChatMessage) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, sources, onSendMessage, isTyping, setIsTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const [useReasoning, setUseReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    onSendMessage(userMsg);
    setIsTyping(true);

    const responseText = await queryNotebook(messages, sources, userText, useReasoning);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
    };

    onSendMessage(modelMsg);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-3xl blur-md absolute opacity-30"></div>
            <div className="w-20 h-20 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl relative z-10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome to NexusNotes</h3>
              <p className="max-w-md text-slate-600 dark:text-slate-400 mt-2 font-medium">
                Add sources on the left. Ask deep questions. Experience the flow of knowledge.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl px-6 py-5 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-slate-800/90 dark:bg-indigo-600/80 backdrop-blur-md text-white border-slate-700/50 dark:border-indigo-500/50 rounded-br-sm' 
                : 'bg-white/40 dark:bg-slate-800/60 backdrop-blur-md text-slate-800 dark:text-slate-200 border-white/50 dark:border-white/10 rounded-bl-sm'
            }`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-400/20 dark:border-white/10">
                   <div className={`w-2 h-2 rounded-full ${useReasoning ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-bold text-xs uppercase tracking-widest">
                    Gemini {useReasoning ? '3.0 Pro' : '2.5'}
                  </span>
                </div>
              )}
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none break-words leading-relaxed">
                {msg.role === 'model' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="bg-white/40 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-3xl rounded-bl-sm px-6 py-4 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-t border-white/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -top-10 left-0">
             <label className="flex items-center gap-2 cursor-pointer group/toggle">
                <div className={`w-10 h-6 flex items-center bg-white/50 dark:bg-white/10 rounded-full p-1 transition-all border border-white/50 dark:border-white/10 ${useReasoning ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700' : ''}`}>
                    <div className={`bg-white dark:bg-slate-200 w-4 h-4 rounded-full shadow-md transform transition-transform ${useReasoning ? 'translate-x-4 bg-purple-500 dark:bg-purple-400' : 'bg-slate-400'}`}></div>
                </div>
                <input 
                  type="checkbox" 
                  checked={useReasoning}
                  onChange={(e) => setUseReasoning(e.target.checked)}
                  className="hidden"
                />
                <span className={`text-xs font-semibold transition-colors ${useReasoning ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    Thinking Mode (Pro)
                </span>
             </label>
          </div>
          
          <div className="relative flex items-end gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2rem] p-2 shadow-lg hover:shadow-xl hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-5 max-h-32 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
              rows={1}
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className={`p-3 rounded-full mb-1 transition-all duration-300 flex-shrink-0 ${
                inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:scale-105' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;