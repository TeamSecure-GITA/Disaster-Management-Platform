'use client';

import React from 'react';
import { FeatureImportance } from '../../../components/prediction/FeatureImportance';
import { RiskExplanation } from '../../../components/ai/RiskExplanation';
import { BarChart3, HelpCircle } from 'lucide-react';

export default function ExplainabilityPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>MODEL EXPLAINABILITY & GEOTECHNICAL SHAP/LIME</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Auditable AI reasoning explaining feature attribution and decision confidence scores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureImportance />
        <RiskExplanation />
      </div>
    </div>
  );
}
