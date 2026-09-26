'use client';

import React from 'react';
import { ResponderLayer } from '../../../components/maps/ResponderLayer';
import { incidentStore } from '../../../stores/incidentStore';
import { Shield, Radio, Users } from 'lucide-react';

export default function RespondersPage() {
  const { responders } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-sky-400" />
          <span>FIELD RESPONDERS & BATTALION TRACKING</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Real-time GPS telemetry, radio contact channels, and mission deployments
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <ResponderLayer responders={responders} />
      </div>
    </div>
  );
}
