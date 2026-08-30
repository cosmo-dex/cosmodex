export type EventHandler<T = unknown> = (data: T) => void;

export interface ArenaSocketOptions {
  auth?: {
    token?: string;
  };
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export class ArenaSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private isExplicitlyClosed = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  public connected = false;

  constructor(baseUrl: string, options?: ArenaSocketOptions) {
    this.token = options?.auth?.token ?? null;
    this.maxReconnectAttempts = options?.reconnectionAttempts ?? 10;
    this.reconnectDelay = options?.reconnectionDelay ?? 1000;

    let wsUrl = baseUrl.replace(/^http:\/\//i, "ws://").replace(/^https:\/\//i, "wss://");
    wsUrl = wsUrl.replace(/\/+$/, "");

    if (!wsUrl.includes("/ws")) {
      wsUrl += "/ws";
    }

    if (this.token) {
      const delimiter = wsUrl.includes("?") ? "&" : "?";
      wsUrl += `${delimiter}token=${encodeURIComponent(this.token)}`;
    }

    this.url = wsUrl;
    this.connect();
  }

  private connect() {
    if (typeof window === "undefined") return;
    if (this.isExplicitlyClosed) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.trigger("connect", undefined);
      };

      this.ws.onclose = (event) => {
        this.connected = false;
        this.trigger("disconnect", event.reason || "closed");

        if (!this.isExplicitlyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 10000);
          this.reconnectTimer = setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = () => {
        this.trigger("error", { message: "WebSocket connection error" });
      };

      this.ws.onmessage = (event) => {
        if (!event.data) return;
        const text = typeof event.data === "string" ? event.data : "";
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed && typeof parsed.event === "string") {
              this.trigger(parsed.event, parsed.data);
            }
          } catch {
            // Ignore non-JSON frames
          }
        }
      };
    } catch (e) {
      console.error("[ArenaSocket] Connection error:", e);
    }
  }

  public on<T = unknown>(event: string, handler: EventHandler<T>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as (data: unknown) => void);
    return this;
  }

  public off<T = unknown>(event: string, handler?: EventHandler<T>): this {
    if (!handler) {
      this.listeners.delete(event);
    } else {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(handler as (data: unknown) => void);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    }
    return this;
  }

  public emit(event: string, data: unknown = {}): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[ArenaSocket] Cannot emit '${event}', socket not open.`);
      return false;
    }
    try {
      const payload = JSON.stringify({ event, data });
      this.ws.send(payload);
      return true;
    } catch (err) {
      console.error(`[ArenaSocket] Failed to send event '${event}':`, err);
      return false;
    }
  }

  private trigger(event: string, data: unknown) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`[ArenaSocket] Error in listener for '${event}':`, err);
        }
      });
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    this.connected = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export function createArenaSocket(url: string, options?: ArenaSocketOptions): ArenaSocket {
  return new ArenaSocket(url, options);
}
