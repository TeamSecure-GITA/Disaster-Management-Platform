'use client';

import React from 'react';
import Link from 'next/link';
import { DisasterMap } from '../../components/maps/DisasterMap';
import { KPICard } from '../../components/analytics/KPICard';
import { SituationBrief } from '../../components/ai/SituationBrief';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Layers, Activity, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { kpis } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-400" />
            <span>EXECUTIVE DISASTER DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Holistic Command & Telemetry Aggregation for Tactical Decision Makers
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link
            href="/dashboard/situation"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Situation
          </Link>
          <Link
            href="/dashboard/risk"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Risk Analysis
          </Link>
          <Link
            href="/dashboard/ai-brief"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            AI Brief
          </Link>
          <Link
            href="/dashboard/system-health"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            System Health
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <DisasterMap />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <SituationBrief />
        </div>
      </div>
    </div>
  );
}
