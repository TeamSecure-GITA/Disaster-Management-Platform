import { create } from 'zustand';
import { UserProfile } from '../types/user';

interface UserStore {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
