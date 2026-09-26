'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../../../hooks/useAIChat';
import { Message } from './Message';
import { SuggestedPrompts } from './SuggestedPrompts';
import { Send, Loader2, Bot, Trash2 } from 'lucide-react';

export function ChatWindow() {
  const { messages, isLoading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-950/80 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Incident Commander Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Gemini 1.5 Pro • Real-time Multi-Agent Tools</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-sky-400 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Consulting spatial geotechnical layers and agent tools...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <SuggestedPrompts onSelect={(p) => sendMessage(p)} />

      <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Issue tactical query or emergency instruction..."
          className="flex-1 bg-slate-950 text-slate-100 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
