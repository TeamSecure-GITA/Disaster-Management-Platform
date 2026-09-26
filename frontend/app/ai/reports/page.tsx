'use client';

import React from 'react';
import { FileText, Download, Clock, CheckCircle } from 'lucide-react';

export default function AIReportsPage() {
  const reports = [
    { title: 'Executive Post-Disaster Prognosis Report - NER Sector', date: '2026-09-25 18:00', format: 'PDF (Generated)', size: '2.4 MB' },
    { title: 'Geotechnical Mohr-Coulomb Stability Assessment (NH-10)', date: '2026-09-25 12:00', format: 'JSON / CSV', size: '840 KB' },
    { title: 'Inter-Agency Multi-Modal Evacuation Route Log', date: '2026-09-24 08:30', format: 'PDF', size: '1.8 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>AI-GENERATED POST-ACTION & THREAT REPORTS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Automated multi-agency briefing documents and regulatory post-incident forensics
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((rep, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">{rep.title}</h3>
                <span className="text-[11px] font-mono text-slate-500">{rep.date} • {rep.size}</span>
              </div>
            </div>

            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
