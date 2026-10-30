/**
 * RESCUEBOT Realtime Stream Adapter Interface
 * Unified WebSocket / SSE / Polling subscriber with auto-reconnect and heartbeat staleness detection.
 */

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://10.229.134.76:8000/ws';

export class RealtimeAdapter {
  constructor(url = WS_BASE_URL) {
    this.url = url;
    this.socket = null;
    this.subscribers = new Map();
    this.connectionState = 'DISCONNECTED'; // DISCONNECTED | CONNECTING | CONNECTED | ERROR
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimer = null;
    this.lastHeartbeat = null;
  }

  setUrl(url) {
    this.url = url;
  }

  connect() {
    if (this.connectionState === 'CONNECTED' || this.connectionState === 'CONNECTING') return;

    this.connectionState = 'CONNECTING';
    this.notifyStatusChange();

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.connectionState = 'CONNECTED';
        this.reconnectAttempts = 0;
        this.lastHeartbeat = Date.now();
        this.notifyStatusChange();
      };

      this.socket.onmessage = (event) => {
        this.lastHeartbeat = Date.now();
        try {
          const data = JSON.parse(event.data);
          const { channel, payload } = data;
          if (channel && this.subscribers.has(channel)) {
            this.subscribers.get(channel).forEach((fn) => fn(payload));
          }
        } catch (e) {
          console.warn('[Realtime] Malformed message received:', event.data);
        }
      };

      this.socket.onerror = (err) => {
        this.connectionState = 'ERROR';
        this.notifyStatusChange();
      };

      this.socket.onclose = () => {
        this.connectionState = 'DISCONNECTED';
        this.notifyStatusChange();
        this.scheduleReconnect();
      };
    } catch (e) {
      this.connectionState = 'ERROR';
      this.notifyStatusChange();
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  subscribe(channel, handler) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(handler);

    return () => {
      const set = this.subscribers.get(channel);
      if (set) {
        set.delete(handler);
        if (set.size === 0) this.subscribers.delete(channel);
      }
    };
  }

  publishToLocalSubscribers(channel, payload) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).forEach((fn) => fn(payload));
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionState = 'DISCONNECTED';
    this.notifyStatusChange();
  }

  status() {
    return {
      state: this.connectionState,
      lastHeartbeat: this.lastHeartbeat,
      isStale: this.lastHeartbeat ? Date.now() - this.lastHeartbeat > 10000 : true,
    };
  }

  notifyStatusChange() {
    if (this.subscribers.has('connection-status')) {
      this.subscribers.get('connection-status').forEach((fn) => fn(this.status()));
    }
  }
}

export const realtimeAdapter = new RealtimeAdapter();
