import { GeoCoordinates } from '../../types/location';
import { EvacuationRouteData } from '../../types/map';

export const RoutingService = {
  calculateSafeCorridor(origin: GeoCoordinates, destination: GeoCoordinates): EvacuationRouteData {
    return {
      routeId: 'safe-route-1',
      name: 'Safe Evacuation Highway (Elevated)',
      origin,
      destination,
      waypoints: [],
      distanceKm: 12.4,
      estimatedTravelMinutes: 22,
      hazardClearanceRating: 'EXCELLENT',
    };
  }
};
