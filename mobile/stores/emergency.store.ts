import { create } from 'zustand';
import { SOSStatusType, SOSPayload } from '../types/emergency';
import { SOSService } from '../services/emergency/sos.service';

interface EmergencyStore {
  sosStatus: SOSStatusType;
  countdownSeconds: number;
  activePayload: SOSPayload | null;
  startCountdown: () => void;
  decrementCountdown: () => void;
  cancelSOS: () => void;
  triggerSOS: (payload: SOSPayload) => Promise<void>;
}

export const useEmergencyStore = create<EmergencyStore>((set, get) => ({
  sosStatus: 'idle',
  countdownSeconds: 3,
  activePayload: null,

  startCountdown: () => set({ sosStatus: 'countdown', countdownSeconds: 3 }),
  decrementCountdown: () => {
    const current = get().countdownSeconds;
    if (current > 1) {
      set({ countdownSeconds: current - 1 });
    }
  },
  cancelSOS: () => set({ sosStatus: 'cancelled', countdownSeconds: 3, activePayload: null }),
  triggerSOS: async (payload) => {
    set({ sosStatus: 'broadcasting', activePayload: payload });
    await SOSService.broadcastSOS(payload);
    set({ sosStatus: 'acknowledged' });
  }
}));
