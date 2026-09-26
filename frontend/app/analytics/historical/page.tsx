'use client';

import React from 'react';
import { TrendChart } from '../../../components/analytics/TrendChart';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { Clock, Calendar } from 'lucide-react';

export default function HistoricalAnalyticsPage() {
  const { incidentTrends } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <span>HISTORICAL DISASTER PATTERNS & RETROSPECTIVES</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Longitudinal analysis across past monsoon cycles, historical landslide frequencies, and response KPIs
        </p>
      </div>

      <TrendChart data={incidentTrends} title="Multi-Year Monsoon Seasonal Incidents Comparison" />
    </div>
  );
}
