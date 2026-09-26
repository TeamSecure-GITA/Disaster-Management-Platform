'use client';

import React from 'react';
import { DistributionChart } from '../../../components/analytics/DistributionChart';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { Truck, Shield } from 'lucide-react';

export default function ResponseResourcesPage() {
  const { resourceAllocations } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          <span>TACTICAL EQUIPMENT & AIRLIFT DISPATCH</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Heavy machinery deployment, watercraft readiness, and aerial drop capabilities
        </p>
      </div>

      <DistributionChart resources={resourceAllocations} />
    </div>
  );
}
