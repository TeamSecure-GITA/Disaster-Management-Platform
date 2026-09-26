import { GeoCoordinate } from './prediction';

export type SensorType = 
  | 'geophone_seismic' 
  | 'piezometer_pore_pressure' 
  | 'tiltmeter_inclinometer' 
  | 'soil_moisture_capacitive' 
  | 'rain_gauge_tipping' 
  | 'weather_station' 
  | 'rf_csi_probe';

export type SensorStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'ALERT_TRIGGERED';

export interface SensorTelemetryReading {
  sensorId: string;
  timestamp: string;
  value: number;
  unit: string;
  thresholdExceeded: boolean;
  batteryPct: number;
  signalStrengthDbm: number;
}

export interface DisasterSensor {
  id: string;
  name: string;
  type: SensorType;
  coordinates: GeoCoordinate;
  status: SensorStatus;
  meshNodeId: string;
  protocol: 'LoRaWAN' | 'BLE_MESH' | 'CELLULAR_4G' | 'SATELLITE_LINK';
  lastReading: SensorTelemetryReading;
  healthScorePct: number;
  criticalThreshold: number;
  installedDate: string;
}

export interface SensorAnomaly {
  id: string;
  sensorId: string;
  sensorName: string;
  detectedAt: string;
  anomalyScore: number; // 0 to 1
  deviationPct: number;
  readingValue: number;
  expectedRange: [number, number];
  potentialCause: string;
}
