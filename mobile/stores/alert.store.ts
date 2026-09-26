import { create } from 'zustand';
import { DisasterAlert } from '../types/alert';
import { AlertApi } from '../services/api/alert.api';

interface AlertStore {
  alerts: DisasterAlert[];
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  isLoading: false,
  fetchAlerts: async () => {
    set({ isLoading: true });
    const alerts = await AlertApi.getActiveAlerts();
    set({ alerts, isLoading: false });
  }
}));
