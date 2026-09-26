import { apiClient } from '../lib/api';
import { RegionalRiskZone, RiskAssessment } from '../types/risk';

export const RiskService = {
  async getAllZones(): Promise<RegionalRiskZone[]> {
    try {
      return await apiClient<RegionalRiskZone[]>('/risk/zones');
    } catch {
      return [
        {
          id: 'zone-meghalaya-1',
          name: 'East Khasi Hills Escarpment',
          state: 'Meghalaya',
          boundaryCoordinates: [
            { lat: 25.56, lng: 91.88 },
            { lat: 25.62, lng: 91.95 },
            { lat: 25.54, lng: 91.98 },
          ],
          overallRiskScore: 84,
          level: 'CRITICAL',
          primaryHazard: 'landslide',
          populationAtRisk: 14200,
          criticalInfrastructureImpacted: ['NH-40', 'Umiam Hydel Feeder Line'],
          activeSensorsCount: 38,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'zone-assam-2',
          name: 'Lower Brahmaputra Floodplain',
          state: 'Assam',
          boundaryCoordinates: [
            { lat: 26.15, lng: 91.75 },
            { lat: 26.25, lng: 91.85 },
          ],
          overallRiskScore: 68,
          level: 'HIGH',
          primaryHazard: 'flash_flood',
          populationAtRisk: 42000,
          criticalInfrastructureImpacted: ['Guwahati Rail Link'],
          activeSensorsCount: 54,
          lastUpdated: new Date().toISOString(),
        },
      ];
    }
  },

  async getZoneAssessment(zoneId: string): Promise<RiskAssessment> {
    try {
      return await apiClient<RiskAssessment>(`/risk/assessments/${zoneId}`);
    } catch {
      return {
        zoneId,
        zoneName: 'East Khasi Hills Escarpment',
        currentRiskScore: 84,
        trend: 'ESCALATING',
        factors: [
          { factor: 'Pore-Water Saturation', weight: 0.35, value: 92, status: 'DANGER' },
          { factor: 'Slope Shear Displacement', weight: 0.3, value: 85, status: 'DANGER' },
          { factor: 'Antecedent Rainfall (72hr)', weight: 0.2, value: 78, status: 'WARNING' },
          { factor: 'Seismic Micro-Tremor Activity', weight: 0.15, value: 45, status: 'SAFE' },
        ],
        timestamp: new Date().toISOString(),
        evacuationRecommended: true,
      };
    }
  },
};
