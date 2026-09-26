'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Video, Cpu, ShieldAlert, Battery, Compass, ArrowRight } from 'lucide-react';

export default function DronePage() {
  const drones = [
    { id: 'UAV-Recon-01', status: 'AIRBORNE', battery: 78, alt: '420m', mission: 'Mawlynnong Slope Sweep', speed: '48 km/h' },
    { id: 'UAV-Thermal-02', status: 'DISPATCHED', battery: 94, alt: '650m', mission: 'NH-10 Rubble Inspection', speed: '62 km/h' },
    { id: 'UAV-Payload-03', status: 'READY_ON_PAD', battery: 100, alt: '0m', mission: 'Medical Drop Staging', speed: '0 km/h' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-400" />
            <span>AUTONOMOUS DRONE SWARM COMMAND</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Zero-Human Delay UAV Reconnaissance, FLIR Thermal Survivor Detection & Edge-AI Analytics
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link href="/drone/missions" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Missions
          </Link>
          <Link href="/drone/live" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Live Feed
          </Link>
          <Link href="/drone/ai-analysis" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            AI Video Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drones.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">{d.id}</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  d.status === 'AIRBORNE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                {d.status}
              </span>
            </div>

            <p className="text-slate-400">Mission: <strong className="text-slate-200">{d.mission}</strong></p>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-center bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-500 block">Battery</span>
                <span className="text-emerald-400 font-bold">{d.battery}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Altitude</span>
                <span className="text-sky-400 font-bold">{d.alt}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Speed</span>
                <span className="text-slate-200 font-bold">{d.speed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
