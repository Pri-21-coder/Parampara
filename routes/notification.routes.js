const express = require('express');
const router = express.Router();
const notificationService = require('../server/services/notificationService');
const store = require('../data/store');
const { verifyToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

/**
 * GET /api/notifications/stream
 * Establish a Server-Sent Events (SSE) connection.
 * Optionally pass ?token= to authenticate and subscribe to user channels.
 */
router.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  
  let userId = null;
  if (req.query.token) {
    try {
      const decoded = verifyToken(req.query.token);
      userId = decoded.id;
    } catch (err) {
      console.warn('[SSE] Invalid token provided for stream connection');
    }
  }

  notificationService.addClient(clientId, res, userId);

  req.on('close', () => {
    notificationService.removeClient(clientId);
  });
});

/**
 * GET /api/notifications/history
 */
router.get('/history', (req, res) => {
  let readIds = [];
  
  // If authorized, grab synced read state
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      if (store.userNotifications[decoded.id]) {
        readIds = Array.from(store.userNotifications[decoded.id].readIds);
      }
    } catch (e) {
      // ignore
    }
  }

  res.json({
    success: true,
    data: notificationService.getHistory(),
    readIds
  });
});

/**
 * POST /api/notifications/read
 * Sync read state to the backend
 */
router.post('/read', authenticateToken, csrfProtection, (req, res) => {
  const { notificationIds } = req.body; // array of IDs
  if (!Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'notificationIds must be an array' });
  }

  const userId = req.user.id;
  if (!store.userNotifications[userId]) {
    store.userNotifications[userId] = { readIds: new Set(), preferences: {} };
  }

  notificationIds.forEach(id => store.userNotifications[userId].readIds.add(id));

  res.json({ success: true, count: store.userNotifications[userId].readIds.size });
});

/**
 * POST /api/notifications/preferences
 */
router.post('/preferences', authenticateToken, csrfProtection, (req, res) => {
  const { preferences } = req.body;
  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ error: 'Invalid preferences object' });
  }

  const userId = req.user.id;
  if (!store.userNotifications[userId]) {
    store.userNotifications[userId] = { readIds: new Set(), preferences: {} };
  }

  store.userNotifications[userId].preferences = {
    ...store.userNotifications[userId].preferences,
    ...preferences
  };

  res.json({ success: true, preferences: store.userNotifications[userId].preferences });
});

module.exports = router;
