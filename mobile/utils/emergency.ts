import { Linking } from 'react-native';

export const EmergencyUtils = {
  callNumber(phone: string) {
    Linking.openURL(`tel:${phone.replace(/[\s-]/g, '')}`);
  },
  smsLocation(phone: string, lat: number, lng: number) {
    const msg = encodeURIComponent(`EMERGENCY: I need urgent help! My coordinates: https://maps.google.com/?q=${lat},${lng}`);
    Linking.openURL(`sms:${phone}?body=${msg}`);
  }
};
