export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  changePct?: number;
  isPositiveChange?: boolean;
  status?: 'normal' | 'warning' | 'danger' | 'success';
  trendData?: number[];
  unit?: string;
}

export interface IncidentAnalyticsPoint {
  date: string;
  incidentsReported: number;
  incidentsResolved: number;
  averageResponseMinutes: number;
  casualtyEstimate: number;
}

export interface ResourceAllocationData {
  category: string;
  deployed: number;
  available: number;
  criticalShortage: boolean;
}

export interface ShelterAnalytics {
  id: string;
  name: string;
  currentOccupancy: number;
  maxCapacity: number;
  medicalSuppliesStatus: 'FULL' | 'ADEQUATE' | 'DEPLETED';
  waterSupplyDays: number;
}

export interface ModelPerformanceMetric {
  modelName: string;
  accuracy: number;
  aucRoc: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceLatencyMs: number;
  lastTrainedDate: string;
}
