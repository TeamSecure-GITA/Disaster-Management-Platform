import { create } from 'zustand';
import { LandslidePredictionData } from '../types/risk';
import { RiskApi } from '../services/api/risk.api';

interface RiskStore {
  predictions: LandslidePredictionData[];
  isLoading: boolean;
  fetchPredictions: () => Promise<void>;
}

export const useRiskStore = create<RiskStore>((set) => ({
  predictions: [],
  isLoading: false,
  fetchPredictions: async () => {
    set({ isLoading: true });
    const predictions = await RiskApi.getLandslidePredictions();
    set({ predictions, isLoading: false });
  }
}));
