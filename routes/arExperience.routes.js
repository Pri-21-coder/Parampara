// routes/arExperience.routes.js
const express = require('express');
const router = express.Router();
const ARExperienceService = require('../server/services/arExperienceService');

let arService = null;

const getService = () => {
  if (!arService) {
    arService = new ARExperienceService();
  }
  return arService;
};

/**
 * GET /api/ar/load-scene
 * Load AR scene for a location
 */
router.get('/load-scene', (req, res, next) => {
  try {
    const { locationId, userId } = req.query;

    if (!locationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: locationId'
      });
    }

    const service = getService();
    const scene = service.loadARScene(locationId, userId);

    res.json({
      success: true,
      ...scene,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ar/recognize
 * Recognize landmark from image
 */
router.post('/recognize', async (req, res, next) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: imageData'
      });
    }

    const service = getService();
    const result = await service.recognizeLandmark(imageData);

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
 * POST /api/ar/session/update
 * Update AR session
 */
router.post('/session/update', (req, res, next) => {
  try {
    const { sessionId, position, rotation } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId'
      });
    }

    const service = getService();
    const session = service.updateARSession(sessionId, position, rotation);

    res.json({
      success: true,
      session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ar/interact
 * Interact with AR element
 */
router.post('/interact', (req, res, next) => {
  try {
    const { sessionId, elementId, interactionType } = req.body;

    if (!sessionId || !elementId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, elementId'
      });
    }

    const service = getService();
    const result = service.interactWithARElement(sessionId, elementId, interactionType);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ar/treasure-hunt
 * Create treasure hunt
 */
router.post('/treasure-hunt', (req, res, next) => {
  try {
    const data = req.body;
    const service = getService();
    const hunt = service.createARTreasureHunt(data);

    res.json({
      success: true,
      hunt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ar/treasure-hunt/join
 * Join treasure hunt
 */
router.post('/treasure-hunt/join', (req, res, next) => {
  try {
    const { huntId, userId } = req.body;

    if (!huntId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: huntId, userId'
      });
    }

    const service = getService();
    const result = service.joinARTreasureHunt(huntId, userId);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ar/treasure-hunt/clue
 * Submit clue answer
 */
router.post('/treasure-hunt/clue', (req, res, next) => {
  try {
    const { huntId, userId, clueId, answer } = req.body;

    if (!huntId || !userId || !clueId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: huntId, userId, clueId, answer'
      });
    }

    const service = getService();
    const result = service.submitClueAnswer(huntId, userId, clueId, answer);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ar/share
 * Share AR photo
 */
router.post('/share', async (req, res, next) => {
  try {
    const { sessionId, photoData, caption } = req.body;

    if (!sessionId || !photoData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, photoData'
      });
    }

    const service = getService();
    const share = await service.shareARPhoto(sessionId, photoData, caption);

    res.json({
      success: true,
      share,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ar/shares
 * Get AR shares
 */
router.get('/shares', (req, res, next) => {
  try {
    const { userId, lat, lng, limit } = req.query;

    const filters = {};
    if (userId) filters.userId = userId;
    if (lat && lng) filters.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    if (limit) filters.limit = parseInt(limit);

    const service = getService();
    const shares = service.getARShares(filters);

    res.json({
      success: true,
      shares,
      count: shares.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ar/landmarks
 * Get all landmarks
 */
router.get('/landmarks', (req, res, next) => {
  try {
    const service = getService();
    const landmarks = service.getLandmarks();

    res.json({
      success: true,
      landmarks,
      count: landmarks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ar/scenes
 * Get historical scenes
 */
router.get('/scenes', (req, res, next) => {
  try {
    const service = getService();
    const scenes = service.getHistoricalScenes();

    res.json({
      success: true,
      scenes,
      count: scenes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ar/assets
 * Get AR assets
 */
router.get('/assets', (req, res, next) => {
  try {
    const service = getService();
    const assets = service.getARAssets();

    res.json({
      success: true,
      assets,
      count: assets.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ar/stats
 * Get AR statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getARStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
