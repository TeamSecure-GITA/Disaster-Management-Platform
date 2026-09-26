'use client';

import React from 'react';
import { Layers, Activity, Eye, Shield } from 'lucide-react';

export default function DigitalTwinPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>3D GEOTECHNICAL DIGITAL TWIN ELEVATION MODEL</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          DEM / DSM topography with high-precision finite element mesh of East Khasi Hills ridges
        </p>
      </div>

      <div className="relative w-full h-[520px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="text-center font-mono space-y-2 z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-glow">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">WebGL 3D Terrain Render Stream Active</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Mesh resolution: 0.5m LiDAR point clouds with real-time subsurface moisture tensor overlay.
          </p>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700 text-xs font-mono text-slate-300">
          <span>VERTICES: 1,420,000</span>
          <span>SUB-SURFACE HYDROLOGY: CONVERGED</span>
          <span className="text-indigo-400">FPS: 60 (WebGL2)</span>
        </div>
      </div>
    </div>
  );
}
