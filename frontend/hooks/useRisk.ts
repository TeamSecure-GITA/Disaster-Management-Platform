'use client';

import { useState, useEffect } from 'react';
import { riskStore } from '../stores/riskStore';
import { RiskService } from '../services/risk.service';

export function useRisk() {
  const [state, setState] = useState(riskStore.getState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = riskStore.subscribe(() => {
      setState(riskStore.getState());
    });

    const loadData = async () => {
      setLoading(true);
      try {
        const zones = await RiskService.getAllZones();
        // Update zones if returned
        if (zones.length) {
          zones.forEach(z => riskStore.updateRiskScore(z.id, z.overallRiskScore));
        }
      } catch (err) {
        console.warn('Risk fetch fallback to store state:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => unsubscribe();
  }, []);

  return {
    zones: state.zones,
    selectedZoneId: state.selectedZoneId,
    overallIndex: state.overallIndex,
    selectZone: riskStore.selectZone,
    loading,
  };
}
