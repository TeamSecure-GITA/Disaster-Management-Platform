'use client';

import React from 'react';
import { LandslidePrediction } from '../../types/prediction';
import { getRiskBadgeClass, calculateSafetyFactorStatus } from '../../utils/risk';
import { formatHazardName } from '../../utils/format';
import { ShieldAlert, Droplets, Mountain, Gauge } from 'lucide-react';

interface RiskCardProps {
  prediction: LandslidePrediction;
  onClick?: () => void;
}

export function RiskCard({ prediction, onClick }: RiskCardProps) {
  const fosStatus = calculateSafetyFactorStatus(prediction.factorOfSafety);

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-lg group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${getRiskBadgeClass(prediction.riskLevel)}`}>
          {prediction.riskLevel}
        </span>
        <span className="text-xs font-mono text-slate-400">
          Probability: <strong className="text-slate-200">{Math.round(prediction.probability * 100)}%</strong>
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-sky-400 transition-colors">
        {prediction.location.region}
      </h3>
      <p className="text-xs text-slate-400 mb-4 font-mono">
        Hazard: {formatHazardName(prediction.hazardType)}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Mohr-Coulomb FoS</span>
          <span className={`font-bold ${fosStatus.color}`}>
            {prediction.factorOfSafety.toFixed(2)} ({fosStatus.status})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">24h Rain Fall</span>
          <span className="text-slate-200 font-bold">{prediction.rainfallPast24hMm} mm</span>
        </div>
      </div>
    </div>
  );
}
