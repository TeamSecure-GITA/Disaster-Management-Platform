import React from 'react';
import { Loader2, Radio } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative">
        <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-sky-400 opacity-75"></span>
        <div className="relative w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
      <div className="text-center font-mono space-y-1">
        <p className="text-sm font-bold text-slate-200 uppercase tracking-widest">Synchronizing Mesh Telemetry</p>
        <p className="text-xs text-slate-500">Connecting to edge LoRa gateways and satellite SAR feeds...</p>
      </div>
    </div>
  );
}
