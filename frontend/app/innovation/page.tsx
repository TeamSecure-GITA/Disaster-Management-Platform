'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Wifi, Cpu, Layers, Radio, ArrowRight } from 'lucide-react';

export default function InnovationPage() {
  const modules = [
    { title: 'Post-Quantum Cryptography (PQC)', href: '/innovation/quantum', desc: 'NIST ML-KEM (Kyber-1024) offline identity and mission ledger', icon: Shield, color: 'text-indigo-400' },
    { title: 'RF-CSI Wi-Fi Human Presence', href: '/innovation/rf-csi', desc: 'Through-debris breathing & vitals triangulation without sensors on victims', icon: Wifi, color: 'text-cyan-400' },
    { title: 'WebAssembly Zero-Grid Supercomputer', href: '/innovation/wasm', desc: 'Full client-side offline Mohr-Coulomb landslide inference engine', icon: Cpu, color: 'text-emerald-400' },
    { title: 'Decentralized P2P & Audio Chirps', href: '/innovation/decentralized', desc: 'Ultrasonic 1.8-19.8 kHz speaker-to-mic acoustic packet relay', icon: Radio, color: 'text-sky-400' },
    { title: 'Web3 Spatial AR-SOS Rescue HUD', href: '/innovation/ar-sos', desc: 'WebXR rescue HUD projecting thermal survivor trails onto debris piles', icon: Layers, color: 'text-rose-400' },
    { title: 'Experimental Deep-Tech Sandbox', href: '/innovation/experimental', desc: 'Thermoelectric thermal-tap & barometric flash-flood micro-pulse', icon: Sparkles, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <span>DEEP-TECH DISASTER INNOVATION SUITE</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          World-first resilient technologies engineered for total grid collapse and extreme remote terrains
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className={`p-2.5 rounded-xl bg-slate-950 w-fit mb-3 ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-sky-400 transition-colors mb-1 font-mono">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono text-sky-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Inspect Architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
