import { GeoCoordinates } from '../../types/location';
import { OfflineStorage } from '../../offline/storage';

const LAST_POS_KEY = 'sentinel_last_position';

export const LocationCache = {
  async save(pos: GeoCoordinates): Promise<void> {
    await OfflineStorage.set(LAST_POS_KEY, pos);
  },
  async get(): Promise<GeoCoordinates | null> {
    return await OfflineStorage.get<GeoCoordinates>(LAST_POS_KEY);
  }
};
