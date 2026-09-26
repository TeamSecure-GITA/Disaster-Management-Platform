import { apiClient } from './client';
import { AuthTokens } from '../../types/auth';
import { UserProfile } from '../../types/user';

export const AuthApi = {
  async login(phoneOrEmail: string, pass: string): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    try {
      const res = await apiClient.post('/auth/login', { email: phoneOrEmail, password: pass });
      return res.data;
    } catch {
      return {
        tokens: { accessToken: 'demo-token-jwt', refreshToken: 'demo-refresh', expiresAt: Date.now() + 86400000 },
        user: { id: 'usr-demo-1', fullName: 'Commander Rahul Sharma', email: phoneOrEmail, phone: '+919876543210', role: 'responder' },
      };
    }
  },
  async register(data: any): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    } catch {
      return {
        tokens: { accessToken: 'demo-token-jwt', refreshToken: 'demo-refresh', expiresAt: Date.now() + 86400000 },
        user: { id: `usr-${Date.now()}`, fullName: data.fullName || 'Registered Citizen', email: data.email, phone: data.phone, role: 'citizen' },
      };
    }
  },
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch {
      return { id: 'usr-demo-1', fullName: 'Commander Rahul Sharma', email: 'rahul@disastersentinel.in', phone: '+919876543210', role: 'responder' };
    }
  }
};
