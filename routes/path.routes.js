const express = require('express');

const router = express.Router();

const {
  createPath,
  getPaths,
  getPathThemes,
  getOptimizedRoute,
} = require('../controllers/path.controller');
const { cacheMiddleware } = require('../middleware/lruCache');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET /api/paths/themes — must be before any :id-style routes
router.get('/themes', cacheMiddleware, getPathThemes);

// GET /api/paths/route — route computation
router.get('/route', cacheMiddleware, getOptimizedRoute);

router.get('/', cacheMiddleware, getPaths);

router.post('/', authenticateToken, requirePermission('create:items'), createPath);

module.exports = router;
