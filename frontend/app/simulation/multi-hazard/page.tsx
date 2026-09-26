'use client';

import React from 'react';
import { Flame, Droplets, Mountain, ArrowRight } from 'lucide-react';

export default function MultiHazardPage() {
  const cascades = [
    { primary: 'Torrid Cloudburst (350mm)', triggered: 'Mudslide / Colluvium Failure', consequence: 'River Damming & Upstream Inundation' },
    { primary: 'Earthquake (6.4 Richter)', triggered: 'Rockfall on NH-40', consequence: 'Critical Evacuation Route Cutoff' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <span>MULTI-HAZARD CASCADING FAILURE CHAINS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Compound disaster modeling where secondary hazards trigger catastrophic domino events
        </p>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {cascades.map((c, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-rose-400 font-bold">
              <Mountain className="w-4 h-4" />
              <span>{c.primary}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Droplets className="w-4 h-4" />
              <span>{c.triggered}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <div className="flex items-center space-x-2 text-sky-400 font-bold">
              <span>{c.consequence}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
