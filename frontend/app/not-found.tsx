import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sky-400">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold font-mono text-slate-100">404 - Grid Coordinate Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm font-mono">
        The tactical module or sector telemetry coordinate you requested is not currently mapped in the operational grid.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs flex items-center space-x-2 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Primary Dashboard</span>
      </Link>
    </div>
  );
}
