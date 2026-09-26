'use client';

import React from 'react';
import { ForecastChart } from '../../../components/prediction/ForecastChart';
import { useForecast } from '../../../hooks/useForecast';
import { TrendingUp, CloudRain } from 'lucide-react';

export default function ForecastingPage() {
  const { points } = useForecast('zone-meghalaya-1');

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          <span>ATMOSPHERIC & PRECIPITATION HORIZON FORECASTING</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          24-Hour continuous dynamic rainfall simulation integrated with WRF-India mesoscale models
        </p>
      </div>

      <ForecastChart points={points} />
    </div>
  );
}
