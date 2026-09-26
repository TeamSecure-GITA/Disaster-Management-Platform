'use client';

import React from 'react';
import { IncidentAnalyticsPoint } from '../../types/analytics';
import { BarChart2 } from 'lucide-react';

interface TrendChartProps {
  data?: IncidentAnalyticsPoint[];
  title?: string;
}

export function TrendChart({ data = [], title = 'Weekly Incident Resolution vs Response Latency' }: TrendChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.incidentsReported, d.incidentsResolved, 1)));

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 font-mono text-xs font-bold text-slate-200">
          <BarChart2 className="w-4 h-4 text-sky-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center space-x-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-sky-500" /> Reported
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Resolved
          </span>
        </div>
      </div>

      <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
        {data.map((d, i) => {
          const repHeight = (d.incidentsReported / maxVal) * 120;
          const resHeight = (d.incidentsResolved / maxVal) * 120;

          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="flex items-end gap-1 w-full justify-center">
                <div
                  className="w-3 sm:w-4 bg-sky-500/80 hover:bg-sky-400 rounded-t transition-all group relative"
                  style={{ height: `${Math.max(4, repHeight)}px` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950 text-slate-100 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none z-10 font-mono">
                    {d.incidentsReported}
                  </div>
                </div>

                <div
                  className="w-3 sm:w-4 bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition-all group relative"
                  style={{ height: `${Math.max(4, resHeight)}px` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950 text-slate-100 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none z-10 font-mono">
                    {d.incidentsResolved}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 mt-2">{d.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
