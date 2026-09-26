import { create } from 'zustand';

interface ConnectivityStore {
  isOnline: boolean;
  loraActive: boolean;
  setIsOnline: (v: boolean) => void;
  setLoraActive: (v: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOnline: true,
  loraActive: false,
  setIsOnline: (isOnline) => set({ isOnline }),
  setLoraActive: (loraActive) => set({ loraActive }),
}));
