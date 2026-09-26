'use client';

import React from 'react';
import { Eye, Layers, Compass, Crosshair } from 'lucide-react';

export default function ARSOSPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Eye className="w-5 h-5 text-rose-500" />
          <span>WEB3 SPATIAL COMPUTING & AR "RESCUE HUD"</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          First-responder optical heads-up display projecting survivor locations, gas leaks, and safe egress paths onto physical debris
        </p>
      </div>

      <div className="relative w-full h-[520px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

        {/* Spatial Reticle HUD */}
        <div className="text-center font-mono space-y-3 z-10">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-rose-500 flex items-center justify-center mx-auto animate-spin">
            <Crosshair className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-base font-bold text-slate-100">WebXR Optical Pose Tracking Engaged</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Align camera with disaster theater. Spatial anchors bind survivor RF-CSI coordinates directly in your field of view.
          </p>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700 text-xs font-mono text-slate-300">
          <span>SPATIAL ANCHORS: 14 BOUND</span>
          <span>THERMAL GRADIENT: +2.4°C ANOMALY</span>
          <span className="text-emerald-400">DEPTH SENSOR: 60 FPS LIDAR</span>
        </div>
      </div>
    </div>
  );
}
