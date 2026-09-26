'use client';

import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface TimelineEvent {
  time: string;
  hazard: string;
  status: 'WARNING' | 'CRITICAL' | 'STABLE';
  details: string;
}

export function RiskTimeline() {
  const events: TimelineEvent[] = [
    { time: 'T-10m', hazard: 'Slope Shear Inclinometer', status: 'CRITICAL', details: 'Lateral displacement velocity spiked to 4.2mm/hr at Mawlynnong ridge.' },
    { time: 'T-35m', hazard: 'Rain Gauge Threshold', status: 'WARNING', details: 'Cumulative 6h precipitation exceeded 110mm threshold.' },
    { time: 'T-2h', hazard: 'Dauki Fault Geophone', status: 'STABLE', details: 'Acoustic micro-tremors normalized to ambient environmental vibrations.' },
  ];

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center space-x-2 text-slate-200 font-mono font-bold mb-4">
        <Activity className="w-4 h-4 text-sky-400" />
        <span>Recent Geological & Telemetry Timeline</span>
      </div>

      <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((evt, idx) => (
          <div key={idx} className="flex items-start space-x-3 relative">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                evt.status === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500'
                  : evt.status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
              }`}
            >
              <Clock className="w-3 h-3" />
            </span>
            <div className="flex-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200">{evt.hazard}</span>
                <span className="font-mono text-[10px] text-slate-500">{evt.time}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{evt.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
