'use client';

import React from 'react';
import { Compass, CheckCircle2, Clock } from 'lucide-react';

export default function DroneMissionsPage() {
  const missions = [
    { title: 'Sector 4 Ridge High-Resolution SAR Sweep', status: 'IN_PROGRESS', progress: 68, estTime: '18 mins' },
    { title: 'NH-10 Landslide Rubble Volume Estimation', status: 'COMPLETED', progress: 100, estTime: 'Done' },
    { title: 'Majuli Island Evacuation Perimeter Night Patrol', status: 'SCHEDULED', progress: 0, estTime: 'Starts at 21:00' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <span>AUTONOMOUS FLIGHT MISSIONS & WAYPOINTS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Pre-calculated flight corridors avoiding bad weather cells and ridge downdrafts
        </p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {missions.map((m, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">{m.title}</span>
              <span className="text-slate-400 text-[10px]">{m.status} ({m.estTime})</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${m.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
