import { mlApiClient } from './client';
import { LandslidePredictionData, ForecastPointItem } from '../../types/risk';

export const RiskApi = {
  async getLandslidePredictions(): Promise<LandslidePredictionData[]> {
    try {
      const res = await mlApiClient.get('/predictions/landslide');
      return res.data;
    } catch {
      return [
        {
          id: 'pred-cherrapunji',
          location: { region: 'Cherrapunji South Escarpment', coordinates: { latitude: 25.27, longitude: 91.73 } },
          probability: 0.88,
          factorOfSafety: 0.92,
          timeToEventHours: 6.5,
          hazardType: 'landslide',
          riskLevel: 'CRITICAL',
          rainfallPast24hMm: 298.0,
          soilSaturationPct: 94.2,
          topFeatures: [
            { featureName: 'Pore-Water Pressure', importance: 0.38, category: 'pore_pressure', description: 'Bedrock piezometer threshold breached' }
          ],
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 86400000).toISOString(),
        }
      ];
    }
  },
  async getForecastTimeline(zoneId?: string): Promise<ForecastPointItem[]> {
    try {
      const res = await mlApiClient.get(`/predictions/forecast?zoneId=${zoneId || 'default'}`);
      return res.data;
    } catch {
      return [];
    }
  }
};
