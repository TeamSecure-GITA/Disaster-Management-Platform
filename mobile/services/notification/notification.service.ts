import { LocalNotifications } from '../../notifications/local';

export const NotificationService = {
  async notify(title: string, body: string) {
    await LocalNotifications.scheduleEmergencyAlert(title, body);
  }
};
