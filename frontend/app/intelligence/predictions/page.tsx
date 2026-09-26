'use client';

import React from 'react';
import { RiskCard } from '../../../components/prediction/RiskCard';
import { FeatureImportance } from '../../../components/prediction/FeatureImportance';
import { usePrediction } from '../../../hooks/usePrediction';
import { Mountain, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PredictionsPage() {
  const { predictions, loading } = usePrediction();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Mountain className="w-5 h-5 text-amber-400" />
          <span>GEOTECHNICAL FAILURE & SLIP PREDICTIONS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Bishop / Mohr-Coulomb Factor of Safety (<1.0 signifies rupture surface failure)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((p) => (
          <RiskCard key={p.id} prediction={p} />
        ))}
      </div>

      <FeatureImportance />
    </div>
  );
}
