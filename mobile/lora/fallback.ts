import { LoRaManager } from './lora-manager';
import { LoRaPacketParser } from './packet-parser';

export const LoRaFallback = {
  async sendOfflineSOS(userId: string, lat: number, lng: number): Promise<boolean> {
    const mgr = LoRaManager.getInstance();
    const packet = LoRaPacketParser.encodeSOS(userId, lat, lng);
    return await mgr.broadcastPacket(packet);
  }
};
