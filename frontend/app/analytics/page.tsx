'use client';

import React from 'react';
import Link from 'next/link';
import { KPICard } from '../../components/analytics/KPICard';
import { TrendChart } from '../../components/analytics/TrendChart';
import { DistributionChart } from '../../components/analytics/DistributionChart';
import { AnomalyChart } from '../../components/analytics/AnomalyChart';
import { ModelMetrics } from '../../components/analytics/ModelMetrics';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BarChart3, TrendingUp, PieChart, Activity, Cpu } from 'lucide-react';

export default function AnalyticsPage() {
  const { kpis, incidentTrends, resourceAllocations, modelMetrics } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            <span>OPERATIONAL & PREDICTIVE ANALYTICS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Resource deployment, incident metrics, and machine learning inference latency
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link href="/analytics/realtime" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Realtime
          </Link>
          <Link href="/analytics/historical" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Historical
          </Link>
          <Link href="/analytics/incidents" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Incidents
          </Link>
          <Link href="/analytics/resources" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Resources
          </Link>
          <Link href="/analytics/shelters" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Shelters
          </Link>
          <Link href="/analytics/model-performance" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            ML Metrics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={incidentTrends} />
        <DistributionChart resources={resourceAllocations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomalyChart />
        <ModelMetrics metrics={modelMetrics} />
      </div>
    </div>
  );
}
