'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-glow-danger">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold font-mono text-slate-100">Telemetry Disruption Detected</h2>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          {error?.message || 'An unexpected failure occurred while polling real-time geotechnical sensor streams.'}
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-establish Connection</span>
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Command Center</span>
        </Link>
      </div>
    </div>
  );
}
