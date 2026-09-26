import * as Network from 'expo-network';

export const Connectivity = {
  async isOnline(): Promise<boolean> {
    const net = await Network.getNetworkStateAsync();
    return Boolean(net.isConnected && net.isInternetReachable);
  }
};
