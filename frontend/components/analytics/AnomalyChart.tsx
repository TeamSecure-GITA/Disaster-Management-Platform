'use client';

import React from 'react';
import { AlertOctagon, Activity } from 'lucide-react';

export function AnomalyChart() {
  const anomalies = [
    { title: 'Inclinometer Shear Jerk', sensor: 'Mawlynnong Node 08', deviation: '+37.7%', time: '14 mins ago', severity: 'HIGH' },
    { title: 'Acoustic Emission Burst', sensor: 'Dauki Geophone 03', deviation: '+52.1%', time: '32 mins ago', severity: 'MODERATE' },
    { title: 'Pore Pressure Spike', sensor: 'Cherrapunji Piezometer', deviation: '+22.4%', time: '1 hour ago', severity: 'LOW' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 font-mono font-bold text-slate-200">
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Real-Time Sensor Telemetry Anomalies</span>
        </div>
        <span className="text-[10px] font-mono text-rose-400 animate-pulse">3 Detected</span>
      </div>

      <div className="space-y-2.5">
        {anomalies.map((anom, i) => (
          <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertOctagon className="w-4 h-4" />
              </span>
              <div>
                <div className="font-semibold text-slate-200 text-xs">{anom.title}</div>
                <div className="text-[10px] text-slate-500 font-mono">{anom.sensor}</div>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs font-bold text-rose-400">{anom.deviation}</span>
              <div className="text-[9px] text-slate-500">{anom.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
