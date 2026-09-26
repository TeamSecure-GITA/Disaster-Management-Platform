'use client';

import React from 'react';
import { ResourceAllocationData } from '../../types/analytics';
import { PieChart, AlertCircle } from 'lucide-react';

interface DistributionChartProps {
  resources?: ResourceAllocationData[];
}

export function DistributionChart({ resources = [] }: DistributionChartProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 font-mono font-bold text-slate-200">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <span>Strategic Asset Deployment Ratios</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Tactical Fleet</span>
      </div>

      <div className="space-y-3">
        {resources.map((res, i) => {
          const total = res.deployed + res.available;
          const deployedPct = total > 0 ? Math.round((res.deployed / total) * 100) : 0;

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-medium truncate flex items-center gap-1.5">
                  {res.criticalShortage && <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                  <span className="truncate">{res.category}</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {res.deployed} / {total} ({deployedPct}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 flex">
                <div
                  className={`h-2 transition-all ${
                    res.criticalShortage ? 'bg-rose-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${deployedPct}%` }}
                />
                <div
                  className="h-2 bg-slate-800"
                  style={{ width: `${100 - deployedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
