'use client';

import React, { useState } from 'react';
import { useRisk } from '../../hooks/useRisk';
import { useSensors } from '../../hooks/useSensors';
import { useDisasterWS } from '../../providers/WebSocketProvider';
import { RiskLayer } from './RiskLayer';
import { SensorLayer } from './SensorLayer';
import { EvacuationLayer } from './EvacuationLayer';
import { 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  MapPin, 
  Activity, 
  ShieldAlert, 
  Radio, 
  Satellite 
} from 'lucide-react';

export function DisasterMap() {
  const { zones, selectedZoneId, selectZone } = useRisk();
  const { sensors } = useSensors();
  const { isConnected } = useDisasterWS();

  const [activeTab, setActiveTab] = useState<'risk' | 'sensors' | 'evacuation'>('risk');
  const [zoomLevel, setZoomLevel] = useState(10);
  const [mapMode, setMapMode] = useState<'tactical' | 'satellite'>('tactical');

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
          <span className="font-mono text-xs text-slate-200 font-semibold tracking-wide">
            GIS COMMAND RADAR • 25.5788° N, 91.8933° E (SHILLONG)
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {mapMode.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setMapMode(m => m === 'tactical' ? 'satellite' : 'tactical')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono backdrop-blur-md transition-colors shadow-lg"
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch to {mapMode === 'tactical' ? 'SAR Satellite' : 'Tactical Vector'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas (Tactical Vector Simulation) */}
      <div className="relative flex-1 bg-gradient-to-b from-[#060b14] via-[#091122] to-[#040810] overflow-hidden flex items-center justify-center">
        {/* Tactical Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Radar concentric range rings */}
        <div className="absolute w-[450px] h-[450px] rounded-full border border-sky-500/10 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-sky-500/15 pointer-events-none" />
        <div className="absolute w-[150px] h-[150px] rounded-full border border-sky-500/20 pointer-events-none" />

        {/* Sweeping Radar Line */}
        <div className="absolute w-[450px] h-[450px] rounded-full overflow-hidden pointer-events-none opacity-40">
          <div className="w-full h-full animate-radar-sweep bg-[conic-gradient(from_0deg_at_50%_50%,rgba(6,182,212,0.3)_0deg,transparent_60deg)]" />
        </div>

        {/* Simulated Regional Sector Nodes */}
        {zones.map((zone, idx) => {
          const isSelected = zone.id === selectedZoneId;
          const posX = 45 + (idx % 2 === 0 ? -15 : 15);
          const posY = 50 + (idx % 2 === 0 ? -12 : 12);

          return (
            <div
              key={zone.id}
              onClick={() => selectZone(zone.id)}
              className="absolute cursor-pointer transition-transform duration-300 hover:scale-110 z-10"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              <div className="relative flex flex-col items-center">
                <span className="relative flex h-5 w-5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${zone.level === 'CRITICAL' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                  <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white items-center justify-center ${zone.level === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-500'}`}>
                    <ShieldAlert className="w-2.5 h-2.5 text-white" />
                  </span>
                </span>
                <div className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-xl border ${isSelected ? 'bg-sky-900/90 text-white border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900/80 text-slate-300 border-slate-700'}`}>
                  {zone.name} ({zone.overallRiskScore})
                </div>
              </div>
            </div>
          );
        })}

        {/* Sensor Markers */}
        {sensors.map((s, idx) => {
          const posX = 48 + ((idx * 17) % 30) - 15;
          const posY = 46 + ((idx * 19) % 25) - 12;

          return (
            <div
              key={s.id}
              className="absolute z-10 cursor-pointer group"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center shadow-glow group-hover:scale-125 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-100 text-[10px] font-mono px-2 py-1 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                {s.name} • {s.lastReading.value} {s.lastReading.unit}
              </div>
            </div>
          );
        })}

        {/* Autonomous Drone Swarm Vectors */}
        <div className="absolute left-[54%] top-[42%] flex items-center space-x-1.5 bg-slate-900/80 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 shadow-glow-success animate-pulse z-10">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>UAV-RECON-01 [ALT 420m]</span>
        </div>
      </div>

      {/* Floating Layer Selection Panel (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 w-80 max-h-72 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Layer Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-2 text-center transition-colors ${
              activeTab === 'risk' ? 'bg-sky-600/20 text-sky-400 border-b-2 border-sky-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Zones
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`flex-1 py-2 text-center transition-colors ${
              activeTab === 'sensors' ? 'bg-sky-600/20 text-sky-400 border-b-2 border-sky-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            IoT Sensors
          </button>
          <button
            onClick={() => setActiveTab('evacuation')}
            className={`flex-1 py-2 text-center transition-colors ${
              activeTab === 'evacuation' ? 'bg-sky-600/20 text-sky-400 border-b-2 border-sky-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Corridors
          </button>
        </div>

        {/* Tab Content List */}
        <div className="p-3 overflow-y-auto flex-1">
          {activeTab === 'risk' && (
            <RiskLayer zones={zones} selectedZoneId={selectedZoneId} onSelectZone={selectZone} />
          )}
          {activeTab === 'sensors' && <SensorLayer sensors={sensors} />}
          {activeTab === 'evacuation' && <EvacuationLayer />}
        </div>
      </div>

      {/* Bottom-Right Zoom & HUD Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-1.5">
        <button
          onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg backdrop-blur-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(4, z - 1))}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg backdrop-blur-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
