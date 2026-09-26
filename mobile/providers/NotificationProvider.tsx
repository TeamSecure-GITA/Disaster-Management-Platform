import React, { createContext, useEffect } from 'react';
import { NotificationPermission } from '../permissions/notifications';

export const NotificationContext = createContext({});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    NotificationPermission.request();
  }, []);
  return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>;
};
