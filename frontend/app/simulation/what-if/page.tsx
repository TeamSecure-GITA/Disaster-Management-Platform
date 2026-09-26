'use client';

import React from 'react';
import { WhatIfPanel } from '../../../components/simulation/WhatIfPanel';
import { SimulationControls } from '../../../components/simulation/SimulationControls';
import { SimulationResult } from '../../../components/simulation/SimulationResult';
import { useSimulation } from '../../../hooks/useSimulation';
import { Sliders } from 'lucide-react';

export default function WhatIfPage() {
  const { currentParameters, isRunning, activeRunResult, setParameters, runSimulation } = useSimulation();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>WHAT-IF PARAMETER SENSITIVITY TESTING</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Tweak environmental stress factors to observe the breaking threshold of civil infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <WhatIfPanel parameters={currentParameters} onChange={setParameters} />
          <SimulationControls
            isRunning={isRunning}
            onRun={() => runSimulation()}
            onReset={() => setParameters({ rainfallMultiplier: 1.0, seismicMagnitude: 0 })}
          />
        </div>

        <div>
          <SimulationResult result={activeRunResult} />
        </div>
      </div>
    </div>
  );
}
