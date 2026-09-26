import * as Notifications from 'expo-notifications';

export const PushNotificationService = {
  async register() {
    return await Notifications.getExpoPushTokenAsync().catch(() => null);
  }
};
