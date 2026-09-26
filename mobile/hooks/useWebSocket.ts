import { useEffect } from 'react';
import { WebSocketClient } from '../services/websocket/client';

export function useWebSocket() {
  useEffect(() => {
    WebSocketClient.getInstance().connect();
  }, []);
}
