'use client';

import React from 'react';
import { ResponderTeam } from '../../types/incident';
import { Shield, Radio } from 'lucide-react';

interface ResponderLayerProps {
  responders: ResponderTeam[];
}

export function ResponderLayer({ responders }: ResponderLayerProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
        Active Tactical Response Units
      </span>
      {responders.map((team) => (
        <div
          key={team.id}
          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
        >
          <div className="flex items-center space-x-2 truncate">
            <Shield className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <span className="font-medium text-slate-200 truncate">{team.name}</span>
          </div>
          <div className="text-right font-mono text-[10px] text-amber-400">
            {team.status} ({team.personnelCount} pax)
          </div>
        </div>
      ))}
    </div>
  );
}
