import { WebSocketClient } from './client';

export const TelemetrySocket = {
  broadcastSOSLocation(lat: number, lng: number, userId: string) {
    WebSocketClient.getInstance().send('SOS_TELEMETRY', { latitude: lat, longitude: lng, userId, timestamp: Date.now() });
  }
};
