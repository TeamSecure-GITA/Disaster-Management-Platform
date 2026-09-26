import { getDatabase } from './index';

export const CacheDao = {
  async set(key: string, value: any, ttlSec: number = 3600): Promise<void> {
    const db = await getDatabase();
    const expiresAt = Date.now() + ttlSec * 1000;
    await db.runAsync(
      `INSERT OR REPLACE INTO app_cache (cache_key, value, expires_at) VALUES (?, ?, ?)`,
      [key, JSON.stringify(value), expiresAt]
    );
  },
  async get(key: string): Promise<any | null> {
    const db = await getDatabase();
    const row: any = await db.getFirstAsync('SELECT * FROM app_cache WHERE cache_key = ?', [key]);
    if (!row) return null;
    if (row.expires_at < Date.now()) {
      await db.runAsync('DELETE FROM app_cache WHERE cache_key = ?', [key]);
      return null;
    }
    try {
      return JSON.parse(row.value);
    } catch {
      return null;
    }
  }
};
