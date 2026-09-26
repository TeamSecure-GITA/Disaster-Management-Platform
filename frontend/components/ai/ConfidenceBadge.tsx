'use client';

import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score?: number; // 0 to 1
  className?: string;
}

export function ConfidenceBadge({ score = 0.95, className = '' }: ConfidenceBadgeProps) {
  const pct = Math.round(score * 100);
  const isHigh = pct >= 85;
  const isMedium = pct >= 70 && pct < 85;

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
        isHigh
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          : isMedium
          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
      } ${className}`}
    >
      {isHigh ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
      <span>{pct}% AI Confidence</span>
    </div>
  );
}
