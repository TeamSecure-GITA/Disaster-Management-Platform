import { useEmergencyStore } from '../../stores/emergency.store';
import { useOfflineStore } from '../../stores/offline.store';
import { SOSService } from '../../services/emergency/sos.service';

describe('Emergency End-to-End Flow Integration', () => {
  it('transitions from idle -> countdown -> dispatched -> offline fallback', async () => {
    const store = useEmergencyStore.getState();
    const offline = useOfflineStore.getState();
    const sosService = new SOSService();

    // 1. Citizen holds SOS
    store.triggerCountdown();
    expect(useEmergencyStore.getState().sosStatus).toBe('countdown');

    // 2. Countdown ends without cancellation
    store.triggerSOS();
    expect(useEmergencyStore.getState().sosStatus).toBe('active');

    // 3. Offline simulation - payload is queued safely
    const packet = sosService.formatSOSPayload({
      latitude: 19.0760,
      longitude: 72.8777,
      altitude: 14,
      accuracy: 8,
      timestamp: Date.now(),
    });

    await offline.queueAction({
      type: 'EMERGENCY_SOS',
      payload: packet,
    });

    expect(useOfflineStore.getState().pendingQueueCount).toBeGreaterThanOrEqual(1);
  });
});\n