import { GeoCoordinates } from '../types/location';

export function calculateHaversineDistanceKm(c1: GeoCoordinates, c2: GeoCoordinates): number {
  const R = 6371; // Earth radius km
  const dLat = (c2.latitude - c1.latitude) * (Math.PI / 180);
  const dLon = (c2.longitude - c1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1.latitude * (Math.PI / 180)) *
      Math.cos(c2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
