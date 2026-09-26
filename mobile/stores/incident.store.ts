import { create } from 'zustand';
import { IncidentReport } from '../types/incident';
import { IncidentApi } from '../services/api/incident.api';
import { IncidentReportService } from '../services/emergency/incident-report.service';

interface IncidentStore {
  incidents: IncidentReport[];
  isLoading: boolean;
  fetchIncidents: () => Promise<void>;
  reportIncident: (report: IncidentReport) => Promise<void>;
}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  incidents: [],
  isLoading: false,
  fetchIncidents: async () => {
    set({ isLoading: true });
    const incidents = await IncidentApi.getIncidents();
    set({ incidents, isLoading: false });
  },
  reportIncident: async (report) => {
    await IncidentReportService.submitReport(report);
    set({ incidents: [report, ...get().incidents] });
  }
}));
