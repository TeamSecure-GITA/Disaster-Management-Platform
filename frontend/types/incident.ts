import { GeoCoordinate, HazardType } from './prediction';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC';
export type IncidentStatus = 'REPORTED' | 'DISPATCHED' | 'ON_SCENE' | 'CONTAINED' | 'RESOLVED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: HazardType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: {
    address: string;
    coordinates: GeoCoordinate;
  };
  reportedBy: string;
  affectedPeople: number;
  assignedTeams: string[];
  dispatchedDrones: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResponderTeam {
  id: string;
  name: string;
  type: 'NDRF' | 'SDRF' | 'MEDICAL_PARAMEDIC' | 'COMMUNITY_VOLUNTEER' | 'ENGINEERING_CORPS';
  coordinates: GeoCoordinate;
  status: 'IDLE' | 'EN_ROUTE' | 'ON_MISSION' | 'RESTING';
  assignedIncidentId?: string;
  personnelCount: number;
  contactFrequency: string;
}

export interface ShelterLocation {
  id: string;
  name: string;
  address: string;
  coordinates: GeoCoordinate;
  capacity: number;
  occupied: number;
  amenities: string[];
  contactPhone: string;
  isOpen: boolean;
}
