'use client';

import React from 'react';
import { ScenarioSelector } from '../../../components/simulation/ScenarioSelector';
import { useSimulation } from '../../../hooks/useSimulation';
import { Flame } from 'lucide-react';

export default function ScenariosPage() {
  const { scenarios, setParameters } = useSimulation();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-indigo-400" />
          <span>STANDARDIZED DISASTER SCENARIOS CATALOG</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Benchmark simulations modeled after historic NER cloudbursts and Himalayan tectonic events
        </p>
      </div>

      <ScenarioSelector
        scenarios={scenarios}
        onSelect={(s) => setParameters(s.defaultParameters)}
      />
    </div>
  );
}
