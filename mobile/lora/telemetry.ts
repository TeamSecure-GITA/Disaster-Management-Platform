export interface LoRaPacket {
  packetId: string;
  sourceNodeId: string;
  packetType: 'SOS' | 'PING' | 'TELEMETRY' | 'RELIEF_REQ';
  payload: string;
  checksum: string;
  timestamp: number;
}

export interface LoRaGatewayNode {
  id: string;
  name: string;
  rssiDbm: number;
  frequencyMhz: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}
