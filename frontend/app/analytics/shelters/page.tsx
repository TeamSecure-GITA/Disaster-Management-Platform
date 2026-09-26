'use client';

import React from 'react';
import { Home, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { incidentStore } from '../../../stores/incidentStore';

export default function AnalyticsSheltersPage() {
  const { shelters } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-400" />
          <span>RELIEF SHELTER CAPACITIES & RESOURCE TELEMETRY</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Occupancy ratios, medical supply status, and water reserves across regional shelters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => {
          const occPct = Math.round((s.occupied / s.capacity) * 100);
          return (
            <div key={s.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">{s.name}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {occPct}% OCCUPIED
                </span>
              </div>
              <p className="text-slate-400">{s.address} • Contact: {s.contactPhone}</p>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${occPct}%` }} />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                {s.amenities.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
