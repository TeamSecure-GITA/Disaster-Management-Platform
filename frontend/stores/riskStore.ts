import { RegionalRiskZone, RiskAssessment } from '../types/risk';

interface RiskState {
  zones: RegionalRiskZone[];
  selectedZoneId: string | null;
  currentAssessment: RiskAssessment | null;
  overallIndex: number;
}

type Listener = () => void;

class RiskStore {
  private state: RiskState = {
    zones: [
      {
        id: 'zone-meghalaya-1',
        name: 'East Khasi Hills Escarpment',
        state: 'Meghalaya',
        boundaryCoordinates: [
          { lat: 25.56, lng: 91.88 },
          { lat: 25.62, lng: 91.95 },
          { lat: 25.54, lng: 91.98 },
        ],
        overallRiskScore: 84,
        level: 'CRITICAL',
        primaryHazard: 'landslide',
        populationAtRisk: 14200,
        criticalInfrastructureImpacted: ['NH-40', 'Umiam Hydel Feeder Line'],
        activeSensorsCount: 38,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'zone-assam-2',
        name: 'Lower Brahmaputra Floodplain',
        state: 'Assam',
        boundaryCoordinates: [
          { lat: 26.15, lng: 91.75 },
          { lat: 26.25, lng: 91.85 },
        ],
        overallRiskScore: 68,
        level: 'HIGH',
        primaryHazard: 'flash_flood',
        populationAtRisk: 42000,
        criticalInfrastructureImpacted: ['Guwahati Rail Link'],
        activeSensorsCount: 54,
        lastUpdated: new Date().toISOString(),
      },
    ],
    selectedZoneId: 'zone-meghalaya-1',
    currentAssessment: null,
    overallIndex: 76,
  };

  private listeners: Set<Listener> = new Set();

  public getState = (): RiskState => this.state;

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public selectZone = (id: string | null) => {
    this.state = { ...this.state, selectedZoneId: id };
    this.notify();
  };

  public updateRiskScore = (zoneId: string, score: number) => {
    this.state = {
      ...this.state,
      zones: this.state.zones.map((z) => (z.id === zoneId ? { ...z, overallRiskScore: score } : z)),
    };
    this.notify();
  };
}

export const riskStore = new RiskStore();
