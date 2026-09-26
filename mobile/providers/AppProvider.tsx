import React from 'react';
import { AuthProvider } from './AuthProvider';
import { NetworkProvider } from './NetworkProvider';
import { LocationProvider } from './LocationProvider';
import { NotificationProvider } from './NotificationProvider';
import { WebSocketProvider } from './WebSocketProvider';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NetworkProvider>
      <LocationProvider>
        <NotificationProvider>
          <WebSocketProvider>
            <AuthProvider>{children}</AuthProvider>
          </WebSocketProvider>
        </NotificationProvider>
      </LocationProvider>
    </NetworkProvider>
  );
};
