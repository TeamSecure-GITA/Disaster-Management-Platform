'use client';

import { useState, useEffect } from 'react';
import { AnalyticsService } from '../services/analytics.service';
import { KPIMetric, IncidentAnalyticsPoint, ResourceAllocationData, ModelPerformanceMetric } from '../types/analytics';

export function useAnalytics() {
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [incidentTrends, setIncidentTrends] = useState<IncidentAnalyticsPoint[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocationData[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelPerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      AnalyticsService.getDashboardKPIs(),
      AnalyticsService.getIncidentTrends(),
      AnalyticsService.getResourceAllocations(),
      AnalyticsService.getModelPerformance(),
    ])
      .then(([kpiData, trendData, resData, modelData]) => {
        if (!isMounted) return;
        setKpis(kpiData);
        setIncidentTrends(trendData);
        setResourceAllocations(resData);
        setModelMetrics(modelData);
      })
      .catch((err) => console.warn('Analytics loading error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    kpis,
    incidentTrends,
    resourceAllocations,
    modelMetrics,
    loading,
  };
}
