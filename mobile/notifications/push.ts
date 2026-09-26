import * as Notifications from 'expo-notifications';

export const PushNotifications = {
  async getExpoPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch {
      return null;
    }
  }
};
