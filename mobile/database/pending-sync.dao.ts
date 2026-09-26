import { getDatabase } from './index';
import { PendingSyncItem } from '../types/offline';

export const PendingSyncDao = {
  async add(item: PendingSyncItem): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO pending_sync (id, action, endpoint, method, payload, created_at, retry_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.action, item.endpoint, item.method, JSON.stringify(item.payload), item.createdAt, item.retryCount]
    );
  },
  async getAll(): Promise<PendingSyncItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM pending_sync ORDER BY created_at ASC');
    return rows.map((r: any) => ({
      id: r.id,
      action: r.action,
      endpoint: r.endpoint,
      method: r.method,
      payload: JSON.parse(r.payload),
      createdAt: r.created_at,
      retryCount: r.retry_count,
    }));
  },
  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pending_sync WHERE id = ?', [id]);
  }
};
