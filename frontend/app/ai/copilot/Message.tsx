'use client';

import React from 'react';
import { AIMessage } from '../../../types/ai';
import { Bot, User } from 'lucide-react';
import { formatRelativeTime } from '../../../utils/dates';
import { ToolResult } from './ToolResult';
import { SourceCitation } from './SourceCitation';

interface MessageProps {
  message: AIMessage;
}

export function Message({ message }: MessageProps) {
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
          <span className="text-xs font-semibold text-slate-200">
            {isAssistant ? 'Command Copilot (Gemini)' : 'Tactical Operator'}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {message.tools && message.tools.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.tools.map((t, idx) => (
              <ToolResult key={idx} tool={t} />
            ))}
          </div>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.citations.map((c) => (
              <SourceCitation key={c.id} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
