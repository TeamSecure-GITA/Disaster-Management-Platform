import { useOfflineStore } from '../stores/offline.store';
export function useSync() {
  const store = useOfflineStore();
  return { syncNow: store.syncNow, isSyncing: store.status.isSyncing };
}
