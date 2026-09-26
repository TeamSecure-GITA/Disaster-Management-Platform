'use client';

import React from 'react';
import { EvacuationLayer } from '../../../components/maps/EvacuationLayer';
import { Navigation, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';

export default function EvacuationPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-sky-400" />
          <span>AUTONOMOUS EVACUATION CORRIDOR ROUTING</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Real-time dynamic corridor status avoiding landslide cutoffs, bridge washouts, and flash flooding
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="font-mono text-sm font-bold text-slate-100">Live Corridors</h2>
          <EvacuationLayer />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-3">
          <span className="text-emerald-400 font-bold uppercase block">Recommended Public Advisory</span>
          <p className="text-slate-300 leading-relaxed">
            All civilian transit from Cherrapunji towards Shillong must divert via Ridge Bypass Alpha. NH-10 Km 42 remains physically blocked by 4,500 cubic meters of limestone colluvium.
          </p>
        </div>
      </div>
    </div>
  );
}
