import { DisasterSensor, SensorAnomaly } from '../types/sensor';

interface SensorState {
  sensors: DisasterSensor[];
  anomalies: SensorAnomaly[];
  activeSensorId: string | null;
  networkStatus: {
    totalNodes: number;
    onlineNodes: number;
    meshHealthPct: number;
    gatewayStatus: 'OPTIMAL' | 'DEGRADED' | 'ISOLATED';
  };
}

type Listener = () => void;

class SensorStore {
  private state: SensorState = {
    sensors: [
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
    ],
    anomalies: [
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
    ],
    activeSensorId: null,
    networkStatus: {
      totalNodes: 142,
      onlineNodes: 138,
      meshHealthPct: 97.2,
      gatewayStatus: 'OPTIMAL',
    },
  };

  private listeners: Set<Listener> = new Set();

  public getState = (): SensorState => this.state;

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public setActiveSensor = (id: string | null) => {
    this.state = { ...this.state, activeSensorId: id };
    this.notify();
  };

  public updateReading = (sensorId: string, value: number) => {
    this.state = {
      ...this.state,
      sensors: this.state.sensors.map((s) => {
        if (s.id === sensorId) {
          const thresholdExceeded = value >= s.criticalThreshold;
          return {
            ...s,
            status: thresholdExceeded ? 'ALERT_TRIGGERED' : 'ONLINE',
            lastReading: {
              ...s.lastReading,
              value,
              thresholdExceeded,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return s;
      }),
    };
    this.notify();
  };
}

export const sensorStore = new SensorStore();
