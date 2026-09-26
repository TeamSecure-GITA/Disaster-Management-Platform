'use client';

import { useState, useEffect } from 'react';
import { PredictionService } from '../services/prediction.service';
import { ForecastPoint } from '../types/prediction';

export function useForecast(zoneId: string = 'zone-meghalaya-1') {
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    PredictionService.getRiskForecastTimeline(zoneId)
      .then((data) => {
        if (isMounted) setPoints(data);
      })
      .catch((err) => console.warn('Forecast error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [zoneId]);

  return { points, loading };
}
