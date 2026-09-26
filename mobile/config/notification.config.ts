export const NOTIFICATION_CONFIG = {
  CHANNELS: {
    EMERGENCY: {
      id: 'emergency-sos-channel',
      name: 'Life-Threatening Emergency Alerts',
      importance: 5, // High / Max
      vibrate: [0, 500, 200, 500],
      sound: 'alert_sound',
    },
    HAZARDS: {
      id: 'hazard-watch-channel',
      name: 'Hazard & Weather Warnings',
      importance: 4,
      vibrate: [0, 250, 250, 250],
    },
    GENERAL: {
      id: 'general-channel',
      name: 'General Updates & Check-ins',
      importance: 3,
    },
  },
};
