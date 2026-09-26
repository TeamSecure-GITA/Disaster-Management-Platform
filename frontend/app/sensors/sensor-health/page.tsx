'use client';

import React from 'react';
import { useSensors } from '../../../hooks/useSensors';
import { ShieldCheck, Battery, Signal, Cpu } from 'lucide-react';

export default function SensorsHealthPage() {
  const { sensors } = useSensors();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>HARDWARE INTEGRITY & BATTERY HEALTH</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Power decay curves, solar harvesting efficiency, and transceiver signal RSSI
        </p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {sensors.map((s) => (
          <div key={s.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-200">{s.name}</span>
                <span className="text-[10px] text-slate-500 block">Mesh ID: {s.meshNodeId}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>{s.lastReading.batteryPct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Signal className="w-4 h-4 text-sky-400" />
                <span>{s.lastReading.signalStrengthDbm} dBm</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                HEALTH: {s.healthScorePct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
