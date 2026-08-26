import localforage from 'localforage';

// Configure IndexedDB instance for offline storage
localforage.config({
  name: 'DisasterPlatformDB',
  storeName: 'offline_requests'
});

// 1. Offline Hazard & Disaster Reports Management
export const saveOfflineReport = async (reportData) => {
  try {
    const existing = (await localforage.getItem('pending_reports')) || [];
    existing.push({ ...reportData, timestamp: new Date().toISOString() });
    await localforage.setItem('pending_reports', existing);
  } catch (error) {
    console.error("Error saving offline report:", error);
  }
};

export const getOfflineReports = async () => {
  try {
    return (await localforage.getItem('pending_reports')) || [];
  } catch (error) {
    console.error("Error fetching offline reports:", error);
    return [];
  }
};

export const clearOfflineReports = async () => {
  try {
    await localforage.removeItem('pending_reports');
  } catch (error) {
    console.error("Error clearing offline reports:", error);
  }
};

// 2. User Auth Session & Instant Login Caching
export const saveOfflineSession = async (userData) => {
  try {
    await localforage.setItem('user_session', userData);
    await localforage.setItem('user_preferences_21', userData.preferences || {});
  } catch (error) {
    console.error("Error caching offline user session:", error);
  }
};

export const getOfflineSession = async () => {
  try {
    return await localforage.getItem('user_session');
  } catch (error) {
    console.error("Error retrieving offline user session:", error);
    return null;
  }
};

export const clearOfflineSession = async () => {
  try {
    await localforage.removeItem('user_session');
    await localforage.removeItem('user_preferences_21');
  } catch (error) {
    console.error("Error clearing offline session:", error);
  }
};