'use client';

import React from 'react';
import { Cpu, Radio, ShieldCheck, Activity, Database, Server } from 'lucide-react';
import { useSensors } from '../../../hooks/useSensors';

export default function SystemHealthPage() {
  const { networkStatus } = useSensors();

  const services = [
    { name: 'FastAPI Geotechnical ML Engine', status: 'HEALTHY', latency: '42ms', uptime: '99.98%' },
    { name: 'LoRaWAN Mesh Gateway Core', status: 'HEALTHY', latency: '12ms', uptime: '100%' },
    { name: 'Gemini 1.5 Pro Copilot Agent', status: 'HEALTHY', latency: '620ms', uptime: '99.85%' },
    { name: 'WebRTC P2P Mesh Signaling Node', status: 'HEALTHY', latency: '8ms', uptime: '99.99%' },
    { name: 'Post-Quantum Identity Ledger (Kyber-1024)', status: 'HEALTHY', latency: '18ms', uptime: '100%' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span>SYSTEM & MESH TELEMETRY HEALTH</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Real-time service uptime, mesh gateway connectivity, and edge node latency
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Active Mesh Nodes</span>
          <span className="text-2xl font-bold text-emerald-400">{networkStatus.onlineNodes} / {networkStatus.totalNodes}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Mesh Health Index</span>
          <span className="text-2xl font-bold text-sky-400">{networkStatus.meshHealthPct}%</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Edge Gateway</span>
          <span className="text-2xl font-bold text-emerald-400">{networkStatus.gatewayStatus}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Zero-Grid Fallback</span>
          <span className="text-2xl font-bold text-cyan-400">STANDBY READY</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
        <span className="font-mono font-bold text-slate-200 block mb-4 uppercase">Core Infrastructure Services</span>
        <div className="space-y-3">
          {services.map((svc, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-semibold">{svc.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                <span>Latency: <strong className="text-sky-400">{svc.latency}</strong></span>
                <span>Uptime: <strong className="text-emerald-400">{svc.uptime}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
