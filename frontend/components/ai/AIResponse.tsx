'use client';

import React from 'react';
import { AIMessage } from '../../types/ai';
import { ConfidenceBadge } from './ConfidenceBadge';
import { SourceList } from './SourceList';
import { AIActionCard } from './AIActionCard';
import { Bot, User, Clock, Terminal } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dates';

interface AIResponseProps {
  message: AIMessage;
}

export function AIResponse({ message }: AIResponseProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex space-x-3 p-4 rounded-xl transition-colors ${
        isAssistant ? 'bg-slate-900/80 border border-slate-800' : 'bg-slate-950/40 border border-transparent'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isAssistant ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-300'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-200">
              {isAssistant ? 'Disaster Intelligence Copilot' : 'Tactical Operator'}
            </span>
            {isAssistant && message.confidenceScore !== undefined && (
              <ConfidenceBadge score={message.confidenceScore} />
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {message.citations && message.citations.length > 0 && (
          <SourceList citations={message.citations} />
        )}

        {message.actionsSuggested && message.actionsSuggested.length > 0 && (
          <div className="mt-3 space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider block">
              Suggested Tactical Interventions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.actionsSuggested.map((action) => (
                <AIActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
