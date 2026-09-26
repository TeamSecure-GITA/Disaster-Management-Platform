import { Connectivity } from '../../offline/connectivity';
import { SyncEngine } from '../../offline/sync-engine';

export const OfflineService = {
  async syncNow() {
    return await SyncEngine.runSync();
  },
  async isOnline() {
    return await Connectivity.isOnline();
  }
};
