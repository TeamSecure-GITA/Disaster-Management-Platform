'use client';

import React from 'react';
import { ForecastPoint } from '../../types/prediction';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface ForecastChartProps {
  points?: ForecastPoint[];
  title?: string;
}

export function ForecastChart({ points = [], title = '24-Hour Failure Probability Horizon' }: ForecastChartProps) {
  if (!points || points.length === 0) {
    return <div className="p-6 text-center text-slate-500 font-mono text-xs">Awaiting meteorological timeline stream...</div>;
  }

  const maxHeight = 120;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 font-mono text-xs font-bold text-slate-200">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <span className="inline-block w-2.5 h-0.5 bg-rose-500" />
          <span>Threshold 75%</span>
        </div>
      </div>

      {/* SVG Timeline Chart */}
      <div className="relative h-36 flex items-end justify-between gap-1 pt-6 px-2">
        {/* Threshold guide line */}
        <div
          className="absolute left-0 right-0 border-b border-dashed border-rose-500/60 pointer-events-none"
          style={{ bottom: `${0.75 * maxHeight}px` }}
        />

        {points.map((pt, i) => {
          const heightPx = Math.round(pt.predictedProbability * maxHeight);
          const isBreached = pt.predictedProbability >= pt.triggerThreshold;

          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isBreached
                    ? 'bg-gradient-to-t from-rose-600 to-red-400 shadow-glow-danger'
                    : 'bg-gradient-to-t from-sky-600/70 to-cyan-400/80 hover:bg-sky-400'
                }`}
                style={{ height: `${Math.max(6, heightPx)}px` }}
              />

              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-100 text-[10px] font-mono px-2 py-1 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20 shadow-xl">
                Prob: {Math.round(pt.predictedProbability * 100)}% | Rain: {pt.rainfallForecastMm}mm
              </div>

              <span className="text-[9px] font-mono text-slate-500 mt-2 rotate-45 origin-left">
                {new Date(pt.timestamp).getHours()}h
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
