import React, { createContext, useEffect } from 'react';
import * as Network from 'expo-network';
import { useConnectivityStore } from '../stores/connectivity.store';

export const NetworkContext = createContext({});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setIsOnline = useConnectivityStore((s) => s.setIsOnline);

  useEffect(() => {
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable));
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return <NetworkContext.Provider value={{}}>{children}</NetworkContext.Provider>;
};
