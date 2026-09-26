'use client';

import React from 'react';
import { SimulationStepImpact } from '../../types/simulation';
import { Clock, AlertTriangle, Users } from 'lucide-react';

interface TimelineProps {
  steps?: SimulationStepImpact[];
  activeStep?: number;
  onSelectStep?: (index: number) => void;
}

export function Timeline({ steps = [], activeStep = 0, onSelectStep }: TimelineProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono font-bold text-slate-200">Simulation Temporal Progression</span>
        <span className="text-[10px] font-mono text-sky-400">Total Steps: {steps.length}</span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const isSelected = idx === activeStep;
          return (
            <button
              key={idx}
              onClick={() => onSelectStep && onSelectStep(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-400 shadow-glow font-bold'
                  : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <div className="font-mono text-xs">T+{step.timeStepHours}h</div>
              <div className="text-[9px] opacity-80 mt-0.5">{step.projectedDisplacedCount} displaced</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
