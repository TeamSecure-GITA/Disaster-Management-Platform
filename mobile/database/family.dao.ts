import { getDatabase } from './index';
import { FamilyCircleMember } from '../types/family';

export const FamilyDao = {
  async insertOrUpdate(m: FamilyCircleMember): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO family_members (id, full_name, relation, phone, safety_status, last_known_lat, last_known_lng, last_check_in)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.fullName, m.relation, m.phone, m.safetyStatus, m.lastKnownCoordinates?.latitude || null, m.lastKnownCoordinates?.longitude || null, m.lastCheckInAt || null]
    );
  },
  async getAll(): Promise<FamilyCircleMember[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM family_members');
    return rows.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      relation: r.relation,
      phone: r.phone,
      safetyStatus: r.safety_status,
      lastKnownCoordinates: r.last_known_lat ? { latitude: r.last_known_lat, longitude: r.last_known_lng } : undefined,
      lastCheckInAt: r.last_check_in,
    }));
  }
};
