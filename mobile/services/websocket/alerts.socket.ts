import { WebSocketClient } from './client';
import { DisasterAlert } from '../../types/alert';

export const AlertsSocket = {
  subscribe(onAlert: (alert: DisasterAlert) => void) {
    WebSocketClient.getInstance().on('ALERT_BROADCAST', onAlert);
  }
};
