// routes/gamification.routes.js
const express = require('express');
const router = express.Router();
const GamificationService = require('../server/services/gamificationService');

let gamificationService = null;

const getService = () => {
  if (!gamificationService) {
    gamificationService = new GamificationService();
  }
  return gamificationService;
};

/**
 * GET /api/gamification/progress/:userId
 * Get user progress
 */
router.get('/progress/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const progress = service.getUserProgress(userId);

    res.json({
      success: true,
      progress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/gamification/action
 * Track user action
 */
router.post('/action', (req, res, next) => {
  try {
    const { userId, action, metadata } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, action'
      });
    }

    const service = getService();
    const progress = service.trackAction(userId, action, metadata);

    res.json({
      success: true,
      progress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gamification/achievements/:userId
 * Get user achievements
 */
router.get('/achievements/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const achievements = service.getUserAchievements(userId);

    res.json({
      success: true,
      achievements,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', (req, res, next) => {
  try {
    const { region, limit = 100 } = req.query;
    const service = getService();
    const leaderboard = service.getLeaderboard(region, parseInt(limit));

    res.json({
      success: true,
      leaderboard,
      count: leaderboard.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/gamification/artifact
 * Collect digital artifact
 */
router.post('/artifact', (req, res, next) => {
  try {
    const { userId, artifactId } = req.body;

    if (!userId || !artifactId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, artifactId'
      });
    }

    const service = getService();
    const artifact = service.getDigitalArtifact(userId, artifactId);

    res.json({
      success: true,
      artifact,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gamification/badges
 * Get all badges
 */
router.get('/badges', (req, res, next) => {
  try {
    const service = getService();
    const badges = service.badges;

    res.json({
      success: true,
      badges,
      count: badges.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gamification/challenges
 * Get available challenges
 */
router.get('/challenges/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const challenges = service.getAvailableChallenges(userId);

    res.json({
      success: true,
      challenges,
      count: challenges.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/gamification/stats
 * Get gamification statistics
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

module.exports = router;