import * as Location from 'expo-location';
import { GeoCoordinates } from '../../types/location';

export const LocationService = {
  async getCurrentPosition(): Promise<GeoCoordinates> {
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitude: pos.coords.altitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      };
    } catch {
      // Fallback default coordinates (Cherrapunji / Shillong corridor)
      return { latitude: 25.27, longitude: 91.73, altitude: 1430, timestamp: Date.now() };
    }
  }
};
