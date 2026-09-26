export type HazardType = 
  | 'landslide' 
  | 'flash_flood' 
  | 'earthquake' 
  | 'cyclone' 
  | 'debris_flow' 
  | 'wildfire';

export interface GeoCoordinate {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface FeatureImportanceItem {
  featureName: string;
  importance: number;
  category: 'soil_moisture' | 'pore_pressure' | 'slope_angle' | 'rainfall_intensity' | 'seismic_shaking' | 'vegetation_index';
  description: string;
}

export interface LandslidePrediction {
  id: string;
  location: {
    region: string;
    coordinates: GeoCoordinate;
  };
  probability: number; // 0 to 1
  factorOfSafety: number; // Mohr-Coulomb FoS (<1.0 is failure)
  timeToEventHours?: number;
  hazardType: HazardType;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  rainfallPast24hMm: number;
  soilSaturationPct: number;
  topFeatures: FeatureImportanceItem[];
  predictedAt: string;
  validUntil: string;
}

export interface ForecastPoint {
  timestamp: string;
  predictedProbability: number;
  lowerConfidenceBound: number;
  upperConfidenceBound: number;
  triggerThreshold: number;
  rainfallForecastMm: number;
}
