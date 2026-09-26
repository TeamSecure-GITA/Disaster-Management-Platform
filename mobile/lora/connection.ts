export const LoRaConnection = {
  checkStatus(): 'DISCONNECTED' | 'MESH_ACTIVE' | 'RELAY_READY' {
    return 'MESH_ACTIVE';
  }
};
