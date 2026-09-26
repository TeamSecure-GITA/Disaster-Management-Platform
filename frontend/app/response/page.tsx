'use client';

import React from 'react';
import Link from 'next/link';
import { ResponseStatus } from '../../components/emergency/ResponseStatus';
import { IncidentCard } from '../../components/emergency/IncidentCard';
import { DisasterMap } from '../../components/maps/DisasterMap';
import { incidentStore } from '../../stores/incidentStore';
import { ShieldAlert, Navigation, Radio, Users, Home } from 'lucide-react';

export default function ResponsePage() {
  const { incidents, responders } = incidentStore.getState();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>EMERGENCY DISPATCH & RESPONSE ORCHESTRATION</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Autonomous multi-agency routing, responder unit tracking, and evacuation execution
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link href="/response/evacuation" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Evacuation
          </Link>
          <Link href="/response/dispatch" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Dispatch
          </Link>
          <Link href="/response/responders" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Responders
          </Link>
          <Link href="/response/shelters" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Shelters
          </Link>
          <Link href="/response/resources" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">
            Resources
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <DisasterMap />
          <ResponseStatus status="ON_SCENE" unitsCount={responders.length} droneActive={true} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Incident Callouts
          </h2>
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      </div>
    </div>
  );
}
