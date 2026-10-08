import * as Linking from 'expo-linking';

export const WEB_PORTAL_BASE = process.env.EXPO_PUBLIC_WEB_URL || 'https://disaster-management-platform-gita.vercel.app';

export const openWebFeature = async (path: string = '/') => {
  const target = path.startsWith('http') ? path : `${WEB_PORTAL_BASE}${path.startsWith('/') ? path : '/' + path}`;
  try {
    await Linking.openURL(target);
  } catch (err) {
    console.error('Failed to open web feature URL:', target, err);
  }
};
