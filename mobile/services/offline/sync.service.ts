import { SyncEngine } from '../../offline/sync-engine';

export const SyncService = {
  startPeriodicSync(intervalMs: number = 30000) {
    setInterval(() => {
      SyncEngine.runSync();
    }, intervalMs);
  }
};
