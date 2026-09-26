import { GeoCoordinates } from './location';

export interface FamilyCircleMember {
  id: string;
  fullName: string;
  relation: string;
  phone: string;
  lastKnownCoordinates?: GeoCoordinates;
  lastCheckInAt?: string;
  safetyStatus: 'SAFE' | 'IN_NEED_OF_ASSISTANCE' | 'CRITICAL_SOS' | 'UNKNOWN';
  batteryPct?: number;
}
