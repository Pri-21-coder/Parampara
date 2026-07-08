// routes/searchEngine.routes.js
const express = require('express');
const router = express.Router();
const SearchEngineService = require('../server/services/searchEngineService');

let searchEngine = null;

const getEngine = () => {
  if (!searchEngine) {
    searchEngine = new SearchEngineService();
  }
  return searchEngine;
};

/**
 * GET /api/search
 * Search content
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, category, limit, sources, recommendations } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: q'
      });
    }

    const engine = getEngine();
    const results = await engine.search(q, {
      category,
      limit: parseInt(limit) || 20,
      sources: sources ? sources.split(',') : ['all'],
      includeRecommendations: recommendations === 'true',
      userId: req.query.userId || 'anonymous'
    });

    res.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions
 */
router.get('/suggestions', (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const engine = getEngine();
    const suggestions = engine.getSuggestions(q);

    res.json({
      success: true,
      query: q,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/popular
 * Get popular searches
 */
router.get('/popular', (req, res, next) => {
  try {
    const engine = getEngine();
    const popular = engine.popularSearches;

    res.json({
      success: true,
      popular,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/analytics
 * Get search analytics
 */
router.get('/analytics', (req, res, next) => {
  try {
    const { period } = req.query;
    const engine = getEngine();
    const analytics = engine.getAnalytics(period);

    res.json({
      success: true,
      ...analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/stats
 * Get search stats
 */
router.get('/stats', (req, res, next) => {
  try {
    const engine = getEngine();
    const stats = engine.getStats();

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
 * POST /api/search/image
 * Image search
 */
router.post('/image', async (req, res, next) => {
  try {
    const { imageUrl, category, limit } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: imageUrl'
      });
    }

    const engine = getEngine();
    const results = await engine.imageSearch(imageUrl, {
      category,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/voice
 * Voice search
 */
router.post('/voice', async (req, res, next) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: audioData'
      });
    }

    const engine = getEngine();
    const results = await engine.voiceSearch(audioData);

    res.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/rebuild
 * Rebuild search index
 */
router.post('/rebuild', async (req, res, next) => {
  try {
    const engine = getEngine();
    const result = await engine.rebuildIndex();

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;