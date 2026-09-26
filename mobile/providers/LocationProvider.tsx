import React, { createContext, useEffect } from 'react';
import { LocationPermission } from '../permissions/location';

export const LocationContext = createContext({});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    LocationPermission.request();
  }, []);
  return <LocationContext.Provider value={{}}>{children}</LocationContext.Provider>;
};
