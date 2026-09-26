'use client';

import React from 'react';
import { Play, RotateCcw, Loader2, Sparkles } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
}

export function SimulationControls({ isRunning, onRun, onReset }: SimulationControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onRun}
        disabled={isRunning}
        className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Simulating Physics Dynamics...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>Execute Digital Twin Prognosis</span>
          </>
        )}
      </button>

      <button
        onClick={onReset}
        disabled={isRunning}
        title="Reset parameters"
        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
