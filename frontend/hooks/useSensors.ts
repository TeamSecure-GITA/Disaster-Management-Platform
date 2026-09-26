'use client';

import { useState, useEffect } from 'react';
import { sensorStore } from '../stores/sensorStore';
import { SensorService } from '../services/sensor.service';

export function useSensors() {
  const [state, setState] = useState(sensorStore.getState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = sensorStore.subscribe(() => {
      setState(sensorStore.getState());
    });

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          SensorService.getAllSensors(),
          SensorService.getAnomalies(),
        ]);
      } catch (err) {
        console.warn('Sensors load fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => unsubscribe();
  }, []);

  return {
    sensors: state.sensors,
    anomalies: state.anomalies,
    activeSensorId: state.activeSensorId,
    networkStatus: state.networkStatus,
    setActiveSensor: sensorStore.setActiveSensor,
    updateReading: sensorStore.updateReading,
    loading,
  };
}
