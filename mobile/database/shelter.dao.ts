import { getDatabase } from './index';
import { EmergencyShelter } from '../types/shelter';

export const ShelterDao = {
  async insertOrUpdate(s: EmergencyShelter): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO shelters (id, name, latitude, longitude, address, capacity, current_occupancy, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.coordinates.latitude, s.coordinates.longitude, s.address, s.capacity, s.currentOccupancy, s.status]
    );
  },
  async getAll(): Promise<EmergencyShelter[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM shelters');
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      coordinates: { latitude: r.latitude, longitude: r.longitude },
      address: r.address,
      capacity: r.capacity,
      currentOccupancy: r.current_occupancy,
      hasMedicalPost: true,
      hasCleanWater: true,
      hasBackupPower: true,
      status: r.status,
    }));
  }
};
