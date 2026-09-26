'use client';

import React from 'react';
import { SourceCitation as SourceCitationType } from '../../../types/ai';
import { Database, ExternalLink } from 'lucide-react';

interface SourceCitationProps {
  citation: SourceCitationType;
}

export function SourceCitation({ citation }: SourceCitationProps) {
  return (
    <div className="flex items-center justify-between text-xs bg-slate-950/70 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300">
      <div className="flex items-center space-x-2 truncate">
        <Database className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <span className="font-medium truncate">{citation.title}</span>
        <span className="text-[10px] font-mono text-slate-500">
          ({Math.round(citation.confidence * 100)}% match)
        </span>
      </div>
      {citation.url && (
        <a href={citation.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 ml-2">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
