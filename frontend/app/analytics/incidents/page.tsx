'use client';

import React from 'react';
import { IncidentCard } from '../../../components/emergency/IncidentCard';
import { incidentStore } from '../../../stores/incidentStore';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AnalyticsIncidentsPage() {
  const { incidents } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>INCIDENT METRICS & RESOLUTION ARCHIVES</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Detailed registry of reported structural collapses, debris flows, and flash floods
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incidents.map((inc) => (
          <IncidentCard key={inc.id} incident={inc} />
        ))}
      </div>
    </div>
  );
}
