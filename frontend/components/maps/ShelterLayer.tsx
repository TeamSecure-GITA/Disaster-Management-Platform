'use client';

import React from 'react';
import { ShelterLocation } from '../../types/incident';
import { Home, Users } from 'lucide-react';

interface ShelterLayerProps {
  shelters: ShelterLocation[];
}

export function ShelterLayer({ shelters }: ShelterLayerProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
        Designated Relief Shelters
      </span>
      {shelters.map((shelter) => {
        const occPct = Math.round((shelter.occupied / shelter.capacity) * 100);
        return (
          <div
            key={shelter.id}
            className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{shelter.name}</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                {occPct}% FULL
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between font-mono">
              <span>{shelter.address}</span>
              <span>{shelter.occupied} / {shelter.capacity}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
