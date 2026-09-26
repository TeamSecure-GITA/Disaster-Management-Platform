'use client';

import React from 'react';
import { FeatureImportanceItem } from '../../types/prediction';
import { HelpCircle, BarChart3 } from 'lucide-react';

interface RiskExplanationProps {
  features?: FeatureImportanceItem[];
  title?: string;
}

export function RiskExplanation({ features = [], title = 'Geotechnical Factor Explainability (SHAP / LIME)' }: RiskExplanationProps) {
  if (!features || features.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 text-slate-300 font-mono font-semibold">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <span>{title}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Relative Contribution</span>
      </div>

      <div className="space-y-2.5">
        {features.map((feat, idx) => {
          const pct = Math.round(feat.importance * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="font-medium text-slate-200">{feat.featureName}</span>
                <span className="font-mono text-sky-400">{pct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-cyan-400 h-1.5 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">{feat.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
