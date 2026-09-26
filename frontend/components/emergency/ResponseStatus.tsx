'use client';

import React from 'react';
import { CheckCircle2, Shield, Radio, Navigation } from 'lucide-react';
import { IncidentStatus } from '../../types/incident';

interface ResponseStatusProps {
  status: IncidentStatus;
  unitsCount?: number;
  droneActive?: boolean;
}

export function ResponseStatus({ status, unitsCount = 2, droneActive = true }: ResponseStatusProps) {
  const steps: { key: IncidentStatus; label: string }[] = [
    { key: 'REPORTED', label: 'Reported' },
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'ON_SCENE', label: 'On Scene' },
    { key: 'CONTAINED', label: 'Contained' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-slate-400 uppercase tracking-wider font-semibold">Incident Lifecycle</span>
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="flex items-center gap-1 font-mono text-sky-400">
            <Shield className="w-3.5 h-3.5" /> {unitsCount} Teams
          </span>
          {droneActive && (
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Drone Recon Active
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => {
          const isPassed = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.key} className="flex flex-col items-center text-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-white shadow-glow ring-2 ring-sky-400/50'
                    : isPassed
                    ? 'bg-slate-700 text-sky-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isPassed && !isCurrent ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium truncate w-full ${
                  isCurrent ? 'text-sky-300 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
