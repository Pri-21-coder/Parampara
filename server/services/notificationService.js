/**
 * Notification Service for Server-Sent Events (SSE)
 * Advanced version supporting Channels, Direct Notifications, and Categories.
 */
const store = require('../../data/store');

class NotificationService {
  constructor() {
    this.clients = new Map(); // clientId -> { res, channels: Set, userId: string|null }
    this.history = [];
    this.maxHistoryLength = 100;
  }

  /**
   * Adds a new client connection
   */
  addClient(clientId, res, userId = null) {
    const channels = new Set(['global']);
    if (userId) {
      channels.add(`user_${userId}`);
      // Initialize store if missing
      if (!store.userNotifications[userId]) {
        store.userNotifications[userId] = { readIds: new Set(), preferences: {} };
      }
    }

    this.clients.set(clientId, { res, channels, userId });
    console.log(`[SSE] Client connected: ${clientId} (User: ${userId || 'anonymous'}). Channels: ${Array.from(channels).join(',')}`);

    this.sendToClient(res, 'connected', {
      message: 'Successfully connected to notification center',
      clientId,
      channels: Array.from(channels)
    });
  }

  removeClient(clientId) {
    this.clients.delete(clientId);
    console.log(`[SSE] Client disconnected: ${clientId}.`);
  }

  subscribe(clientId, channel) {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.add(channel);
    }
  }

  unsubscribe(clientId, channel) {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.delete(channel);
    }
  }

  /**
   * Broadcasts an event to a specific channel
   */
  broadcast(eventType, payload, category = 'system', targetChannel = 'global') {
    const notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type: eventType,
      category,
      channel: targetChannel,
      data: payload,
      timestamp: new Date().toISOString()
    };

    if (targetChannel === 'global') {
      this.history.unshift(notification);
      if (this.history.length > this.maxHistoryLength) this.history.pop();
    }

    let sentCount = 0;
    for (const [clientId, client] of this.clients.entries()) {
      if (client.channels.has(targetChannel)) {
        // Check user preferences if authenticated
        if (client.userId && store.userNotifications[client.userId]) {
          const prefs = store.userNotifications[client.userId].preferences;
          if (prefs[eventType] === false || prefs[category] === false) {
            continue; // User opted out
          }
        }

        try {
          this.sendToClient(client.res, eventType, notification);
          sentCount++;
        } catch (err) {
          console.error(`[SSE] Error sending to client ${clientId}:`, err);
          this.removeClient(clientId);
        }
      }
    }
    
    console.log(`[SSE] Broadcasted ${eventType} on ${targetChannel} to ${sentCount} clients.`);
    return notification;
  }

  sendDirectNotification(userId, eventType, payload, category = 'alert') {
    return this.broadcast(eventType, payload, category, `user_${userId}`);
  }

  sendToClient(res, eventType, data) {
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  
  getHistory() {
    return this.history;
  }
}

const notificationService = new NotificationService();
module.exports = notificationService;
