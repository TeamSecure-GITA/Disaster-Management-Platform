import { useAuthStore } from '../../stores/auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('defaults to unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('handles successful login state', () => {
    const mockUser = {
      id: 'usr_123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      role: 'citizen' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setSession(mockUser, 'access_token_xyz', 'refresh_token_xyz');
    const updated = useAuthStore.getState();
    expect(updated.isAuthenticated).toBe(true);
    expect(updated.user?.name).toBe('Jane Doe');
    expect(updated.accessToken).toBe('access_token_xyz');
  });
});\n