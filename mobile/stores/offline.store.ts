import { create } from 'zustand';
import { SyncStatusSummary } from '../types/offline';
import { SyncEngine } from '../offline/sync-engine';
import { SyncQueue } from '../offline/queue';

interface OfflineStore {
  status: SyncStatusSummary;
  refreshStatus: () => Promise<void>;
  syncNow: () => Promise<void>;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  status: { pendingCount: 0, lastSyncAt: null, isSyncing: false, hasErrors: false },
  refreshStatus: async () => {
    const pending = await SyncQueue.getPending();
    set((state) => ({
      status: { ...state.status, pendingCount: pending.length }
    }));
  },
  syncNow: async () => {
    set((state) => ({ status: { ...state.status, isSyncing: true } }));
    await SyncEngine.runSync();
    const pending = await SyncQueue.getPending();
    set({ status: { pendingCount: pending.length, lastSyncAt: new Date().toISOString(), isSyncing: false, hasErrors: false } });
  }
}));
