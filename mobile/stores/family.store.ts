import { create } from 'zustand';
import { FamilyCircleMember } from '../types/family';
import { FamilyApi } from '../services/api/family.api';

interface FamilyStore {
  members: FamilyCircleMember[];
  fetchMembers: () => Promise<void>;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  members: [],
  fetchMembers: async () => {
    const members = await FamilyApi.getFamilyCircle();
    set({ members });
  }
}));
