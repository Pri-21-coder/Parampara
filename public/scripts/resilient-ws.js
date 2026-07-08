/**
 * ResilientWebSocket
 * A drop-in polyfill for the native browser WebSocket.
 * Features:
 * - Automatic Reconnection (Exponential Backoff)
 * - Heartbeat Ping/Pong 
 * - Offline Message Buffering
 * - Message Deduplication ID injection
 */
class ResilientWebSocket {
    constructor(url, protocols = []) {
        this.url = url;
        this.protocols = protocols;
        this.ws = null;
        
        this.outboundQueue = [];
        
        // Reconnection Config
        this.reconnectAttempts = 0;
        this.maxReconnectDelay = 30000; // 30 seconds
        this.baseDelay = 1000; // 1 second
        this.forcedClose = false;
        
        // Heartbeat Config
        this.pingInterval = null;
        this.pongTimeout = null;
        this.reconnectTimeout = null;
        
        // Event Listeners Storage
        this._listeners = {
            open: [],
            close: [],
            message: [],
            error: []
        };
        
        // Proxy these event handlers
        this.onopen = null;
        this.onclose = null;
        this.onmessage = null;
        this.onerror = null;

        // Constants
        this.CONNECTING = 0;
        this.OPEN = 1;
        this.CLOSING = 2;
        this.CLOSED = 3;

        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url, this.protocols);
        
        // Re-attach standard properties if they were set while offline
        if (this._binaryType !== undefined) this.ws.binaryType = this._binaryType;
        
        this.ws.onopen = (e) => {
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            
            // Replay buffered messages
            while (this.outboundQueue.length > 0) {
                const msg = this.outboundQueue.shift();
                this.ws.send(msg);
            }
            
            if (this.onopen) this.onopen(e);
            this._listeners.open.forEach(cb => cb(e));
        };
        
        this.ws.onmessage = (e) => {
            // Heartbeat intercept
            if (typeof e.data === 'string') {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'pong') {
                        this.handlePong();
                        return; // Do not pass to application
                    }
                } catch (err) {} 
            }
            
            if (this.onmessage) this.onmessage(e);
            this._listeners.message.forEach(cb => cb(e));
        };
        
        this.ws.onclose = (e) => {
            this.stopHeartbeat();
            
            // Only fire close events to the app if it was a manual close, 
            // otherwise hide the network fluctuation from the app since we're self-healing.
            if (this.forcedClose) {
                if (this.onclose) this.onclose(e);
                this._listeners.close.forEach(cb => cb(e));
            } else {
                console.warn('[ResilientWebSocket] Connection dropped ungracefully.');
                this.scheduleReconnect();
            }
        };
        
        this.ws.onerror = (e) => {
            if (this.onerror) this.onerror(e);
            this._listeners.error.forEach(cb => cb(e));
        };
    }

    scheduleReconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        
        const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
        this.reconnectAttempts++;
        console.warn(`[ResilientWebSocket] Reconnecting in ${delay}ms...`);
        this.reconnectTimeout = setTimeout(() => {
            if (!this.forcedClose) this.connect();
        }, delay);
    }

    send(data) {
        // Inject a msgId for backend deduplication if it's a JSON string
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (!parsed.msgId && parsed.type !== 'ping' && parsed.type !== 'pong') {
                    parsed.msgId = 'msg-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
                    data = JSON.stringify(parsed);
                }
            } catch (e) {}
        }
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.warn('[ResilientWebSocket] Offline. Buffering outgoing message.');
            if (this.outboundQueue.length >= 1000) {
                console.warn('[ResilientWebSocket] Queue full, dropping oldest message.');
                this.outboundQueue.shift();
            }
            this.outboundQueue.push(data);
        }
    }
    
    close(code, reason) {
        this.forcedClose = true;
        this.stopHeartbeat();
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        if (this.ws) {
            this.ws.close(code, reason);
        }
    }
    
    startHeartbeat() {
        this.stopHeartbeat();
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
                
                this.pongTimeout = setTimeout(() => {
                    console.error('[ResilientWebSocket] Heartbeat timeout. Forcing reconnect cycle.');
                    if (this.ws) this.ws.close(); // Triggers onclose -> scheduleReconnect
                }, 5000); // 5 second timeout for pong
            }
        }, 15000); // Send ping every 15 seconds
    }
    
    handlePong() {
        if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    }
    
    stopHeartbeat() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (this.pongTimeout) clearTimeout(this.pongTimeout);
    }
    
    addEventListener(type, listener) {
        if (this._listeners[type]) {
            this._listeners[type].push(listener);
        }
    }
    
    removeEventListener(type, listener) {
        if (this._listeners[type]) {
            this._listeners[type] = this._listeners[type].filter(cb => cb !== listener);
        }
    }
    
    get readyState() {
        return this.ws ? this.ws.readyState : this.CLOSED;
    }
    
    set binaryType(type) {
        if (this.ws) this.ws.binaryType = type;
        this._binaryType = type;
    }
    
    get binaryType() {
        return this.ws ? this.ws.binaryType : this._binaryType;
    }
}
