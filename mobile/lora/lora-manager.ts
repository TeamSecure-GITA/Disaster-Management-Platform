import { LoRaPacket, LoRaGatewayNode } from './telemetry';

export class LoRaManager {
  private static instance: LoRaManager;
  public isConnected: boolean = false;
  public activeGateway: LoRaGatewayNode | null = null;

  static getInstance(): LoRaManager {
    if (!LoRaManager.instance) {
      LoRaManager.instance = new LoRaManager();
    }
    return LoRaManager.instance;
  }

  async scanMeshGateways(): Promise<LoRaGatewayNode[]> {
    return [
      { id: 'lora-gw-meghalaya-01', name: 'Cherrapunji Repeater Node A', rssiDbm: -72, frequencyMhz: 868.1, status: 'ONLINE' },
      { id: 'lora-gw-shillong-04', name: 'Shillong Ridge High-Tower Node', rssiDbm: -84, frequencyMhz: 868.3, status: 'ONLINE' },
    ];
  }

  async broadcastPacket(packet: LoRaPacket): Promise<boolean> {
    console.log('[LORA MESH] Broadcasting packet over radio frequency:', packet);
    return true;
  }
}
