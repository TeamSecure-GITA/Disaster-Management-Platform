'use client';

import React from 'react';
import { SimulationScenario } from '../../types/simulation';
import { Mountain, Flame, Droplets } from 'lucide-react';
import { formatHazardName } from '../../utils/format';

interface ScenarioSelectorProps {
  scenarios: SimulationScenario[];
  selectedId?: string;
  onSelect: (scenario: SimulationScenario) => void;
}

export function ScenarioSelector({ scenarios, selectedId, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">
        Select Disaster Simulation Catalog
      </span>
      <div className="space-y-2">
        {scenarios.map((scen) => {
          const isSelected = scen.id === selectedId;
          return (
            <div
              key={scen.id}
              onClick={() => onSelect(scen)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-400 shadow-glow'
                  : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-100">{scen.name}</span>
                <span className="text-[10px] font-mono uppercase text-sky-400 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800">
                  {formatHazardName(scen.hazardType)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{scen.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
