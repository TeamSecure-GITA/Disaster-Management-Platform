/**
 * Map configurations, tile servers, and layer helpers
 */
import { GeoCoordinate } from '../types/prediction';

export const MAP_DEFAULTS = {
  center: {
    lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || 25.5788,
    lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG) || 91.8933, // Shillong, Meghalaya (NER India)
  },
  zoom: Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 9,
  tileLayer: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
  },
  satelliteTileLayer: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

export function getRiskColorHex(riskLevel: string): string {
  switch (riskLevel?.toUpperCase()) {
    case 'CRITICAL':
    case 'EXTREME':
      return '#ef4444';
    case 'HIGH':
      return '#f97316';
    case 'MODERATE':
      return '#f59e0b';
    case 'LOW':
    case 'VERY_LOW':
      return '#10b981';
    default:
      return '#0284c7';
  }
}

export function createGeoJSONPolygon(coords: GeoCoordinate[]): any {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords.map((c) => [c.lng, c.lat])],
    },
  };
}
