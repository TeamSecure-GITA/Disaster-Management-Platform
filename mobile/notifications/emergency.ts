import { LocalNotifications } from './local';

export const EmergencyAlertBroadcast = {
  async triggerLifeThreatAlert(disasterType: string, action: string) {
    await LocalNotifications.scheduleEmergencyAlert(
      `🚨 CRITICAL ALERT: ${disasterType.toUpperCase()}`,
      action
    );
  }
};
