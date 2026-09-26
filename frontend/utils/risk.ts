/**
 * Risk classification and styling helpers
 */
import { RiskLevel } from '../types/risk';

export function getRiskLevelColor(level: RiskLevel | string): string {
  switch (level?.toUpperCase()) {
    case 'LOW':
    case 'VERY_LOW':
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'MODERATE':
      return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    case 'HIGH':
      return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    case 'CRITICAL':
    case 'EXTREME':
      return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    default:
      return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  }
}

export function getRiskBadgeClass(level: RiskLevel | string): string {
  switch (level?.toUpperCase()) {
    case 'LOW':
    case 'VERY_LOW':
      return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-glow-success';
    case 'MODERATE':
      return 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-glow-warning';
    case 'HIGH':
      return 'bg-orange-950/80 text-orange-300 border border-orange-500/40';
    case 'CRITICAL':
    case 'EXTREME':
      return 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-glow-danger animate-pulse';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

export function calculateSafetyFactorStatus(fos: number): {
  status: 'STABLE' | 'MARGINAL' | 'FAILURE_IMMINENT';
  color: string;
} {
  if (fos >= 1.3) {
    return { status: 'STABLE', color: 'text-emerald-400' };
  } else if (fos >= 1.0) {
    return { status: 'MARGINAL', color: 'text-amber-400' };
  } else {
    return { status: 'FAILURE_IMMINENT', color: 'text-rose-500' };
  }
}
