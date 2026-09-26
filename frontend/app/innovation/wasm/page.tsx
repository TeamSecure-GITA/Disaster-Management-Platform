'use client';

import React from 'react';
import { Cpu, Zap, Database } from 'lucide-react';

export default function WasmPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>WEBASSEMBLY (WASM) DISTRIBUTED ZERO-GRID PREDICTOR</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          High-performance C++ / Rust compiled WebAssembly executing finite element stability simulations directly in-browser
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-slate-200 font-bold">WASM Worker Engine Status</span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            JIT COMPILED • 4 WORKER THREADS READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">SIMD Vectorization</span>
            <span className="text-lg font-bold text-emerald-400">128-bit Wasm-SIMD</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">Offline Cache Footprint</span>
            <span className="text-lg font-bold text-sky-400">3.8 MB (IndexedDB)</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">Inference Speed</span>
            <span className="text-lg font-bold text-cyan-400">4.2 ms / 10k nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
