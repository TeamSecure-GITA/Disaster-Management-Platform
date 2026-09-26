'use client';

import React from 'react';
import { SituationBrief } from '../../../components/ai/SituationBrief';
import { Sparkles, Bot, Clock } from 'lucide-react';

export default function AIBriefDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span>AUTONOMOUS AI EXECUTIVE BRIEFINGS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Real-time generative briefings synthesising multi-sensor telemetry, satellite feeds, and response logs
        </p>
      </div>

      <SituationBrief
        brief={{
          id: 'brief-01',
          headline: 'Severe Colluvium Infiltration: High Landslide Vulnerability along Southern Slopes',
          summary: 'Antecedent precipitation has reached 298mm over the past 48 hours across East Khasi Hills. Inclinometer telemetry confirms continuous shear strain exceeding 3.8mm/hr.',
          threatLevel: 'HIGH',
          keyImpactZones: ['Mawlynnong Sector', 'NH-40 Umiam Valley Corridor', 'Sohra Road Km 18'],
          recommendedActions: [
            'Pre-position NDRF Battalion 1 at Shillong staging terminal',
            'Deploy autonomous UAV thermal reconnaissance over unstable cuts',
            'Switch public cellular tower alerts to standby broadcast',
          ],
          generatedAt: new Date().toISOString(),
          confidence: 0.94,
          modelsUsed: ['Mohr-Coulomb Geotech Engine', 'Gemini-1.5-Pro', 'Satellite SAR interferometry'],
        }}
      />
    </div>
  );
}
