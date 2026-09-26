'use client';

import React from 'react';
import { AnomalyChart } from '../../../components/analytics/AnomalyChart';
import { Activity, Radio } from 'lucide-react';

export default function RealtimeAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>REAL-TIME DISASTER STREAM ANALYTICS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Sub-second event stream processing of geotechnical readings, flood stages, and mesh packet drops
        </p>
      </div>

      <AnomalyChart />
    </div>
  );
}
