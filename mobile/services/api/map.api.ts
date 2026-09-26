import { apiClient } from './client';
import { EvacuationRouteData } from '../../types/map';

export const MapApi = {
  async getEvacuationRoutes(): Promise<EvacuationRouteData[]> {
    return [
      {
        routeId: 'route-shillong-bypass',
        name: 'Arterial Bypass Corridors (High Ground)',
        origin: { latitude: 25.27, longitude: 91.73 },
        destination: { latitude: 25.5788, longitude: 91.8933 },
        waypoints: [
          { latitude: 25.35, longitude: 91.78 },
          { latitude: 25.48, longitude: 91.84 },
        ],
        distanceKm: 42.5,
        estimatedTravelMinutes: 65,
        hazardClearanceRating: 'EXCELLENT',
      }
    ];
  }
};
