import { WebSocketClient } from './client';
import { IncidentReport } from '../../types/incident';

export const IncidentsSocket = {
  subscribe(onIncident: (inc: IncidentReport) => void) {
    WebSocketClient.getInstance().on('INCIDENT_UPDATE', onIncident);
  }
};
