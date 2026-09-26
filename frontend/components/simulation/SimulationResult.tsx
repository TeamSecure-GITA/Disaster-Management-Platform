'use client';

import React from 'react';
import { SimulationRunResult } from '../../types/simulation';
import { ShieldAlert, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { formatNumber } from '../../utils/numbers';

interface SimulationResultProps {
  result?: SimulationRunResult | null;
}

export function SimulationResult({ result }: SimulationResultProps) {
  if (!result) return null;

  const lastStep = result.steps[result.steps.length - 1];

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-sky-500/30 text-xs shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-widest block">
            Run Complete ({result.totalRunTimeMs}ms)
          </span>
          <h3 className="font-bold text-sm text-slate-100">{result.scenarioName}</h3>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
          PEAK RISK: {Math.round(result.summary.peakCasualtyRisk * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Total Displaced</span>
          <span className="text-base font-bold text-amber-400">
            {formatNumber(lastStep ? lastStep.projectedDisplacedCount : 0)}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Area Inundated</span>
          <span className="text-base font-bold text-sky-400">
            {lastStep ? lastStep.affectedAreaSqKm : 0} sq km
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Est. Damage</span>
          <span className="text-base font-bold text-rose-400">
            ${formatNumber(lastStep ? Math.round(lastStep.estimatedDamageUsd / 1000) : 0)}k
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
          Key Evacuation Recommendations
        </span>
        <div className="space-y-1 text-slate-300">
          {result.summary.safestEvacuationCorridors.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
