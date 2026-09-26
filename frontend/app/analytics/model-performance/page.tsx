'use client';

import React from 'react';
import { ModelMetrics } from '../../../components/analytics/ModelMetrics';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { Cpu, Activity } from 'lucide-react';

export default function AnalyticsModelPerformancePage() {
  const { modelMetrics } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>PRODUCTION MACHINE LEARNING PERFORMANCE</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          AUC-ROC, inference latency benchmarks, and dataset drift monitoring
        </p>
      </div>

      <ModelMetrics metrics={modelMetrics} />
    </div>
  );
}
