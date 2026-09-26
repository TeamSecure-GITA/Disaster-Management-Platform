import { apiClient } from '../lib/api';
import { DisasterSensor, SensorAnomaly } from '../types/sensor';

export const SensorService = {
  async getAllSensors(): Promise<DisasterSensor[]> {
    try {
      return await apiClient<DisasterSensor[]>('/sensors');
    } catch {
      return [
        {
          id: 'sens-khasi-01',
          name: 'Mawlynnong Slope Inclinometer',
          type: 'tiltmeter_inclinometer',
          coordinates: { lat: 25.201, lng: 91.905 },
          status: 'ALERT_TRIGGERED',
          meshNodeId: 'LORA-NODE-08',
          protocol: 'LoRaWAN',
          lastReading: {
            sensorId: 'sens-khasi-01',
            timestamp: new Date().toISOString(),
            value: 4.82,
            unit: 'degrees_tilt',
            thresholdExceeded: true,
            batteryPct: 82,
            signalStrengthDbm: -78,
          },
          healthScorePct: 91,
          criticalThreshold: 3.5,
          installedDate: '2025-04-12',
        },
        {
          id: 'sens-piezo-02',
          name: 'Cherrapunji Pore Pressure Probe',
          type: 'piezometer_pore_pressure',
          coordinates: { lat: 25.27, lng: 91.73 },
          status: 'ONLINE',
          meshNodeId: 'LORA-NODE-12',
          protocol: 'LoRaWAN',
          lastReading: {
            sensorId: 'sens-piezo-02',
            timestamp: new Date().toISOString(),
            value: 42.1,
            unit: 'kPa',
            thresholdExceeded: false,
            batteryPct: 95,
            signalStrengthDbm: -65,
          },
          healthScorePct: 99,
          criticalThreshold: 65.0,
          installedDate: '2025-05-18',
        },
        {
          id: 'sens-geo-03',
          name: 'Dauki Fault Acoustic Geophone',
          type: 'geophone_seismic',
          coordinates: { lat: 25.18, lng: 92.02 },
          status: 'ONLINE',
          meshNodeId: 'LORA-NODE-03',
          protocol: 'LoRaWAN',
          lastReading: {
            sensorId: 'sens-geo-03',
            timestamp: new Date().toISOString(),
            value: 0.14,
            unit: 'mm/s',
            thresholdExceeded: false,
            batteryPct: 88,
            signalStrengthDbm: -82,
          },
          healthScorePct: 96,
          criticalThreshold: 0.8,
          installedDate: '2025-03-01',
        },
      ];
    }
  },

  async getAnomalies(): Promise<SensorAnomaly[]> {
    try {
      return await apiClient<SensorAnomaly[]>('/sensors/anomalies');
    } catch {
      return [
        {
          id: 'anom-1',
          sensorId: 'sens-khasi-01',
          sensorName: 'Mawlynnong Slope Inclinometer',
          detectedAt: new Date(Date.now() - 900000).toISOString(),
          anomalyScore: 0.94,
          deviationPct: 37.7,
          readingValue: 4.82,
          expectedRange: [0.1, 3.5],
          potentialCause: 'Rapid shear displacement along rock strata',
        },
      ];
    }
  },
};
