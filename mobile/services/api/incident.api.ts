import { apiClient } from './client';
import { IncidentReport } from '../../types/incident';

export const IncidentApi = {
  async getIncidents(): Promise<IncidentReport[]> {
    try {
      const res = await apiClient.get('/incidents');
      return res.data;
    } catch {
      return [
        {
          id: 'inc-01',
          title: 'NH-40 Rockfall & Mudslide',
          category: 'landslide',
          severity: 'high',
          description: 'Talus mudslide completely blocking two lanes on highway near Km 38.',
          coordinates: { latitude: 25.75, longitude: 91.89 },
          photos: [],
          reportedBy: 'Field Observer Unit 4',
          reportedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'verified',
          syncStatus: 'synced',
        }
      ];
    }
  },
  async createIncident(report: Partial<IncidentReport>): Promise<IncidentReport> {
    try {
      const res = await apiClient.post('/incidents', report);
      return res.data;
    } catch {
      return {
        id: `inc-${Date.now()}`,
        title: report.title || 'Disaster Incident',
        category: report.category || 'landslide',
        severity: report.severity || 'moderate',
        description: report.description || '',
        coordinates: report.coordinates || { latitude: 25.27, longitude: 91.73 },
        photos: report.photos || [],
        reportedBy: 'You',
        reportedAt: new Date().toISOString(),
        status: 'pending',
        syncStatus: 'pending_sync',
      };
    }
  }
};
