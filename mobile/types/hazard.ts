export interface HazardItem {
  id: string;
  type: string;
  title: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  radiusKm: number;
  description: string;
  updatedAt: string;
}
