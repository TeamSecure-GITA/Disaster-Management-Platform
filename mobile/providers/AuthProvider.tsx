import React, { createContext, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export const AuthContext = createContext({});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
