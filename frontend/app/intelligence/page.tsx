'use client';

import React from 'react';
import Link from 'next/link';
import { DisasterMap } from '../../components/maps/DisasterMap';
import { RiskCard } from '../../components/prediction/RiskCard';
import { ForecastChart } from '../../components/prediction/ForecastChart';
import { FeatureImportance } from '../../components/prediction/FeatureImportance';
import { usePrediction } from '../../hooks/usePrediction';
import { useForecast } from '../../hooks/useForecast';
import { Compass, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

export default function IntelligencePage() {
  const { predictions } = usePrediction();
  const { points } = useForecast();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-cyan-400" />
            <span>PREDICTIVE HAZARD INTELLIGENCE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Geotechnical Failure Probability, Mohr-Coulomb Stability & Antecedent Rainfall Forensics
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link href="/intelligence/risk-map" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Risk Map
          </Link>
          <Link href="/intelligence/predictions" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Predictions
          </Link>
          <Link href="/intelligence/forecasting" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Forecasting
          </Link>
          <Link href="/intelligence/anomalies" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Anomalies
          </Link>
          <Link href="/intelligence/explainability" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Explainability
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <DisasterMap />
          <ForecastChart points={points} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            Critical Landslide Predictions
          </h2>
          {predictions.map((p) => (
            <RiskCard key={p.id} prediction={p} />
          ))}
          <FeatureImportance />
        </div>
      </div>
    </div>
  );
}
