import { getDatabase } from './index';

export const RiskDao = {
  async saveZoneRisk(zoneId: string, prob: number, level: string, fos: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO risk_cache (zone_id, probability, risk_level, factor_of_safety, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [zoneId, prob, level, fos, new Date().toISOString()]
    );
  }
};
