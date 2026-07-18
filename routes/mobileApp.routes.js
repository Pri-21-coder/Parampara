// routes/mobileApp.routes.js
const express = require('express');
const router = express.Router();
const MobileAppService = require('../server/services/mobileAppService');

let mobileService = null;

const getService = () => {
  if (!mobileService) {
    mobileService = new MobileAppService();
  }
  return mobileService;
};

/**
 * POST /api/mobile/register
 * Register device
 */
router.post('/register', (req, res, next) => {
  try {
    const deviceData = req.body;
    const service = getService();
    const device = service.registerDevice(deviceData);

    res.json({
      success: true,
      device,
      message: 'Device registered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/device/:deviceId
 * Get device
 */
router.get('/device/:deviceId', (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const service = getService();
    const device = service.getDevice(deviceId);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    res.json({
      success: true,
      device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/push/register
 * Register push token
 */
router.post('/push/register', (req, res, next) => {
  try {
    const { userId, token, platform } = req.body;

    if (!userId || !token || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, token, platform'
      });
    }

    const service = getService();
    const pushToken = service.registerPushToken(userId, token, platform);

    res.json({
      success: true,
      pushToken,
      message: 'Push token registered',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/push/send
 * Send push notification
 */
router.post('/push/send', async (req, res, next) => {
  try {
    const { userId, notification } = req.body;

    if (!userId || !notification) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, notification'
      });
    }

    const service = getService();
    const result = await service.sendPushNotification(userId, notification);

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/sync
 * Sync offline data
 */
router.post('/sync', async (req, res, next) => {
  try {
    const { userId, offlineData } = req.body;

    if (!userId || !offlineData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, offlineData'
      });
    }

    const service = getService();
    const result = await service.syncOfflineData(userId, offlineData);

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/sync
 * Get sync queue
 */
router.get('/sync', (req, res, next) => {
  try {
    const { userId } = req.query;
    const service = getService();
    const queue = service.getSyncQueue(userId);

    res.json({
      success: true,
      queue,
      count: queue.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/audio/record
 * Record audio
 */
router.post('/audio/record', async (req, res, next) => {
  try {
    const { userId, audioData } = req.body;

    if (!userId || !audioData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, audioData'
      });
    }

    const service = getService();
    const recording = await service.recordAudio(userId, audioData);

    res.json({
      success: true,
      recording,
      message: 'Audio recorded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/audio
 * Get audio recordings
 */
router.get('/audio', (req, res, next) => {
  try {
    const { userId } = req.query;
    const service = getService();
    const recordings = service.getAudioRecordings(userId);

    res.json({
      success: true,
      recordings,
      count: recordings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/image/upload
 * Upload image
 */
router.post('/image/upload', async (req, res, next) => {
  try {
    const { userId, imageData } = req.body;

    if (!userId || !imageData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, imageData'
      });
    }

    const service = getService();
    const image = await service.uploadImage(userId, imageData);

    res.json({
      success: true,
      image,
      message: 'Image uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/images
 * Get images
 */
router.get('/images', (req, res, next) => {
  try {
    const { userId } = req.query;
    const service = getService();
    const images = service.getImages(userId);

    res.json({
      success: true,
      images,
      count: images.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/offline/download
 * Download offline content
 */
router.post('/offline/download', async (req, res, next) => {
  try {
    const { contentId, userId } = req.body;

    if (!contentId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contentId, userId'
      });
    }

    const service = getService();
    const content = await service.downloadOfflineContent(contentId, userId);

    res.json({
      success: true,
      content,
      message: 'Content downloaded for offline use',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/offline
 * Get offline content
 */
router.get('/offline', (req, res, next) => {
  try {
    const { userId } = req.query;
    const service = getService();
    const content = service.getOfflineContent(userId);

    res.json({
      success: true,
      content,
      count: content.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/mobile/offline/:contentId
 * Delete offline content
 */
router.delete('/offline/:contentId', (req, res, next) => {
  try {
    const { contentId } = req.params;
    const service = getService();
    const result = service.deleteOfflineContent(contentId);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/session/start
 * Start session
 */
router.post('/session/start', (req, res, next) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, deviceId'
      });
    }

    const service = getService();
    const session = service.startSession(userId, deviceId);

    res.json({
      success: true,
      session,
      message: 'Session started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/mobile/session/end
 * End session
 */
router.post('/session/end', (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId'
      });
    }

    const service = getService();
    const session = service.endSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session,
      message: 'Session ended',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/analytics/device
 * Get device analytics
 */
router.get('/analytics/device', (req, res, next) => {
  try {
    const { deviceId } = req.query;
    const service = getService();
    const analytics = service.getDeviceAnalytics(deviceId);

    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/stats
 * Get mobile app statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/mobile/version
 * Get version info
 */
router.get('/version', (req, res, next) => {
  try {
    const service = getService();
    const version = service.getVersionInfo();

    res.json({
      success: true,
      version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
