'use client';

import React from 'react';
import { ModelPerformanceMetric } from '../../types/analytics';
import { Cpu, CheckCircle } from 'lucide-react';

interface ModelMetricsProps {
  metrics?: ModelPerformanceMetric[];
}

export function ModelMetrics({ metrics = [] }: ModelMetricsProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 font-mono font-bold text-slate-200">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Production AI/ML Model Latency & AUC-ROC</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> All Models Active
        </span>
      </div>

      <div className="space-y-3">
        {metrics.map((m, i) => (
          <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100">{m.modelName}</span>
              <span className="font-mono text-emerald-400 text-xs font-bold">
                AUC: {(m.aucRoc * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
              <div>
                <span>Accuracy:</span> <strong className="text-slate-200">{Math.round(m.accuracy * 100)}%</strong>
              </div>
              <div>
                <span>F1-Score:</span> <strong className="text-slate-200">{Math.round(m.f1Score * 100)}%</strong>
              </div>
              <div>
                <span>Recall:</span> <strong className="text-slate-200">{Math.round(m.recall * 100)}%</strong>
              </div>
              <div>
                <span>Latency:</span> <strong className="text-sky-400">{m.inferenceLatencyMs}ms</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
