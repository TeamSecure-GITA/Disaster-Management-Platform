'use client';

import React from 'react';
import { ChatWindow } from './ChatWindow';
import { Bot, Sparkles, Shield, Cpu } from 'lucide-react';

export default function CopilotPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Bot className="w-5 h-5 text-sky-400" />
          <span>AUTONOMOUS DISASTER AI COPILOT</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Conversational command agent with live GIS query capabilities and action execution dispatch
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <ChatWindow />
      </div>
    </div>
  );
}
