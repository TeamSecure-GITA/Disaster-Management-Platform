import { GeoCoordinates } from './location';

export interface EmergencyShelter {
  id: string;
  name: string;
  coordinates: GeoCoordinates;
  address: string;
  capacity: number;
  currentOccupancy: number;
  hasMedicalPost: boolean;
  hasCleanWater: boolean;
  hasBackupPower: boolean;
  distanceKm?: number;
  contactNumber?: string;
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL' | 'EVACUATED';
}
