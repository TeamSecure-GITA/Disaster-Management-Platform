'use client';

import React from 'react';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const prompts = [
    'Assess failure probability on NH-10 Shillong Bypass',
    'Current pore-water pressure anomaly at Mawlynnong',
    'List all NDRF squads ready for flood rescue in Majuli',
    'Run Mohr-Coulomb landslide simulation with 300mm cloudburst',
    'What is the battery health of LoRaWAN Gateway Node 08?',
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900/60 border-t border-slate-800">
      {prompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(p)}
          className="text-[11px] text-slate-300 hover:text-white bg-slate-800/80 hover:bg-sky-900/50 border border-slate-700/80 hover:border-sky-500/50 rounded-full px-3 py-1 transition-all"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
