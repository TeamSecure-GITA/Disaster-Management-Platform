'use client';

import React from 'react';
import { ResponseStatus } from '../../../components/emergency/ResponseStatus';
import { IncidentCard } from '../../../components/emergency/IncidentCard';
import { incidentStore } from '../../../stores/incidentStore';
import { Radio, ShieldAlert } from 'lucide-react';

export default function DispatchPage() {
  const { incidents } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Radio className="w-5 h-5 text-rose-500" />
          <span>MULTI-AGENCY TACTICAL DISPATCH CONSOLE</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Direct tactical frequency relays (NDRF, SDRF, Paramilitary, Community Volunteers)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ResponseStatus status="DISPATCHED" unitsCount={4} droneActive={true} />
        </div>

        <div className="space-y-3">
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      </div>
    </div>
  );
}
