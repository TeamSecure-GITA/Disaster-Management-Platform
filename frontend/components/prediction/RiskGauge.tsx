'use client';

import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  title?: string;
  size?: number;
}

export function RiskGauge({ score, title = 'Hazard Threat Index', size = 180 }: RiskGaugeProps) {
  const normalized = Math.min(100, Math.max(0, score));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#ef4444'; // Red
    if (s >= 60) return '#f97316'; // Orange
    if (s >= 40) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  const getStatusText = (s: number) => {
    if (s >= 80) return 'CRITICAL HAZARD';
    if (s >= 60) return 'ELEVATED ALERT';
    if (s >= 40) return 'MODERATE ADVISORY';
    return 'BASELINE NORMAL';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getColor(normalized)}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black font-mono tracking-tight text-slate-100">
            {normalized}
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">/ 100</span>
        </div>
      </div>

      <span className="mt-2 text-xs font-mono font-bold tracking-wider" style={{ color: getColor(normalized) }}>
        {getStatusText(normalized)}
      </span>
      <span className="text-[11px] text-slate-400 mt-0.5">{title}</span>
    </div>
  );
}
