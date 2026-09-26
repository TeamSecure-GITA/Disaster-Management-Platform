import { apiClient } from '../lib/api';
import { LandslidePrediction, ForecastPoint } from '../types/prediction';

export const PredictionService = {
  async getLandslidePredictions(): Promise<LandslidePrediction[]> {
    try {
      return await apiClient<LandslidePrediction[]>('/predictions/landslide', { useMlEngine: true });
    } catch {
      return [
        {
          id: 'pred-ls-01',
          location: {
            region: 'Cherrapunji South Escarpment',
            coordinates: { lat: 25.27, lng: 91.73 },
          },
          probability: 0.87,
          factorOfSafety: 0.94,
          timeToEventHours: 6.5,
          hazardType: 'landslide',
          riskLevel: 'CRITICAL',
          rainfallPast24hMm: 298,
          soilSaturationPct: 94.2,
          topFeatures: [
            { featureName: 'Pore-Water Pressure', importance: 0.38, category: 'pore_pressure', description: 'Deep bedrock piezometer anomaly' },
            { featureName: '72hr Antecedent Rainfall', importance: 0.31, category: 'rainfall_intensity', description: 'Monsoon saturation limit breached' },
            { featureName: 'Slope Gradient (>48°)', importance: 0.19, category: 'slope_angle', description: 'Steep overburden soil layer' },
          ],
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 43200000).toISOString(),
        },
        {
          id: 'pred-ls-02',
          location: {
            region: 'Guwahati - Shillong Road (NH-40)',
            coordinates: { lat: 25.75, lng: 91.89 },
          },
          probability: 0.62,
          factorOfSafety: 1.15,
          timeToEventHours: 18.0,
          hazardType: 'landslide',
          riskLevel: 'MODERATE',
          rainfallPast24hMm: 142,
          soilSaturationPct: 76.5,
          topFeatures: [
            { featureName: 'Road Cut Vibrations', importance: 0.28, category: 'seismic_shaking', description: 'Heavy freight transit resonance' },
            { featureName: 'Surface Runoff Velocity', importance: 0.25, category: 'rainfall_intensity', description: 'Culvert drainage overflow' },
          ],
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 86400000).toISOString(),
        },
      ];
    }
  },

  async getRiskForecastTimeline(zoneId: string): Promise<ForecastPoint[]> {
    try {
      return await apiClient<ForecastPoint[]>(`/predictions/forecast?zoneId=${zoneId}`, { useMlEngine: true });
    } catch {
      const points: ForecastPoint[] = [];
      const now = Date.now();
      for (let i = 0; i < 24; i += 2) {
        const time = new Date(now + i * 3600 * 1000).toISOString();
        const prob = Math.min(0.95, 0.4 + (i / 24) * 0.45 + (Math.random() - 0.5) * 0.1);
        points.push({
          timestamp: time,
          predictedProbability: parseFloat(prob.toFixed(2)),
          lowerConfidenceBound: parseFloat((prob * 0.85).toFixed(2)),
          upperConfidenceBound: parseFloat(Math.min(1.0, prob * 1.15).toFixed(2)),
          triggerThreshold: 0.75,
          rainfallForecastMm: Math.round(15 + (i * 3) + Math.random() * 8),
        });
      }
      return points;
    }
  },
};
