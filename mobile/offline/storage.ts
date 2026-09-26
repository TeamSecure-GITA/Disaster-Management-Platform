import AsyncStorage from '@react-native-async-storage/async-storage';

export const OfflineStorage = {
  async set(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
};
