import { GeoCoordinates } from './location';

export interface FeatureContribution {
  featureName: string;
  importance: number;
  category: string;
  description: string;
}

export interface LandslidePredictionData {
  id: string;
  location: {
    region: string;
    coordinates: GeoCoordinates;
  };
  probability: number;
  factorOfSafety: number;
  timeToEventHours?: number;
  hazardType: string;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  rainfallPast24hMm: number;
  soilSaturationPct: number;
  topFeatures: FeatureContribution[];
  predictedAt: string;
  validUntil: string;
}

export interface ForecastPointItem {
  timestamp: string;
  predictedProbability: number;
  lowerConfidenceBound: number;
  upperConfidenceBound: number;
  triggerThreshold: number;
  rainfallForecastMm: number;
}
