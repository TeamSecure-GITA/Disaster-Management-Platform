import * as Location from 'expo-location';

export const LocationPermissionService = {
  async ensureLocationAccess(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }
};
