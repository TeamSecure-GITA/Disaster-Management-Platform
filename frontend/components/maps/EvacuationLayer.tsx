'use client';

import React from 'react';
import { Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function EvacuationLayer() {
  const corridors = [
    { name: 'Corridor Alpha (Shillong Ridge Bypass)', status: 'OPEN', etaMinutes: 24, safe: true },
    { name: 'Corridor Beta (NH-10 Km 42 Section)', status: 'BLOCKED', etaMinutes: 0, safe: false },
    { name: 'Corridor Gamma (Umiam Valley Loop)', status: 'CONGESTED', etaMinutes: 48, safe: true },
  ];

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
        Active Evacuation Corridors
      </span>
      {corridors.map((c, i) => (
        <div
          key={i}
          className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
        >
          <div className="flex items-center space-x-2 truncate">
            {c.safe ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            )}
            <span className="text-slate-200 truncate">{c.name}</span>
          </div>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
              c.safe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {c.status}
          </span>
        </div>
      ))}
    </div>
  );
}
