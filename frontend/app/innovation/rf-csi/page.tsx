'use client';

import React from 'react';
import { Wifi, Eye, Activity, Heart } from 'lucide-react';

export default function RFCsiPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-cyan-400" />
          <span>RF-CSI PASSIVE WI-FI BENDING & HUMAN PRESENCE DETECTION</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Detects breathing rhythms and trapped victim movement through 2 meters of concrete and soil without victim devices
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <span className="text-slate-400 font-bold block">Respiratory Waveform</span>
          <span className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 animate-pulse" /> 16 bpm
          </span>
          <p className="text-[10px] text-slate-500">Regular micro-Doppler chest movement detected</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <span className="text-slate-400 font-bold block">Debris Penetration Depth</span>
          <span className="text-2xl font-bold text-emerald-400">1.85 m</span>
          <p className="text-[10px] text-slate-500">Limestone & wet clay soil attenuation compensated</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <span className="text-slate-400 font-bold block">Detection Confidence</span>
          <span className="text-2xl font-bold text-sky-400">92.4%</span>
          <p className="text-[10px] text-slate-500">Sub-carrier phase variance signature match</p>
        </div>
      </div>
    </div>
  );
}
