'use client';

import React from 'react';
import { Sparkles, Zap, Compass, Activity } from 'lucide-react';

export default function ExperimentalPage() {
  const experiments = [
    { title: 'Thermoelectric "Thermal-Tap" Micro-Harvester', desc: 'Converts soil-air differential heat (Seebeck effect) into emergency beacon power', status: 'LAB_PROTOTYPE' },
    { title: 'Barometric Flash-Flood Acoustic Pulse Sensor', desc: 'Detects sudden atmospheric pressure wave collapses prior to cloudburst deluges', status: 'FIELD_VALIDATION' },
    { title: 'Magnetometer Disrupted-Field Trapped Victim Locator', desc: 'Identifies distortion in Earth magnetic field caused by structural steel shifting over humans', status: 'SIMULATED' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>EXPERIMENTAL DEEP-TECH PROTOTYPES</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Breakthrough physics-based life-saving mechanisms in laboratory and field-test validation
        </p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {experiments.map((exp, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-sm">{exp.title}</h3>
              <p className="text-slate-400">{exp.desc}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              {exp.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
