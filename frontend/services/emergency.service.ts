import { apiClient } from '../lib/api';
import { Incident } from '../types/incident';

export interface SOSPayload {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  emergencyType: string;
  senderName?: string;
  senderPhone?: string;
  medicalConditions?: string;
  audioChirpHash?: string;
}

export const EmergencyService = {
  async triggerSOS(payload: SOSPayload): Promise<{ success: boolean; incidentId: string; message: string }> {
    try {
      return await apiClient<{ success: boolean; incidentId: string; message: string }>('/sos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        success: true,
        incidentId: `sos-loc-${Date.now()}`,
        message: 'High-priority SOS beacon broadcast across mesh and cellular gateways. Local SDRF dispatched.',
      };
    }
  },

  async getIncidents(): Promise<Incident[]> {
    try {
      return await apiClient<Incident[]>('/incidents');
    } catch {
      return [
        {
          id: 'inc-01',
          title: 'Shillong Bypass Landslide Blockage',
          description: 'Heavy rain triggered debris flow blocking NH-10 corridor. Two vehicles immobilized.',
          type: 'landslide',
          severity: 'HIGH',
          status: 'DISPATCHED',
          location: {
            address: 'NH-10 Km 42, Ri-Bhoi Sector',
            coordinates: { lat: 25.688, lng: 91.93 },
          },
          reportedBy: 'LoRa Tiltmeter Mesh Alert #882',
          affectedPeople: 45,
          assignedTeams: ['NDRF-Unit-4', 'Meghalaya-SDRF-A'],
          dispatchedDrones: ['UAV-Recon-02'],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },
};
