'use client';

import React from 'react';
import Link from 'next/link';
import { WhatIfPanel } from '../../components/simulation/WhatIfPanel';
import { SimulationControls } from '../../components/simulation/SimulationControls';
import { SimulationResult } from '../../components/simulation/SimulationResult';
import { ScenarioSelector } from '../../components/simulation/ScenarioSelector';
import { Timeline } from '../../components/simulation/Timeline';
import { useSimulation } from '../../hooks/useSimulation';
import { Flame, Sliders, Layers, Activity } from 'lucide-react';

export default function SimulationPage() {
  const {
    scenarios,
    selectedScenario,
    currentParameters,
    isRunning,
    activeRunResult,
    setParameters,
    runSimulation,
  } = useSimulation();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-indigo-400" />
            <span>DISASTER DIGITAL TWIN & WHAT-IF SIMULATION</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Geomechanical Slope Physics, Hydrodynamic Surge & Multi-Hazard Cascading Impact Predictor
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link href="/simulation/digital-twin" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Digital Twin
          </Link>
          <Link href="/simulation/scenarios" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Scenarios
          </Link>
          <Link href="/simulation/multi-hazard" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Multi-Hazard
          </Link>
          <Link href="/simulation/what-if" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            What-If Modulators
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <ScenarioSelector
            scenarios={scenarios}
            selectedId={selectedScenario?.id || scenarios[0]?.id}
            onSelect={(s) => setParameters(s.defaultParameters)}
          />
          <WhatIfPanel parameters={currentParameters} onChange={setParameters} />
          <SimulationControls
            isRunning={isRunning}
            onRun={() => runSimulation()}
            onReset={() => setParameters({ rainfallMultiplier: 1.0, seismicMagnitude: 0 })}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <SimulationResult result={activeRunResult} />
          {activeRunResult && (
            <Timeline steps={activeRunResult.steps} />
          )}
        </div>
      </div>
    </div>
  );
}
