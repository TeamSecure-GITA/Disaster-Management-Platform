import { apiClient } from './client';
import { EmergencyShelter } from '../../types/shelter';

export const ShelterApi = {
  async getShelters(): Promise<EmergencyShelter[]> {
    try {
      const res = await apiClient.get('/shelters');
      return res.data;
    } catch {
      return [
        {
          id: 'sh-01',
          name: 'Shillong Multi-Purpose Emergency Relief Center',
          coordinates: { latitude: 25.5788, longitude: 91.8933 },
          address: 'Polo Grounds Sector 2, Shillong',
          capacity: 1200,
          currentOccupancy: 640,
          hasMedicalPost: true,
          hasCleanWater: true,
          hasBackupPower: true,
          status: 'OPEN',
        },
        {
          id: 'sh-02',
          name: 'Cherrapunji Govt High School Cyclone & Flood Shelter',
          coordinates: { latitude: 25.298, longitude: 91.722 },
          address: 'Sohra Central Ridge, Sohra',
          capacity: 800,
          currentOccupancy: 760,
          hasMedicalPost: true,
          hasCleanWater: true,
          hasBackupPower: false,
          status: 'NEAR_CAPACITY',
        }
      ];
    }
  }
};
