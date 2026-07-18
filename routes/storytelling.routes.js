// routes/storytelling.routes.js
const express = require('express');
const router = express.Router();
const StorytellingEngineService = require('../server/services/storytellingEngineService');

let storytellingService = null;

const getService = () => {
  if (!storytellingService) {
    storytellingService = new StorytellingEngineService();
  }
  return storytellingService;
};

/**
 * POST /api/story/generate
 * Generate AI story
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { prompt, theme, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt'
      });
    }

    const service = getService();
    const story = await service.generateStory(prompt, theme, style);

    res.json({
      success: true,
      story,
      message: 'Story generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/story/branch
 * Branch story based on choice
 */
router.post('/branch', async (req, res, next) => {
  try {
    const { storyId, choiceId, userId } = req.body;

    if (!storyId || !choiceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storyId, choiceId'
      });
    }

    const service = getService();
    const result = await service.branchStory(storyId, choiceId, userId);

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
 * GET /api/story/:storyId
 * Get story by ID
 */
router.get('/:storyId', (req, res, next) => {
  try {
    const { storyId } = req.params;
    const service = getService();
    const story = service.getStory(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Track read
    service.trackEngagement(storyId, 'read');

    res.json({
      success: true,
      story,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stories
 * Get all stories
 */
router.get('/', (req, res, next) => {
  try {
    const filters = {
      theme: req.query.theme,
      tag: req.query.tag,
      search: req.query.search,
      popular: req.query.popular === 'true',
      recent: req.query.recent === 'true'
    };

    const service = getService();
    const stories = service.getStories(filters);

    res.json({
      success: true,
      stories,
      count: stories.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stories/themes
 * Get story themes
 */
router.get('/themes', (req, res, next) => {
  try {
    const service = getService();
    const themes = service.getThemes();

    res.json({
      success: true,
      themes,
      count: themes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stories/templates
 * Get templates
 */
router.get('/templates', (req, res, next) => {
  try {
    const service = getService();
    const templates = service.getTemplates();

    res.json({
      success: true,
      templates,
      count: templates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stories/user/:userId/choices
 * Get user choices
 */
router.get('/user/:userId/choices', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const choices = service.getUserChoices(userId);

    res.json({
      success: true,
      choices,
      count: choices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stories/analytics
 * Get story analytics
 */
router.get('/analytics', (req, res, next) => {
  try {
    const service = getService();
    const analytics = service.getStoryAnalytics();

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
 * POST /api/story/custom
 * Create custom story
 */
router.post('/custom', (req, res, next) => {
  try {
    const { storyData, userId } = req.body;

    if (!storyData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: storyData, userId'
      });
    }

    const service = getService();
    const story = service.createCustomStory(storyData, userId);

    res.json({
      success: true,
      story,
      message: 'Custom story created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/story/:storyId/branch
 * Add branch to story
 */
router.post('/:storyId/branch', (req, res, next) => {
  try {
    const { storyId } = req.params;
    const branchData = req.body;

    if (!branchData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: branchData'
      });
    }

    const service = getService();
    const story = service.addBranch(storyId, branchData);

    res.json({
      success: true,
      story,
      message: 'Branch added successfully',
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
 * POST /api/story/:storyId/rate
 * Rate story
 */
router.post('/:storyId/rate', (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating (1-5)'
      });
    }

    const service = getService();
    const story = service.rateStory(storyId, rating);

    res.json({
      success: true,
      story,
      message: 'Story rated successfully',
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
 * GET /api/stories/stats
 * Get storytelling statistics
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

module.exports = router;
