'use client';

import React from 'react';
import { Video, Radio, Shield, Crosshair } from 'lucide-react';

export default function DroneLivePage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Video className="w-5 h-5 text-rose-500" />
          <span>LIVE UAV OPTICAL & FLIR THERMAL STREAM</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Low-latency RTSP / WebRTC video downlinked from search & rescue UAV-Recon-01
        </p>
      </div>

      <div className="relative w-full h-[520px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

        {/* HUD Crosshairs Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Crosshair className="w-24 h-24 text-sky-400/40 animate-pulse" />
        </div>

        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>REC • LIVE 4K FLIR THERMAL FEED</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700 text-xs font-mono text-slate-300">
          <span>LAT: 25.5788° N • LNG: 91.8933° E</span>
          <span>TARGET LOCK: NO SURVIVORS TRAPPED IN RUBBLE CUT</span>
          <span className="text-emerald-400">BITRATE: 8.4 Mbps</span>
        </div>
      </div>
    </div>
  );
}
