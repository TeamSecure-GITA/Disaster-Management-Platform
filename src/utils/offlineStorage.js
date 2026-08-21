import localforage from 'localforage';

// Configure local IndexedDB store for offline hazard reports
localforage.config({ name: 'DisasterPlatformDB', storeName: 'offline_requests' });

export const saveOfflineReport = async (reportData) => {
  const existing = (await localforage.getItem('pending_reports')) || [];
  existing.push({ ...reportData, timestamp: new Date().toISOString() });
  await localforage.setItem('pending_reports', existing);
};

export const getOfflineReports = async () => (await localforage.getItem('pending_reports')) || [];
export const clearOfflineReports = async () => await localforage.removeItem('pending_reports');