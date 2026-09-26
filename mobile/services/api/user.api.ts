import { apiClient } from './client';
import { UserProfile } from '../../types/user';

export const UserApi = {
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await apiClient.patch('/users/me', profile);
      return res.data;
    } catch {
      return profile as UserProfile;
    }
  }
};
