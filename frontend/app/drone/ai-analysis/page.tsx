'use client';

import React from 'react';
import { Cpu, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DroneAIAnalysisPage() {
  const detections = [
    { target: 'Stranded Civilian Vehicle', confidence: '98.2%', bbox: '[X: 420, Y: 180]', status: 'CONFIRMED' },
    { target: 'Culvert Rupture Overflow', confidence: '94.6%', bbox: '[X: 680, Y: 320]', status: 'CRITICAL_HAZARD' },
    { target: 'Human Body Thermal Signature', confidence: '89.1%', bbox: '[X: 512, Y: 410]', status: 'SURVIVOR_IDENTIFIED' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>YOLOV8 / FLIR EDGE-AI TARGET DETECTIONS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Autonomous bounding box recognition running directly on UAV onboard neural coprocessors
        </p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {detections.map((d, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-200 text-sm">{d.target}</span>
                <span className="text-[10px] text-slate-500 block">Bounding Box: {d.bbox}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-emerald-400 font-bold">{d.confidence} match</span>
              <div className="text-[10px] text-sky-400">{d.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
