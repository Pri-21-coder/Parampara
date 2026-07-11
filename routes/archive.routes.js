
// routes/archive.routes.js
const express = require('express');
const router = express.Router();
const CommunityArchiveService = require('../server/services/communityArchiveService');
const archiveController = require('../controllers/archive.controller');

let archiveService = null;

/**
 * Lazy-initializer helper for the CommunityArchiveService instance.
 * @returns {CommunityArchiveService} The archive service instance.
 */
const getService = () => {
  if (!archiveService) {
    archiveService = new CommunityArchiveService();
  }
  return archiveService;
};

/**
 * Express middleware helper to validate required request body fields.
 * @param {string[]} fields - Array of required body parameter names.
 * @returns {Function} Express middleware callback.
 */
const validateBody = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body || req.body[field] === undefined);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
};

/**
 * @openapi
 * /api/archive/memory:
 *   post:
 *     summary: Submit a new cultural memory
 *     description: Registers a new digital archive memory under the specified contributor ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memoryData, userId]
 *             properties:
 *               memoryData:
 *                 type: object
 *               userId:
 *                 type: string
 */
router.post('/memory', validateBody(['memoryData', 'userId']), async (req, res, next) => {
  try {
    const { memoryData, userId } = req.body;
    const service = getService();
    const memory = await service.submitMemory(memoryData, userId);

    res.json({
      success: true,
      memory,
      message: 'Memory submitted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @openapi
 * /api/archive/memories:
 *   get:
 *     summary: Retrieve cultural memories
 *     description: Fetches archived memory records filtered by query parameters.
 */
router.get('/memories', (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      search: req.query.search,
      location: req.query.location,
      sortBy: req.query.sortBy
    };

    const service = getService();
    const memories = service.getMemories(filters);

    res.json({
      success: true,
      memories,
      count: memories.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/memory/{memoryId}:
 *   get:
 *     summary: Get single memory by ID
 */
router.get('/memory/:memoryId', (req, res, next) => {
  try {
    const { memoryId } = req.params;
    const service = getService();
    const memory = service.getMemory(memoryId);

    if (!memory) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found'
      });
    }

    res.json({
      success: true,
      memory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/memory/{memoryId}/vote:
 *   post:
 *     summary: Upvote or downvote a memory
 */
router.post('/memory/:memoryId/vote', validateBody(['userId', 'voteType']), (req, res, next) => {
  try {
    const { memoryId } = req.params;
    const { userId, voteType } = req.body;
    const service = getService();
    const memory = service.voteMemory(memoryId, userId, voteType);

    res.json({
      success: true,
      memory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @openapi
 * /api/archive/queue:
 *   get:
 *     summary: Retrieve verification queue
 */
router.get('/queue', (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority ? parseInt(req.query.priority) : null
    };

    const service = getService();
    const queue = service.getVerificationQueue(filters);

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
 * @openapi
 * /api/archive/verify:
 *   post:
 *     summary: Perform verification reviews
 */
router.post('/verify', validateBody(['memoryId', 'expertId', 'decision']), async (req, res, next) => {
  try {
    const { memoryId, expertId, decision, notes } = req.body;
    const service = getService();
    const memory = await service.verifyMemory(memoryId, expertId, decision, notes);

    res.json({
      success: true,
      memory,
      message: `Memory ${decision}ed successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @openapi
 * /api/archive/exhibitions:
 *   get:
 *     summary: Retrieve digital exhibitions
 */
router.get('/exhibitions', (req, res, next) => {
  try {
    const filters = {
      status: req.query.status
    };

    const service = getService();
    const exhibitions = service.getExhibitions(filters);

    res.json({
      success: true,
      exhibitions,
      count: exhibitions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/timelines:
 *   get:
 *     summary: Retrieve timelines linked to memory
 */
router.get('/timelines', (req, res, next) => {
  try {
    const { memoryId } = req.query;
    const service = getService();
    const timelines = service.getTimelines(memoryId);

    res.json({
      success: true,
      timelines,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/categories:
 *   get:
 *     summary: List memory categories
 */
router.get('/categories', (req, res, next) => {
  try {
    const service = getService();
    const categories = service.archiveCategories;

    res.json({
      success: true,
      categories,
      count: categories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/stats:
 *   get:
 *     summary: Retrieve archive statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getStatistics();

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
 * @openapi
 * /api/archive/preservation:
 *   get:
 *     summary: Get digital preservation score/metrics
 */
router.get('/preservation', (req, res, next) => {
  try {
    const service = getService();
    const status = service.getPreservationStatus();

    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/backup:
 *   post:
 *     summary: Trigger backup snapshot
 */
router.post('/backup', async (req, res, next) => {
  try {
    const service = getService();
    const backup = await service.createBackup();

    res.json({
      success: true,
      backup,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/restore:
 *   post:
 *     summary: Restore database state from backup ID
 */
router.post('/restore', validateBody(['backupId']), async (req, res, next) => {
  try {
    const { backupId } = req.body;
    const service = getService();
    const backup = await service.restoreFromBackup(backupId);

    res.json({
      success: true,
      backup,
      message: 'Restore successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @openapi
 * /api/archive/search:
 *   get:
 *     summary: Full text search query
 */
router.get('/search', (req, res, next) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: q'
      });
    }

    const service = getService();
    const results = service.searchArchive(q, { limit: parseInt(limit) || 50 });

    res.json({
      success: true,
      query: q,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/archive/keys:
 *   post:
 *     summary: Register p2p key
 */
router.post('/keys', archiveController.registerPublicKey);

/**
 * @openapi
 * /api/archive/keys/{userId}:
 *   get:
 *     summary: Retrieve public key by user ID
 */
router.get('/keys/:userId', archiveController.getPublicKey);

/**
 * @openapi
 * /api/archive/keys:
 *   get:
 *     summary: Get all active public keys
 */
router.get('/keys', archiveController.getAllPublicKeys);

/**
 * @openapi
 * /api/archive/:
 *   post:
 *     summary: Create new archive registry
 */
router.post('/', archiveController.createArchive);

/**
 * @openapi
 * /api/archive/:
 *   get:
 *     summary: List accessible local archives
 */
router.get('/', archiveController.getAccessibleArchives);

module.exports = router;

