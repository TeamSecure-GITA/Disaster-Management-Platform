export interface PendingSyncItem {
  id: string;
  action: 'CREATE_INCIDENT' | 'TRIGGER_SOS' | 'CHECKIN_SAFETY' | 'UPDATE_PROFILE';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  createdAt: string;
  retryCount: number;
  lastAttemptAt?: string;
  error?: string;
}

export interface SyncStatusSummary {
  pendingCount: number;
  lastSyncAt: string | null;
  isSyncing: boolean;
  hasErrors: boolean;
}
