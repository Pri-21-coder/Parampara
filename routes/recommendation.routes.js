// routes/recommendation.routes.js
const express = require('express');
const router = express.Router();
const RecommendationEngine = require('../server/services/recommendationEngine');

let recommendationEngine = null;

// Initialize recommendation engine
const getEngine = async () => {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine();
    await recommendationEngine.trainModel();
  }
  return recommendationEngine;
};

/**
 * GET /api/recommendations/contents/:userId
 * Get personalized recommendations for a user
 */
router.get('/contents/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const engine = await getEngine();
    
    // Check cache first
    let recommendations = await engine.getCachedRecommendations(userId);
    
    if (!recommendations) {
      recommendations = await engine.getRecommendations(userId, parseInt(limit));
    }
    
    res.json({
      success: true,
      userId,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/recommendations/feedback
 * Track user feedback for recommendations
 */
router.post('/feedback', async (req, res, next) => {
  try {
    const { userId, contentId, action, metadata } = req.body;
    
    if (!userId || !contentId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, contentId, action'
      });
    }
    
    const engine = await getEngine();
    const interaction = await engine.trackInteraction(userId, contentId, action, metadata);
    
    res.json({
      success: true,
      message: 'Feedback tracked successfully',
      interaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recommendations/similar/:contentId
 * Get similar content to specific item
 */
router.get('/similar/:contentId', async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const { limit = 5 } = req.query;
    
    const engine = await getEngine();
    const similar = await engine.getSimilarContent(contentId, parseInt(limit));
    
    res.json({
      success: true,
      contentId,
      similar,
      count: similar.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/recommendations/train
 * Retrain the recommendation model
 */
router.post('/train', async (req, res, next) => {
  try {
    const engine = await getEngine();
    const result = await engine.trainModel();
    
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
 * GET /api/recommendations/metrics
 * Get engagement metrics
 */
router.get('/metrics', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const engine = await getEngine();
    const metrics = await engine.getEngagementMetrics(
      startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate || new Date().toISOString()
    );
    
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recommendations/stats
 * Get model statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const engine = await getEngine();
    const stats = engine.getModelStats();
    
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