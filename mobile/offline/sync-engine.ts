import { SyncQueue } from './queue';
import { Connectivity } from './connectivity';
import axios from 'axios';
import { ENV } from '../config/environment';

export const SyncEngine = {
  isSyncing: false,

  async runSync(): Promise<number> {
    if (this.isSyncing) return 0;
    const online = await Connectivity.isOnline();
    if (!online) return 0;

    this.isSyncing = true;
    let synced = 0;
    try {
      const pending = await SyncQueue.getPending();
      for (const item of pending) {
        try {
          const url = `${ENV.API_URL}${item.endpoint.startsWith('/') ? item.endpoint : '/' + item.endpoint}`;
          await axios({
            url,
            method: item.method,
            data: item.payload,
            timeout: 8000,
          });
          await SyncQueue.dequeue(item.id);
          synced++;
        } catch (err) {
          // Keep in queue for next sync cycle
        }
      }
    } finally {
      this.isSyncing = false;
    }
    return synced;
  }
};
