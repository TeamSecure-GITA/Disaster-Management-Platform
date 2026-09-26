import { ENV } from '../../config/environment';

export class WebSocketClient {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect() {
    try {
      this.ws = new WebSocket(ENV.WS_URL);
      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const handlers = this.listeners.get(parsed.type) || [];
          handlers.forEach((h) => h(parsed.payload));
        } catch {}
      };
    } catch (err) {
      console.log('[WS] Connection fallback to polling');
    }
  }

  on(type: string, handler: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(handler);
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
}
