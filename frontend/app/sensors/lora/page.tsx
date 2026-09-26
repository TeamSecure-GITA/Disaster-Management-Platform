'use client';

import React from 'react';
import { Radio, Wifi, Shield, ArrowRight } from 'lucide-react';
import { useSensors } from '../../../hooks/useSensors';

export default function LoRaPage() {
  const { networkStatus } = useSensors();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <span>LORAWAN P2P AD-HOC MESH TOPOLOGY</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Long-range sub-gigahertz mesh routing packets across high-relief Himalayan terrain without cellular connectivity
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-slate-300 font-bold">Mesh Router Status</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {networkStatus.gatewayStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">Frequency Band</span>
            <span className="text-lg font-bold text-sky-400">865-867 MHz (IN865)</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">Spreading Factor</span>
            <span className="text-lg font-bold text-cyan-400">SF12 / 125 kHz</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">Max Hop Reach</span>
            <span className="text-lg font-bold text-amber-400">7 Mesh Hops</span>
          </div>
        </div>
      </div>
    </div>
  );
}
