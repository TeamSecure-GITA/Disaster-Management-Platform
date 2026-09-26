import { SOSService } from '../../services/emergency/sos.service';

describe('SOS Service', () => {
  it('formats emergency payload reliably', () => {
    const service = new SOSService();
    const payload = service.formatSOSPayload({
      latitude: 27.7172,
      longitude: 85.3240,
      altitude: 1400,
      accuracy: 5,
      timestamp: Date.now(),
    }, 'Earthquake collapse detected');

    expect(payload.type).toBe('SOS_SIGNAL');
    expect(payload.location.latitude).toBe(27.7172);
    expect(payload.message).toContain('Earthquake collapse');
  });

  it('handles LoRa mesh fallback when cellular unavailable', async () => {
    const service = new SOSService();
    const packet = service.buildLoRaSOSPacket({
      lat: 27.7172,
      lng: 85.3240,
      sosId: 'sos_999',
    });

    expect(packet.byteLength).toBeLessThanOrEqual(256);
  });
});\n