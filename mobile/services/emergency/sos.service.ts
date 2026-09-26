import { SOSPayload } from '../../types/emergency';
import { apiClient } from '../api/client';
import { SyncQueue } from '../../offline/queue';
import { LoRaFallback } from '../../lora/fallback';
import { Connectivity } from '../../offline/connectivity';

export const SOSService = {
  async broadcastSOS(payload: SOSPayload): Promise<{ success: boolean; relayedOverLoRa: boolean }> {
    const isOnline = await Connectivity.isOnline();
    if (isOnline) {
      try {
        await apiClient.post('/sos/trigger', payload);
        return { success: true, relayedOverLoRa: false };
      } catch (e) {
        // Fall back to queue and LoRa
      }
    }
    // Queue offline sync
    await SyncQueue.enqueue('TRIGGER_SOS', '/sos/trigger', 'POST', payload);
    // Transmit over LoRa Mesh packet
    const loraOk = await LoRaFallback.sendOfflineSOS(payload.userId, payload.coordinates.latitude, payload.coordinates.longitude);
    return { success: true, relayedOverLoRa: loraOk };
  }
};
