'use client';

import React from 'react';
import { FeatureImportanceItem } from '../../types/prediction';

interface FeatureImportanceProps {
  items?: FeatureImportanceItem[];
}

export function FeatureImportance({ items = [] }: FeatureImportanceProps) {
  const defaultItems: FeatureImportanceItem[] = items.length > 0 ? items : [
    { featureName: 'Piezometer Pore Water Pressure', importance: 0.35, category: 'pore_pressure', description: 'Deep groundwater buildup reduction in shear strength' },
    { featureName: '72hr Cumulative Rainfall (mm)', importance: 0.28, category: 'rainfall_intensity', description: 'Antecedent soil saturation saturation limit' },
    { featureName: 'Slope Inclinometer Angular Rate', importance: 0.22, category: 'slope_angle', description: 'Creep velocity in degrees per hour' },
    { featureName: 'Micro-Seismic Energy Flux', importance: 0.15, category: 'seismic_shaking', description: 'Subsurface acoustic emissions from rock fracture' },
  ];

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono font-bold text-slate-200">Ensemble Feature Importance (SHAP)</span>
        <span className="text-[10px] font-mono text-sky-400">Total: 100%</span>
      </div>

      <div className="space-y-3">
        {defaultItems.map((item, idx) => {
          const pct = Math.round(item.importance * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="font-medium text-slate-200 truncate">{item.featureName}</span>
                <span className="font-mono text-cyan-400">{pct}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
