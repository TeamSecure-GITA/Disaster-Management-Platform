'use client';

import React from 'react';
import { SourceCitation } from '../../types/ai';
import { Database, Satellite, Cpu, Radio, ExternalLink } from 'lucide-react';

interface SourceListProps {
  citations?: SourceCitation[];
}

export function SourceList({ citations = [] }: SourceListProps) {
  if (!citations || citations.length === 0) return null;

  const getSourceIcon = (type: SourceCitation['sourceType']) => {
    switch (type) {
      case 'satellite_sar':
        return <Satellite className="w-3.5 h-3.5 text-cyan-400" />;
      case 'sensor_telemetry':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'drone_feed':
        return <Radio className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Database className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
      <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider block mb-1.5">
        Ground Truth Citations & Feeds
      </span>
      <div className="space-y-1.5">
        {citations.map((cite) => (
          <div
            key={cite.id}
            className="flex items-center justify-between text-xs bg-slate-950/60 hover:bg-slate-800/60 px-2.5 py-1.5 rounded border border-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2 truncate">
              {getSourceIcon(cite.sourceType)}
              <span className="text-slate-200 font-medium truncate">{cite.title}</span>
              <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">
                ({Math.round(cite.confidence * 100)}% match)
              </span>
            </div>
            {cite.url && (
              <a
                href={cite.url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 ml-2"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
