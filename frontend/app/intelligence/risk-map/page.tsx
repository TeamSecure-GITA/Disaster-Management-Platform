'use client';

import React from 'react';
import { DisasterMap } from '../../../components/maps/DisasterMap';
import { HazardHeatmap } from '../../../components/prediction/HazardHeatmap';
import { Layers } from 'lucide-react';

export default function RiskMapPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <span>SPATIAL RISK MAP & SATELLITE RADAR OVERLAY</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          High-resolution interactive GIS mapping with real-time hazard layers and LoRa telemetry pins
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <DisasterMap />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <HazardHeatmap />
        </div>
      </div>
    </div>
  );
}
