export const API_CONFIG = {
  TIMEOUT_MS: 12000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1500,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
    },
    EMERGENCY: {
      SOS: '/sos/trigger',
      SOS_CANCEL: '/sos/cancel',
      STATUS: '/sos/status',
      CONTACTS: '/emergency/contacts',
    },
    PREDICTIONS: {
      LANDSLIDE: '/predictions/landslide',
      FORECAST: '/predictions/forecast',
      GENERIC: '/predict',
    },
    AI: {
      CHAT: '/chat',
      ANALYZE_IMAGE: '/api/v1/ai/multimodal/analyze-image',
    },
    SHELTERS: {
      LIST: '/shelters',
      NEARBY: '/shelters/nearby',
    },
    INCIDENTS: {
      LIST: '/incidents',
      CREATE: '/incidents',
      MY: '/incidents/my',
    },
    ALERTS: {
      ACTIVE: '/alerts/active',
      BROADCAST: '/alerts/broadcast',
    },
  },
};
