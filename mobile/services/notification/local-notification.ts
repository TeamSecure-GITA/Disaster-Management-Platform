import * as Notifications from 'expo-notifications';

export const LocalNotificationService = {
  async trigger(title: string, message: string) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body: message, sound: true },
      trigger: null,
    });
  }
};
