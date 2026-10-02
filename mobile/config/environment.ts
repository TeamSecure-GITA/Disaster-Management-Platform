const isProduction =
  process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ||
  process.env.NODE_ENV === 'production';

// Production deployed URL on Render vs local emulator fallback (10.0.2.2)
const DEFAULT_API_URL = isProduction
  ? 'https://disaster-management-platform-backend.onrender.com/api'
  : 'http://10.0.2.2:5000/api';

const DEFAULT_ML_API_URL = isProduction
  ? 'https://disaster-management-platform-ml.onrender.com'
  : 'http://10.0.2.2:8000';

const DEFAULT_WS_URL = isProduction
  ? 'wss://disaster-management-platform-backend.onrender.com'
  : 'ws://10.0.2.2:5000';

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  ML_API_URL: process.env.EXPO_PUBLIC_ML_API_URL || DEFAULT_ML_API_URL,
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || DEFAULT_WS_URL,
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  IS_DEV: !isProduction,
};

