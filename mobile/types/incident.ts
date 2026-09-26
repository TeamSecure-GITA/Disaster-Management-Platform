import { GeoCoordinates } from './location';

export type IncidentCategory = 'landslide' | 'flood' | 'building_collapse' | 'road_cut' | 'fire' | 'medical_trauma';
export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface IncidentReport {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  coordinates: GeoCoordinates;
  address?: string;
  photos: string[];
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'verified' | 'dispatched' | 'resolved';
  syncStatus: 'synced' | 'pending_sync' | 'failed';
}
