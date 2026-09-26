'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DisasterMap } from '../components/maps/DisasterMap';
import { KPICard } from '../components/analytics/KPICard';
import { SituationBrief } from '../components/ai/SituationBrief';
import { IncidentCard } from '../components/emergency/IncidentCard';
import { ResponseStatus } from '../components/emergency/ResponseStatus';
import { RiskGauge } from '../components/prediction/RiskGauge';
import { AICopilot } from '../components/ai/AICopilot';
import { useAnalytics } from '../hooks/useAnalytics';
import { incidentStore } from '../stores/incidentStore';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  Radio, 
  Cpu, 
  Compass, 
  Flame, 
  Sparkles, 
  ChevronRight,
  Bot
} from 'lucide-react';

export default function HomePage() {
  const { kpis } = useAnalytics();
  const [incState] = useState(incidentStore.getState());
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Platform Title & Tactical Mission Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <span>COMMAND COCKPIT</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase tracking-wider">
              DEFCON 2 • ACTIVE MONITORING
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            North Eastern Region (NER) Geospatial Early Warning, Autonomous Drone Recon & Zero-Grid P2P Mesh
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCopilotDrawer(!showCopilotDrawer)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-mono text-xs font-bold shadow-glow transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>{showCopilotDrawer ? 'Close AI Copilot' : 'Open Tactical Copilot'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Central Command Grid: GIS Map + Incident Radar Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Map View (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <DisasterMap />
        </div>

        {/* Live Incident Stream & Response Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Incident Queue
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {incState.incidents.length} Unresolved
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {incState.incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <ResponseStatus status="DISPATCHED" unitsCount={3} droneActive={true} />
            </div>
          </div>

          <RiskGauge score={78} title="Regional Landslide Risk Index" />
        </div>
      </div>

      {/* AI Copilot Drawer / Section if toggled */}
      {showCopilotDrawer && (
        <div className="h-[520px]">
          <AICopilot />
        </div>
      )}

      {/* Situation Briefing Banner */}
      <SituationBrief
        brief={{
          id: 'brief-home',
          headline: 'High Pore-Water Pressure & Rain Infiltration Detected in East Khasi Hills',
          summary: 'Antecedent precipitation has reached 280mm over 48 hours. Deep inclinometer nodes report accelerated shear creep along the Mawlynnong ridge.',
          threatLevel: 'HIGH',
          keyImpactZones: ['Mawlynnong Sector', 'NH-40 Umiam Valley Corridor', 'Sohra Road Km 18'],
          recommendedActions: [
            'Pre-position NDRF Battalion 1 at Shillong staging terminal',
            'Deploy autonomous UAV thermal reconnaissance over unstable cuts',
            'Route civilian traffic through Southern Ridge bypass corridor',
          ],
          generatedAt: new Date().toISOString(),
          confidence: 0.96,
          modelsUsed: ['Mohr-Coulomb Geotech Engine', 'Gemini 1.5 Pro', 'Satellite SAR interferometry'],
        }}
      />

      {/* Quick Navigation Cards into Deep Operational Modules */}
      <div className="pt-2">
        <h2 className="text-sm font-mono uppercase font-bold text-slate-400 tracking-wider mb-3">
          Tactical Operations Modules
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: 'Intelligence', href: '/intelligence', icon: Compass, color: 'text-cyan-400' },
            { title: 'Analytics', href: '/analytics', icon: Activity, color: 'text-sky-400' },
            { title: 'Response Dispatch', href: '/response', icon: ShieldAlert, color: 'text-rose-400' },
            { title: 'IoT Sensors', href: '/sensors', icon: Cpu, color: 'text-amber-400' },
            { title: 'Drone Missions', href: '/drone', icon: Radio, color: 'text-emerald-400' },
            { title: 'Digital Twin Sim', href: '/simulation', icon: Flame, color: 'text-indigo-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className={`p-2 rounded-lg bg-slate-950 w-fit mb-2 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-200 group-hover:text-white">
                    {item.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
