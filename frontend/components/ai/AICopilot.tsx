'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../../hooks/useAIChat';
import { AIResponse } from './AIResponse';
import { Send, Sparkles, Trash2, Loader2, Bot, ArrowDown } from 'lucide-react';

export function AICopilot() {
  const { messages, isLoading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const suggestedPrompts = [
    'Assess failure probability on NH-10 Shillong Bypass corridor',
    'What is the current pore-water pressure anomaly at Mawlynnong?',
    'List all NDRF squads ready for flood rescue in Majuli',
    'Run Mohr-Coulomb landslide simulation with 300mm cloudburst',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Autonomous AI Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Gemini 1.5 Pro + Geotechnical Multi-Agent</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Reset conversation"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <AIResponse key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-sky-400 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Cross-referencing real-time SAR radar & geotechnical sensor mesh...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/60 flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(p)}
              className="text-[11px] text-slate-300 hover:text-white bg-slate-800/70 hover:bg-sky-900/40 border border-slate-700/60 hover:border-sky-500/40 rounded-full px-3 py-1 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask commander copilot (e.g. 'Deploy reconnaissance drone to Mawlynnong')..."
          className="flex-1 bg-slate-950/80 text-slate-100 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
