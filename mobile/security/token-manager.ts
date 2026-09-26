import { SecureStorage } from './secure-storage';
import { AuthTokens } from '../types/auth';

const TOKEN_KEY = 'sentinel_auth_tokens';

export const TokenManager = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },
  async getTokens(): Promise<AuthTokens | null> {
    const raw = await SecureStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  async clearTokens(): Promise<void> {
    await SecureStorage.removeItem(TOKEN_KEY);
  }
};
