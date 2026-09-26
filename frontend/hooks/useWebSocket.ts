'use client';

import { useEffect, useState } from 'react';
import { disasterWS } from '../lib/websocket';

export function useWebSocket(eventType?: string, callback?: (data: any) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    disasterWS.connect();

    const unsubStatus = disasterWS.subscribe('connection_status', (data) => {
      setIsConnected(data.status === 'CONNECTED');
    });

    let unsubEvent: (() => void) | undefined;
    if (eventType && callback) {
      unsubEvent = disasterWS.subscribe(eventType, callback);
    }

    return () => {
      unsubStatus();
      if (unsubEvent) unsubEvent();
    };
  }, [eventType, callback]);

  return {
    isConnected,
    send: disasterWS.send.bind(disasterWS),
  };
}
