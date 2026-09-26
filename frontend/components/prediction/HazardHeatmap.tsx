'use client';

import React from 'react';
import { Layers, Flame, Droplets, Mountain } from 'lucide-react';

export function HazardHeatmap() {
  const zones = [
    { name: 'East Khasi Hills (Cherrapunji)', risk: 88, status: 'CRITICAL', type: 'Landslide / Debris Flow' },
    { name: 'Ri-Bhoi (NH-40 Cut Sections)', risk: 74, status: 'HIGH', type: 'Rockfall / Soil Slip' },
    { name: 'Lower Brahmaputra (Majuli Embankments)', risk: 81, status: 'CRITICAL', type: 'Riverine Flash Flood' },
    { name: 'Sikkim Teesta Basin', risk: 62, status: 'MODERATE', type: 'Glacial Lake Surge' },
  ];

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-200">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Regional Multi-Hazard Heatmap Index</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Live Geo-Mesh</span>
      </div>

      <div className="space-y-2">
        {zones.map((z, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200 text-xs">{z.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">{z.type}</div>
            </div>
            <div className="text-right">
              <span
                className={`font-mono text-xs font-bold ${
                  z.risk >= 80 ? 'text-rose-400' : z.risk >= 70 ? 'text-orange-400' : 'text-amber-400'
                }`}
              >
                {z.risk} / 100
              </span>
              <div className="text-[9px] font-mono uppercase text-slate-500">{z.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
