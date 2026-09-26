import { create } from 'zustand';
import { EmergencyShelter } from '../types/shelter';
import { ShelterApi } from '../services/api/shelter.api';

interface ShelterStore {
  shelters: EmergencyShelter[];
  isLoading: boolean;
  fetchShelters: () => Promise<void>;
}

export const useShelterStore = create<ShelterStore>((set) => ({
  shelters: [],
  isLoading: false,
  fetchShelters: async () => {
    set({ isLoading: true });
    const shelters = await ShelterApi.getShelters();
    set({ shelters, isLoading: false });
  }
}));
