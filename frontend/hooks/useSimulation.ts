'use client';

import { useState, useEffect } from 'react';
import { simulationStore } from '../stores/simulationStore';
import { SimulationService } from '../services/simulation.service';
import { SimulationParameters } from '../types/simulation';

export function useSimulation() {
  const [state, setState] = useState(simulationStore.getState());

  useEffect(() => {
    return simulationStore.subscribe(() => {
      setState(simulationStore.getState());
    });
  }, []);

  const runSimulation = async (customParams?: Partial<SimulationParameters>) => {
    const params = {
      ...state.currentParameters,
      ...customParams,
    };
    simulationStore.setRunning(true);
    try {
      const result = await SimulationService.runScenario(params);
      simulationStore.setResult(result);
    } catch (err) {
      console.error('Simulation execution failed:', err);
      simulationStore.setRunning(false);
    }
  };

  return {
    scenarios: state.scenarios,
    selectedScenario: state.selectedScenario,
    currentParameters: state.currentParameters,
    isRunning: state.isRunning,
    activeRunResult: state.activeRunResult,
    setParameters: simulationStore.setParameters,
    runSimulation,
  };
}
