import { PendingSyncDao } from '../database/pending-sync.dao';
import { PendingSyncItem } from '../types/offline';

export const SyncQueue = {
  async enqueue(action: PendingSyncItem['action'], endpoint: string, method: PendingSyncItem['method'], payload: any): Promise<string> {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const item: PendingSyncItem = {
      id,
      action,
      endpoint,
      method,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    await PendingSyncDao.add(item);
    return id;
  },
  async getPending(): Promise<PendingSyncItem[]> {
    return await PendingSyncDao.getAll();
  },
  async dequeue(id: string): Promise<void> {
    await PendingSyncDao.remove(id);
  }
};
