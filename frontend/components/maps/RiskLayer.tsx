'use client';

import React from 'react';
import { RegionalRiskZone } from '../../types/risk';

interface RiskLayerProps {
  zones: RegionalRiskZone[];
  selectedZoneId?: string | null;
  onSelectZone?: (id: string) => void;
}

export function RiskLayer({ zones, selectedZoneId, onSelectZone }: RiskLayerProps) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
        Active Regional Risk Sectors
      </span>
      {zones.map((zone) => {
        const isSelected = zone.id === selectedZoneId;
        const colorClass =
          zone.level === 'CRITICAL'
            ? 'border-rose-500/60 bg-rose-500/10 text-rose-300'
            : zone.level === 'HIGH'
            ? 'border-orange-500/60 bg-orange-500/10 text-orange-300'
            : 'border-amber-500/60 bg-amber-500/10 text-amber-300';

        return (
          <div
            key={zone.id}
            onClick={() => onSelectZone && onSelectZone(zone.id)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${colorClass} ${
              isSelected ? 'ring-2 ring-sky-400 shadow-glow' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-100">{zone.name}</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/80">
                {zone.overallRiskScore} / 100
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-mono">
              <span>{zone.primaryHazard}</span>
              <span>{zone.populationAtRisk.toLocaleString()} pop</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
