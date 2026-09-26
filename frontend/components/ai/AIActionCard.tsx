'use client';

import React, { useState } from 'react';
import { AIAction } from '../../types/ai';
import { Play, Check, ShieldAlert, Navigation } from 'lucide-react';

interface AIActionCardProps {
  action: AIAction;
  onExecute?: (action: AIAction) => void;
}

export function AIActionCard({ action, onExecute }: AIActionCardProps) {
  const [executed, setExecuted] = useState(false);

  const handleRun = () => {
    setExecuted(true);
    if (onExecute) onExecute(action);
  };

  return (
    <div className="p-3 rounded-lg bg-slate-900/80 border border-sky-500/20 hover:border-sky-500/50 transition-all text-xs">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5 text-sky-400 font-semibold uppercase tracking-wider font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{action.label}</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
          {action.severity}
        </span>
      </div>

      <p className="text-slate-300 text-xs mb-2.5">{action.description}</p>

      <button
        onClick={handleRun}
        disabled={executed}
        className={`w-full py-1.5 px-3 rounded font-mono text-xs flex items-center justify-center space-x-1.5 transition-colors ${
          executed
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
            : 'bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm'
        }`}
      >
        {executed ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>DISPATCH CONFIRMED</span>
          </>
        ) : (
          <>
            <Play className="w-3 h-3 fill-current" />
            <span>Authorize & Execute Action</span>
          </>
        )}
      </button>
    </div>
  );
}
