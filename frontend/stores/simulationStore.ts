import { SimulationScenario, SimulationParameters, SimulationRunResult } from '../types/simulation';

interface SimulationState {
  scenarios: SimulationScenario[];
  selectedScenario: SimulationScenario | null;
  currentParameters: SimulationParameters;
  isRunning: boolean;
  activeRunResult: SimulationRunResult | null;
}

type Listener = () => void;

class SimulationStore {
  private defaultParams: SimulationParameters = {
    scenarioId: 'scen-monsoon-ner',
    rainfallMultiplier: 2.2,
    seismicMagnitude: 5.4,
    soilSaturationInitialPct: 88,
    riverDischargeRateCusecs: 145000,
    durationHours: 48,
    bridgeFailuresEnabled: true,
  };

  private state: SimulationState = {
    scenarios: [
      {
        id: 'scen-monsoon-ner',
        name: 'Monsoon Extreme Cloudburst (East Khasi Hills)',
        hazardType: 'landslide',
        description: 'Simulates 350mm continuous torrential rainfall over saturated sedimentary hillslopes.',
        targetRegion: 'Shillong-Cherrapunji Belt',
        centerCoordinates: { lat: 25.5788, lng: 91.8933 },
        defaultParameters: {
          scenarioId: 'scen-monsoon-ner',
          rainfallMultiplier: 2.2,
          seismicMagnitude: 0,
          soilSaturationInitialPct: 88,
          riverDischargeRateCusecs: 95000,
          durationHours: 36,
          bridgeFailuresEnabled: true,
        },
      },
      {
        id: 'scen-cascading-quake',
        name: 'Copious Rain + Richter 6.2 Epicenter Cascade',
        hazardType: 'debris_flow',
        description: 'Co-seismic liquefaction combined with high pore-water pressure triggering mass wasting.',
        targetRegion: 'Dauki Fault Boundary',
        centerCoordinates: { lat: 25.18, lng: 92.02 },
        defaultParameters: {
          scenarioId: 'scen-cascading-quake',
          rainfallMultiplier: 1.5,
          seismicMagnitude: 6.2,
          soilSaturationInitialPct: 75,
          riverDischargeRateCusecs: 120000,
          durationHours: 24,
          bridgeFailuresEnabled: true,
        },
      },
    ],
    selectedScenario: null,
    currentParameters: {
      scenarioId: 'scen-monsoon-ner',
      rainfallMultiplier: 2.2,
      seismicMagnitude: 5.4,
      soilSaturationInitialPct: 88,
      riverDischargeRateCusecs: 145000,
      durationHours: 48,
      bridgeFailuresEnabled: true,
    },
    isRunning: false,
    activeRunResult: null,
  };

  private listeners: Set<Listener> = new Set();

  public getState = (): SimulationState => this.state;

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public setParameters = (params: Partial<SimulationParameters>) => {
    this.state = {
      ...this.state,
      currentParameters: {
        ...this.state.currentParameters,
        ...params,
      },
    };
    this.notify();
  };

  public setRunning = (isRunning: boolean) => {
    this.state = { ...this.state, isRunning };
    this.notify();
  };

  public setResult = (activeRunResult: SimulationRunResult | null) => {
    this.state = { ...this.state, activeRunResult, isRunning: false };
    this.notify();
  };
}

export const simulationStore = new SimulationStore();
