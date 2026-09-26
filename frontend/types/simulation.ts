import { GeoCoordinate, HazardType } from './prediction';

export interface SimulationParameters {
  scenarioId: string;
  rainfallMultiplier: number; // e.g. 1.0 = normal, 2.5 = cloudburst
  seismicMagnitude: number; // 0 to 9 on Richter
  soilSaturationInitialPct: number;
  riverDischargeRateCusecs: number;
  durationHours: number;
  bridgeFailuresEnabled: boolean;
}

export interface SimulationStepImpact {
  timeStepHours: number;
  affectedAreaSqKm: number;
  projectedDisplacedCount: number;
  estimatedDamageUsd: number;
  criticalInfrastructureLost: string[];
  inundationLevelMeters: number;
  landslideProbabilities: { zoneId: string; prob: number }[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  hazardType: HazardType;
  description: string;
  targetRegion: string;
  centerCoordinates: GeoCoordinate;
  defaultParameters: SimulationParameters;
}

export interface SimulationRunResult {
  runId: string;
  scenarioName: string;
  completedAt: string;
  totalRunTimeMs: number;
  steps: SimulationStepImpact[];
  summary: {
    peakCasualtyRisk: number;
    highestRiskSector: string;
    safestEvacuationCorridors: string[];
    criticalBottlenecks: string[];
  };
}
