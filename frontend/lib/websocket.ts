/**
 * WebSocket client manager for real-time sensor streams and alerts
 */

type ListenerCallback = (data: any) => void;

export class DisasterWebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectIntervalMs: number = 3000;
  private listeners: Map<string, Set<ListenerCallback>> = new Map();
  private isExplicitlyClosed: boolean = false;

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    this.isExplicitlyClosed = false;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.emit('connection_status', { status: 'CONNECTED' });
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const eventType = parsed.type || 'message';
          this.emit(eventType, parsed.payload || parsed);
        } catch {
          this.emit('raw_message', event.data);
        }
      };

      this.socket.onclose = () => {
        this.emit('connection_status', { status: 'DISCONNECTED' });
        if (!this.isExplicitlyClosed) {
          setTimeout(() => this.connect(), this.reconnectIntervalMs);
        }
      };

      this.socket.onerror = (err) => {
        this.emit('error', err);
      };
    } catch (err) {
      console.warn('Disaster WS connection error:', err);
    }
  }

  public subscribe(eventType: string, callback: ListenerCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public send(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private emit(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

export const disasterWS = new DisasterWebSocketClient();
