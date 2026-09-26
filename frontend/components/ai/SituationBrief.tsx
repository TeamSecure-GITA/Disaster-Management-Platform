'use client';

import React from 'react';
import { SituationBrief as SituationBriefType } from '../../types/ai';
import { ConfidenceBadge } from './ConfidenceBadge';
import { formatDateTime } from '../../utils/dates';
import { ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface SituationBriefProps {
  brief?: SituationBriefType | null;
}

export function SituationBrief({ brief }: SituationBriefProps) {
  if (!brief) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Synthesizing real-time regional disaster intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="font-mono text-xs text-sky-300 font-bold uppercase tracking-wider">
            Autonomous Situation Synthesis
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ConfidenceBadge score={brief.confidence} />
          <span className="text-[11px] font-mono text-slate-500">{formatDateTime(brief.generatedAt)}</span>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-2 leading-snug">{brief.headline}</h3>
      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">{brief.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-rose-400 font-semibold uppercase flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> High Threat Sectors
          </span>
          <ul className="space-y-1 text-slate-300">
            {brief.keyImpactZones.map((zone, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{zone}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-emerald-400 font-semibold uppercase flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Interventions
          </span>
          <ul className="space-y-1 text-slate-300">
            {brief.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
