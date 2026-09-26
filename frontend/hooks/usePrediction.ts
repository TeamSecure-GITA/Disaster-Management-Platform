'use client';

import { useState, useEffect } from 'react';
import { PredictionService } from '../services/prediction.service';
import { LandslidePrediction } from '../types/prediction';

export function usePrediction() {
  const [predictions, setPredictions] = useState<LandslidePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PredictionService.getLandslidePredictions();
      setPredictions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return {
    predictions,
    loading,
    error,
    refetch: fetchPredictions,
  };
}
