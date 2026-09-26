import * as Notifications from 'expo-notifications';

export const LocalNotifications = {
  async scheduleEmergencyAlert(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Send immediately
    });
  }
};
