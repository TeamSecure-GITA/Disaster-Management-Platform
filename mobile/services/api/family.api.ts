import { FamilyCircleMember } from '../../types/family';

export const FamilyApi = {
  async getFamilyCircle(): Promise<FamilyCircleMember[]> {
    return [
      {
        id: 'fam-1',
        fullName: 'Priya Sharma',
        relation: 'Spouse',
        phone: '+919876543211',
        safetyStatus: 'SAFE',
        lastKnownCoordinates: { latitude: 25.5788, longitude: 91.8933 },
        lastCheckInAt: new Date(Date.now() - 900000).toISOString(),
        batteryPct: 82,
      },
      {
        id: 'fam-2',
        fullName: 'Aarav Sharma',
        relation: 'Child',
        phone: '+919876543212',
        safetyStatus: 'SAFE',
        lastKnownCoordinates: { latitude: 25.5788, longitude: 91.8933 },
        lastCheckInAt: new Date(Date.now() - 900000).toISOString(),
        batteryPct: 74,
      }
    ];
  }
};
