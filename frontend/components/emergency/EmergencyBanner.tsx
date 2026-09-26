'use client';

import React from 'react';
import { AlertOctagon, Siren, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmergencyBannerProps {
  headline?: string;
  subtext?: string;
  threatLevel?: 'ELEVATED' | 'HIGH' | 'CRITICAL' | 'NORMAL';
  actionUrl?: string;
}

export function EmergencyBanner({
  headline = 'FLASH FLOOD & MUDSLIDE RED ALERT: EAST KHASI HILLS',
  subtext = 'Pore-water pressure meters breached failure thresholds. Evacuation corridor 2 active.',
  threatLevel = 'CRITICAL',
  actionUrl = '/response/evacuation',
}: EmergencyBannerProps) {
  if (threatLevel === 'NORMAL') return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/90 via-red-900/80 to-slate-900 border-b border-rose-500/40 text-white px-4 py-2.5 shadow-glow-danger backdrop-blur-md z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <div className="flex items-center space-x-2 font-mono uppercase bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40 text-rose-300 font-bold">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{threatLevel} SEVERITY</span>
          </div>
          <p className="font-semibold tracking-wide text-slate-100">
            {headline} <span className="hidden md:inline text-slate-300 font-normal ml-2">| {subtext}</span>
          </p>
        </div>

        <Link
          href={actionUrl}
          className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium px-3 py-1 rounded text-xs transition-colors shadow-sm"
        >
          <span>Evacuation Action Protocol</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
