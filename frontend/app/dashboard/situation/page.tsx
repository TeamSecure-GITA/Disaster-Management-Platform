'use client';

import React from 'react';
import { SituationBrief } from '../../../components/ai/SituationBrief';
import { ResponseStatus } from '../../../components/emergency/ResponseStatus';
import { IncidentCard } from '../../../components/emergency/IncidentCard';
import { incidentStore } from '../../../stores/incidentStore';
import { ShieldAlert, Radio, Activity, MapPin } from 'lucide-react';

export default function SituationPage() {
  const { incidents } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          <span>REAL-TIME SITUATION INTELLIGENCE FEED</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Live Threat Vectors, Operational Status & Incident Escalations
        </p>
      </div>

      <SituationBrief
        brief={{
          id: 'brief-sit-01',
          headline: 'Regional Rainfall Reaches 298mm - NH-10 Corridor Infiltration Warning',
          summary: 'Sensors in East Khasi Hills and Ri-Bhoi district report critical water saturation in superficial slope colluvium. Traffic on national arterial corridors is undergoing tactical redirection.',
          threatLevel: 'CRITICAL',
          keyImpactZones: ['NH-10 Km 42 Ri-Bhoi Sector', 'Mawlynnong Escarpment', 'Majuli Embankments'],
          recommendedActions: [
            'Maintain continuous UAV thermal sweep along unstable slopes',
            'Pre-position medical rescue teams in Shillong & Guwahati',
            'Broadcast emergency advisory via LoRa mesh and cell towers',
          ],
          generatedAt: new Date().toISOString(),
          confidence: 0.95,
          modelsUsed: ['Geotech-Infiltration-v4', 'WRF-Atmospheric', 'Gemini-1.5-Pro'],
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Active Sector Incidents</span>
          </h2>
          <div className="space-y-3">
            {incidents.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <ResponseStatus status="ON_SCENE" unitsCount={4} droneActive={true} />
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-2">
            <span className="text-slate-400 font-bold uppercase block">Field Command Notes</span>
            <p className="text-slate-300 leading-relaxed">
              NDRF Unit 4 has reached NH-10 Km 42. Excavators deployed to clear initial rubble slide. No human casualties confirmed. Drone UAV-Recon-02 provides 4K IR thermal stream to command center.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
