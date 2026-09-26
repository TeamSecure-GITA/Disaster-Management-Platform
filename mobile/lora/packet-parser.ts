import { LoRaPacket } from './telemetry';

export const LoRaPacketParser = {
  encodeSOS(userId: string, lat: number, lng: number): LoRaPacket {
    const payload = `${userId},${lat.toFixed(5)},${lng.toFixed(5)}`;
    return {
      packetId: `lora-sos-${Date.now()}`,
      sourceNodeId: userId,
      packetType: 'SOS',
      payload,
      checksum: 'CRC16_OK',
      timestamp: Date.now(),
    };
  }
};
