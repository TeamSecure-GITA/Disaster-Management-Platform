'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { disasterWS } from '../lib/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  send: (type: string, payload: any) => void;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  send: () => {},
  lastMessage: null,
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    disasterWS.connect();

    const unsubStatus = disasterWS.subscribe('connection_status', (data) => {
      setIsConnected(data.status === 'CONNECTED');
    });

    const unsubAlerts = disasterWS.subscribe('emergency_alert', (data) => {
      setLastMessage(data);
    });

    return () => {
      unsubStatus();
      unsubAlerts();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        send: disasterWS.send.bind(disasterWS),
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useDisasterWS() {
  return useContext(WebSocketContext);
}
