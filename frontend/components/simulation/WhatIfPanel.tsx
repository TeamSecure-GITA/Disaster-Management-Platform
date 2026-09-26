'use client';

import React from 'react';
import { SimulationParameters } from '../../types/simulation';
import { Sliders, CloudRain, Activity, Droplets } from 'lucide-react';

interface WhatIfPanelProps {
  parameters: SimulationParameters;
  onChange: (params: Partial<SimulationParameters>) => void;
}

export function WhatIfPanel({ parameters, onChange }: WhatIfPanelProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-4">
      <div className="flex items-center space-x-2 font-mono font-bold text-slate-100">
        <Sliders className="w-4 h-4 text-cyan-400" />
        <span>What-If Environmental Parameter Modulators</span>
      </div>

      {/* Rainfall Multiplier Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-slate-200">
          <span className="flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span>Rainfall Intensity Surge</span>
          </span>
          <span className="font-mono text-sky-400 font-bold">{parameters.rainfallMultiplier}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="4.0"
          step="0.1"
          value={parameters.rainfallMultiplier}
          onChange={(e) => onChange({ rainfallMultiplier: parseFloat(e.target.value) })}
          className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0.5x (Light)</span>
          <span>2.0x (Monsoon Peak)</span>
          <span>4.0x (Catastrophic Cloudburst)</span>
        </div>
      </div>

      {/* Co-Seismic Shaking Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-slate-200">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Co-Seismic Magnitude (Richter)</span>
          </span>
          <span className="font-mono text-amber-400 font-bold">{parameters.seismicMagnitude} M</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="8.5"
          step="0.1"
          value={parameters.seismicMagnitude}
          onChange={(e) => onChange({ seismicMagnitude: parseFloat(e.target.value) })}
          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 (Ambient)</span>
          <span>5.0 (Moderate Tremor)</span>
          <span>8.5 (Major Epicenter)</span>
        </div>
      </div>

      {/* Soil Saturation Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-slate-200">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Initial Soil Overburden Saturation</span>
          </span>
          <span className="font-mono text-cyan-400 font-bold">{parameters.soilSaturationInitialPct}%</span>
        </div>
        <input
          type="range"
          min="40"
          max="100"
          step="1"
          value={parameters.soilSaturationInitialPct}
          onChange={(e) => onChange({ soilSaturationInitialPct: parseInt(e.target.value) })}
          className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
