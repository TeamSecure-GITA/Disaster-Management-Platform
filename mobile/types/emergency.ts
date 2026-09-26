import { GeoCoordinates } from './location';

export type SOSStatusType = 'idle' | 'countdown' | 'broadcasting' | 'acknowledged' | 'dispatched' | 'cancelled';

export interface SOSPayload {
  sosId: string;
  userId: string;
  coordinates: GeoCoordinates;
  timestamp: string;
  batteryLevelPct?: number;
  medicalProfileSummary?: string;
  emergencyType?: string;
  dispatchedResponders?: string[];
  loraMeshRelayed?: boolean;
}

export interface EmergencyServiceItem {
  id: string;
  name: string;
  number: string;
  type: 'police' | 'medical' | 'fire' | 'disaster' | 'helpline';
  available24x7: boolean;
}
