'use client';

import React from 'react';
import { RiskGauge } from '../../../components/prediction/RiskGauge';
import { HazardHeatmap } from '../../../components/prediction/HazardHeatmap';
import { RiskTimeline } from '../../../components/prediction/RiskTimeline';
import { useRisk } from '../../../hooks/useRisk';
import { ShieldAlert, Activity, Mountain } from 'lucide-react';

export default function RiskDashboardPage() {
  const { zones, overallIndex } = useRisk();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>REGIONAL RISK & THREAT INDEX</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Multi-hazard assessment combining geotechnical, meteorological, and structural indices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskGauge score={overallIndex} title="Composite Regional Threat Index" />
        <RiskGauge score={84} title="East Khasi Hills Landslide Index" />
        <RiskGauge score={68} title="Brahmaputra Flood Risk Index" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HazardHeatmap />
        <RiskTimeline />
      </div>
    </div>
  );
}
