import { GeoCoordinates, GeofenceZone } from '../../types/location';
import { GeoUtils } from '../../utils/geo';

export const GeofenceService = {
  checkRiskZoneEntry(userPos: GeoCoordinates, zones: GeofenceZone[]): GeofenceZone | null {
    for (const z of zones) {
      if (GeoUtils.isPointInRadius(z.center, userPos, z.radiusMeters / 1000)) {
        return z;
      }
    }
    return null;
  }
};
