import { GeoCoordinates } from '../types/location';

export const GeoUtils = {
  formatCoords(c: GeoCoordinates): string {
    return `${c.latitude.toFixed(4)}° N, ${c.longitude.toFixed(4)}° E`;
  },
  isPointInRadius(center: GeoCoordinates, point: GeoCoordinates, radiusKm: number): boolean {
    const R = 6371;
    const dLat = (point.latitude - center.latitude) * (Math.PI / 180);
    const dLon = (point.longitude - center.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(center.latitude * (Math.PI / 180)) *
        Math.cos(point.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
    return d <= radiusKm;
  }
};
