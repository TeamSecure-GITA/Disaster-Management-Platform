'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QueryCacheContextType {
  cache: Map<string, any>;
  setCachedData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  invalidateKey: (key: string) => void;
}

const QueryCacheContext = createContext<QueryCacheContextType>({
  cache: new Map(),
  setCachedData: () => {},
  getCachedData: () => undefined,
  invalidateKey: () => {},
});

export function QueryProvider({ children }: { children: ReactNode }) {
  const [cache] = useState<Map<string, any>>(() => new Map());

  const setCachedData = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };

  const getCachedData = (key: string) => {
    const entry = cache.get(key);
    if (!entry) return undefined;
    return entry.data;
  };

  const invalidateKey = (key: string) => {
    cache.delete(key);
  };

  return (
    <QueryCacheContext.Provider value={{ cache, setCachedData, getCachedData, invalidateKey }}>
      {children}
    </QueryCacheContext.Provider>
  );
}

export function useQueryCache() {
  return useContext(QueryCacheContext);
}
