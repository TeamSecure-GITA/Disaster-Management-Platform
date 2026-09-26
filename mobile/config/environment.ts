export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api',
  ML_API_URL: process.env.EXPO_PUBLIC_ML_API_URL || 'http://10.0.2.2:8000',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://10.0.2.2:5000',
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  IS_DEV: process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production',
};
