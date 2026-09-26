export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: GeoCoordinates;
  radiusMeters: number;
  hazardType: string;
  riskSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}
