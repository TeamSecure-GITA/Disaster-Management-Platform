'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { KPIMetric } from '../../types/analytics';

interface KPICardProps {
  kpi: KPIMetric;
  icon?: React.ReactNode;
}

export function KPICard({ kpi, icon }: KPICardProps) {
  const isPositive = kpi.isPositiveChange ?? true;

  const statusBorder = {
    danger: 'border-rose-500/40 hover:border-rose-500/80 shadow-glow-danger',
    warning: 'border-amber-500/40 hover:border-amber-500/80 shadow-glow-warning',
    success: 'border-emerald-500/40 hover:border-emerald-500/80 shadow-glow-success',
    normal: 'border-slate-800 hover:border-sky-500/50 shadow-glow',
  }[kpi.status || 'normal'];

  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/70 border transition-all duration-300 backdrop-blur-md group ${statusBorder}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
          {kpi.label}
        </span>
        <div className="p-2 rounded-xl bg-slate-800/80 text-sky-400 group-hover:scale-110 transition-transform">
          {icon || <Activity className="w-4 h-4" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-100">
          {kpi.value}
        </div>

        {kpi.changePct !== undefined && (
          <div
            className={`flex items-center space-x-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{Math.abs(kpi.changePct)}%</span>
          </div>
        )}
      </div>

      {kpi.unit && (
        <span className="text-[10px] font-mono text-slate-500 mt-1 block">Unit: {kpi.unit}</span>
      )}
    </div>
  );
}
