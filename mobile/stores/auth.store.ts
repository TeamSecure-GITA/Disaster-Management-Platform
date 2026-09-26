import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { AuthApi } from '../services/api/auth.api';
import { TokenManager } from '../security/token-manager';

interface AuthStore extends AuthState {
  login: (phoneOrEmail: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: null,
  error: null,

  login: async (phoneOrEmail, pass) => {
    set({ isLoading: true, error: null });
    try {
      const { tokens, user } = await AuthApi.login(phoneOrEmail, pass);
      await TokenManager.saveTokens(tokens);
      set({ isAuthenticated: true, tokens, user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
    }
  },

  logout: async () => {
    await TokenManager.clearTokens();
    set({ isAuthenticated: false, tokens: null, user: null });
  },

  checkAuth: async () => {
    const tokens = await TokenManager.getTokens();
    if (tokens?.accessToken) {
      const user = await AuthApi.getCurrentUser();
      set({ isAuthenticated: true, tokens, user, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }
  }
}));
