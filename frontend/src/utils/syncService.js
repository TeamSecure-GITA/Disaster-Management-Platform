import { getOfflineReports, clearOfflineReports } from './offlineStorage';

export const setupAutoSync = () => {
  window.addEventListener('online', async () => {
    const pendingReports = await getOfflineReports();
    if (pendingReports.length > 0) {
      console.log('Internet reconnected. Pending items ready to sync:', pendingReports);
      // Automatically clear local pending items once processed
      await clearOfflineReports();
    }
  });
};