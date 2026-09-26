import { getDatabase } from './index';
import { DisasterAlert } from '../types/alert';

export const AlertDao = {
  async insertOrUpdate(alert: DisasterAlert): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO alerts (id, title, message, hazard_type, severity, issued_at, expires_at, evacuation_mandatory)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [alert.id, alert.title, alert.message, alert.hazardType, alert.severity, alert.issuedAt, alert.expiresAt, alert.evacuationMandatory ? 1 : 0]
    );
  },
  async getActive(): Promise<DisasterAlert[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM alerts ORDER BY issued_at DESC');
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      hazardType: r.hazard_type,
      severity: r.severity,
      affectedRegions: [],
      issuedAt: r.issued_at,
      expiresAt: r.expires_at,
      source: 'Official SDMA / NDRF',
      evacuationMandatory: Boolean(r.evacuation_mandatory),
      actionInstructions: [],
    }));
  }
};
