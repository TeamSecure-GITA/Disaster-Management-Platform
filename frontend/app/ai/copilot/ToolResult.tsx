'use client';

import React from 'react';
import { ToolResult as ToolResultType } from '../../../types/ai';
import { Terminal, CheckCircle2, XCircle } from 'lucide-react';

interface ToolResultProps {
  tool: ToolResultType;
}

export function ToolResult({ tool }: ToolResultProps) {
  return (
    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-200">{tool.toolName}</span>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] font-bold ${
            tool.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {tool.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {tool.status.toUpperCase()}
        </span>
      </div>

      <pre className="text-[11px] text-slate-300 overflow-x-auto p-1.5 bg-slate-900/50 rounded">
        {JSON.stringify(tool.result, null, 2)}
      </pre>
    </div>
  );
}
