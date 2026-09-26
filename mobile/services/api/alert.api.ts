import { apiClient } from './client';
import { DisasterAlert } from '../../types/alert';

export const AlertApi = {
  async getActiveAlerts(): Promise<DisasterAlert[]> {
    try {
      const res = await apiClient.get('/alerts/active');
      return res.data;
    } catch {
      return [
        {
          id: 'alt-01',
          title: 'RED ALERT: Extreme Precipitation & Debris Flow Risk',
          message: 'Over 280mm rainfall recorded in 24 hours. High risk of debris flow across NH-40 and South Escarpment.',
          hazardType: 'landslide',
          severity: 'CRITICAL',
          affectedRegions: ['East Khasi Hills', 'Ri-Bhoi', 'Cherrapunji'],
          issuedAt: new Date(Date.now() - 1800000).toISOString(),
          expiresAt: new Date(Date.now() + 43200000).toISOString(),
          source: 'State Disaster Management Authority',
          evacuationMandatory: true,
          actionInstructions: [
            'Immediate evacuation of homes situated on slopes steeper than 35 degrees.',
            'Proceed to designated relief centers via Shillong Bypass corridor.',
            'Keep emergency radio tuned to 102.4 FM.'
          ]
        }
      ];
    }
  }
};
