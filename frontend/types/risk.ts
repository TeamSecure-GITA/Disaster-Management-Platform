import { HazardType, GeoCoordinate } from './prediction';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EXTREME';

export interface RegionalRiskZone {
  id: string;
  name: string;
  state: string;
  boundaryCoordinates: GeoCoordinate[];
  overallRiskScore: number; // 0 - 100
  level: RiskLevel;
  primaryHazard: HazardType;
  populationAtRisk: number;
  criticalInfrastructureImpacted: string[];
  activeSensorsCount: number;
  lastUpdated: string;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  value: number;
  status: 'SAFE' | 'WARNING' | 'DANGER';
}

export interface RiskAssessment {
  zoneId: string;
  zoneName: string;
  currentRiskScore: number;
  trend: 'STABLE' | 'ESCALATING' | 'SUBSIDING';
  factors: RiskFactor[];
  timestamp: string;
  evacuationRecommended: boolean;
}
