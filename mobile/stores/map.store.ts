import { create } from 'zustand';
import { GeoCoordinates } from '../types/location';

interface MapStore {
  selectedLocation: GeoCoordinates | null;
  filterHazard: string | null;
  setSelectedLocation: (c: GeoCoordinates | null) => void;
  setFilterHazard: (h: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedLocation: null,
  filterHazard: null,
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setFilterHazard: (filterHazard) => set({ filterHazard }),
}));
