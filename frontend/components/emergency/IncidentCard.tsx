'use client';

import React from 'react';
import { Incident } from '../../types/incident';
import { formatHazardName } from '../../utils/format';
import { formatRelativeTime } from '../../utils/dates';
import { MapPin, Users, Clock, ShieldAlert } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onSelect?: (incident: Incident) => void;
  isSelected?: boolean;
}

export function IncidentCard({ incident, onSelect, isSelected = false }: IncidentCardProps) {
  const severityColors = {
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    CATASTROPHIC: 'text-rose-400 bg-rose-500/10 border-rose-500/40 animate-pulse',
  };

  return (
    <div
      onClick={() => onSelect && onSelect(incident)}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-slate-800/90 border-sky-500 shadow-glow'
          : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
            severityColors[incident.severity]
          }`}
        >
          {incident.severity}
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          {formatRelativeTime(incident.createdAt)}
        </span>
      </div>

      <h3 className="font-semibold text-slate-100 text-sm mb-1 line-clamp-1">{incident.title}</h3>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{incident.description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80 font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          <span className="truncate">{incident.location.address}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>{incident.affectedPeople} At Risk</span>
        </div>
      </div>
    </div>
  );
}
