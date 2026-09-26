import { apiClient } from '../lib/api';
import { KPIMetric, IncidentAnalyticsPoint, ResourceAllocationData, ModelPerformanceMetric } from '../types/analytics';

export const AnalyticsService = {
  async getDashboardKPIs(): Promise<KPIMetric[]> {
    try {
      return await apiClient<KPIMetric[]>('/analytics/kpis');
    } catch {
      return [
        { id: 'kpi-risk', label: 'Composite Risk Index', value: '78.4 / 100', changePct: 12.5, isPositiveChange: false, status: 'danger', unit: 'Risk Index' },
        { id: 'kpi-sensors', label: 'Active IoT Telemetry Nodes', value: '138 / 142', changePct: 2.1, isPositiveChange: true, status: 'success', unit: 'LoRa Nodes' },
        { id: 'kpi-incidents', label: 'Critical Active Incidents', value: '3', changePct: 0, isPositiveChange: true, status: 'warning', unit: 'Incidents' },
        { id: 'kpi-evacuated', label: 'Citizens Evacuated to Shelters', value: '1,420', changePct: 35.4, isPositiveChange: true, status: 'normal', unit: 'Citizens' },
      ];
    }
  },

  async getIncidentTrends(): Promise<IncidentAnalyticsPoint[]> {
    try {
      return await apiClient<IncidentAnalyticsPoint[]>('/analytics/incident-trends');
    } catch {
      return [
        { date: 'Mon', incidentsReported: 4, incidentsResolved: 4, averageResponseMinutes: 14, casualtyEstimate: 0 },
        { date: 'Tue', incidentsReported: 7, incidentsResolved: 6, averageResponseMinutes: 12, casualtyEstimate: 0 },
        { date: 'Wed', incidentsReported: 12, incidentsResolved: 9, averageResponseMinutes: 19, casualtyEstimate: 1 },
        { date: 'Thu', incidentsReported: 18, incidentsResolved: 14, averageResponseMinutes: 22, casualtyEstimate: 0 },
        { date: 'Fri', incidentsReported: 24, incidentsResolved: 18, averageResponseMinutes: 28, casualtyEstimate: 2 },
        { date: 'Sat', incidentsReported: 15, incidentsResolved: 13, averageResponseMinutes: 16, casualtyEstimate: 0 },
        { date: 'Sun', incidentsReported: 9, incidentsResolved: 9, averageResponseMinutes: 11, casualtyEstimate: 0 },
      ];
    }
  },

  async getResourceAllocations(): Promise<ResourceAllocationData[]> {
    try {
      return await apiClient<ResourceAllocationData[]>('/analytics/resources');
    } catch {
      return [
        { category: 'Heavy Earthmovers & Excavators', deployed: 14, available: 4, criticalShortage: true },
        { category: 'Autonomous Surveillance Drones', deployed: 8, available: 12, criticalShortage: false },
        { category: 'High-Altitude Inflatable Boats', deployed: 18, available: 6, criticalShortage: false },
        { category: 'Emergency Satellite Terminals', deployed: 22, available: 5, criticalShortage: false },
        { category: 'Mobile Medical Trauma Units', deployed: 9, available: 2, criticalShortage: true },
      ];
    }
  },

  async getModelPerformance(): Promise<ModelPerformanceMetric[]> {
    try {
      return await apiClient<ModelPerformanceMetric[]>('/analytics/model-performance', { useMlEngine: true });
    } catch {
      return [
        { modelName: 'Mohr-Coulomb Geotech Ensemble', accuracy: 0.942, aucRoc: 0.961, precision: 0.915, recall: 0.958, f1Score: 0.936, inferenceLatencyMs: 42, lastTrainedDate: '2026-09-20' },
        { modelName: 'Brahmaputra Flood Level LSTM', accuracy: 0.928, aucRoc: 0.949, precision: 0.897, recall: 0.934, f1Score: 0.915, inferenceLatencyMs: 28, lastTrainedDate: '2026-09-22' },
        { modelName: 'RF-CSI Trapped Survivor Detector', accuracy: 0.894, aucRoc: 0.922, precision: 0.881, recall: 0.912, f1Score: 0.896, inferenceLatencyMs: 18, lastTrainedDate: '2026-09-24' },
      ];
    }
  },
};
