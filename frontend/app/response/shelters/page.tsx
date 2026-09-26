'use client';

import React from 'react';
import { ShelterLayer } from '../../../components/maps/ShelterLayer';
import { incidentStore } from '../../../stores/incidentStore';
import { Home } from 'lucide-react';

export default function SheltersPage() {
  const { shelters } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-400" />
          <span>RELIEF SHELTERS & DISPLACEMENT RECEPTION</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Live capacity metrics, intake quotas, and emergency medical stationing
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <ShelterLayer shelters={shelters} />
      </div>
    </div>
  );
}
