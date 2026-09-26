import React, { createContext, useEffect } from 'react';
import { WebSocketClient } from '../services/websocket/client';

export const WebSocketContext = createContext({});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    WebSocketClient.getInstance().connect();
  }, []);
  return <WebSocketContext.Provider value={{}}>{children}</WebSocketContext.Provider>;
};
