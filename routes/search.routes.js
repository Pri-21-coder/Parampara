const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/search.controller');
const { cacheMiddleware } = require('../middleware/lruCache');
const HeuristicRateLimiter = require('../middleware/rateLimiter');

// Rate limiter for search: 60 tokens per minute (heuristic cost is 3 for search)
const searchLimiter = new HeuristicRateLimiter({
  windowMs: 60000,
  maxTokens: 60,
  message: 'Too many search requests, please try again later.'
});

// GET /api/search/index-data
router.get('/index-data', cacheMiddleware, require('../controllers/search.controller').getIndexData);

// GET /api/search?q=query
router.get('/', searchLimiter.middleware(), cacheMiddleware, globalSearch);

module.exports = router;
