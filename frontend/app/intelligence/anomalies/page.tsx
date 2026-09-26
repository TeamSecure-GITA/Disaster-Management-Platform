'use client';

import React from 'react';
import { AnomalyChart } from '../../../components/analytics/AnomalyChart';
import { AlertOctagon, Activity } from 'lucide-react';

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-500" />
          <span>REAL-TIME SENSOR ANOMALY DETECTIONS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Unsupervised Isolation Forests & Autoencoders detecting pre-failure signatures
        </p>
      </div>

      <AnomalyChart />
    </div>
  );
}
