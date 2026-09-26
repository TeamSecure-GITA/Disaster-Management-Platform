import { GeoCoordinates } from './location';

export interface MapMarkerItem {
  id: string;
  type: 'hazard' | 'shelter' | 'incident' | 'user' | 'family';
  coordinate: GeoCoordinates;
  title: string;
  subtitle?: string;
  severity?: string;
}

export interface EvacuationRouteData {
  routeId: string;
  name: string;
  origin: GeoCoordinates;
  destination: GeoCoordinates;
  waypoints: GeoCoordinates[];
  distanceKm: number;
  estimatedTravelMinutes: number;
  hazardClearanceRating: 'EXCELLENT' | 'CAUTION' | 'RESTRICTED';
}
