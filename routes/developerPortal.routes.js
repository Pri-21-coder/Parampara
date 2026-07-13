// routes/developerPortal.routes.js
const express = require('express');
const router = express.Router();
const DeveloperPortalService = require('../services/developerPortalService');

let portalService = null;

const getService = () => {
  if (!portalService) {
    portalService = new DeveloperPortalService();
  }
  return portalService;
};

// ==================== API KEY MIDDLEWARE ====================

const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    });
  }

  const service = getService();
  const validation = service.validateAPIKey(apiKey);
  
  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      error: validation.error
    });
  }

  // Track usage
  const startTime = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    service.trackUsage(apiKey, req.path, req.method, res.statusCode, responseTime);
  });

  req.apiKey = apiKey;
  req.developer = validation.developer;
  next();
};

// ==================== DEVELOPER MANAGEMENT ====================

/**
 * POST /api/developer/register
 * Register developer
 */
router.post('/register', (req, res, next) => {
  try {
    const developerData = req.body;
    const service = getService();
    const result = service.registerDeveloper(developerData);

    res.json({
      success: true,
      ...result,
      message: 'Developer registered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/developer/:developerId
 * Get developer by ID
 */
router.get('/:developerId', (req, res, next) => {
  try {
    const { developerId } = req.params;
    const service = getService();
    const developer = service.getDeveloper(developerId);

    if (!developer) {
      return res.status(404).json({
        success: false,
        error: 'Developer not found'
      });
    }

    res.json({
      success: true,
      developer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/developer/developers
 * Get all developers
 */
router.get('/developers', (req, res, next) => {
  try {
    const service = getService();
    const developers = service.developers;

    res.json({
      success: true,
      developers,
      count: developers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// ==================== API KEY MANAGEMENT ====================

/**
 * POST /api/developer/key
 * Create API key
 */
router.post('/key', (req, res, next) => {
  try {
    const { developerId, name } = req.body;

    if (!developerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: developerId'
      });
    }

    const service = getService();
    const apiKey = service.createAPIKey(developerId, name);

    res.json({
      success: true,
      apiKey,
      message: 'API key created successfully',
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
 * GET /api/developer/keys/:developerId
 * Get developer API keys
 */
router.get('/keys/:developerId', (req, res, next) => {
  try {
    const { developerId } = req.params;
    const service = getService();
    const developer = service.getDeveloper(developerId);

    if (!developer) {
      return res.status(404).json({
        success: false,
        error: 'Developer not found'
      });
    }

    const keys = service.apiKeys.filter(k => k.developerId === developerId);

    res.json({
      success: true,
      keys,
      count: keys.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/developer/key/:keyId
 * Update API key
 */
router.put('/key/:keyId', (req, res, next) => {
  try {
    const { keyId } = req.params;
    const { name, status } = req.body;

    const service = getService();
    const key = service.apiKeys.find(k => k.id === keyId);

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    if (name) key.name = name;
    if (status) key.status = status;

    res.json({
      success: true,
      key,
      message: 'API key updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/developer/key/:keyId
 * Delete API key
 */
router.delete('/key/:keyId', (req, res, next) => {
  try {
    const { keyId } = req.params;
    const service = getService();
    const index = service.apiKeys.findIndex(k => k.id === keyId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    const key = service.apiKeys.splice(index, 1)[0];

    res.json({
      success: true,
      message: 'API key deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// ==================== WEBHOOK MANAGEMENT ====================

/**
 * POST /api/developer/webhook
 * Create webhook
 */
router.post('/webhook', (req, res, next) => {
  try {
    const { developerId, webhookData } = req.body;

    if (!developerId || !webhookData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: developerId, webhookData'
      });
    }

    const service = getService();
    const webhook = service.createWebhook(developerId, webhookData);

    res.json({
      success: true,
      webhook,
      message: 'Webhook created successfully',
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
 * GET /api/developer/webhooks/:developerId
 * Get webhooks
 */
router.get('/webhooks/:developerId', (req, res, next) => {
  try {
    const { developerId } = req.params;
    const service = getService();
    const webhooks = service.getWebhooks(developerId);

    res.json({
      success: true,
      webhooks,
      count: webhooks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/developer/webhook/:webhookId
 * Update webhook
 */
router.put('/webhook/:webhookId', (req, res, next) => {
  try {
    const { webhookId } = req.params;
    const updates = req.body;
    const service = getService();
    const webhook = service.updateWebhook(webhookId, updates);

    res.json({
      success: true,
      webhook,
      message: 'Webhook updated successfully',
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
 * DELETE /api/developer/webhook/:webhookId
 * Delete webhook
 */
router.delete('/webhook/:webhookId', (req, res, next) => {
  try {
    const { webhookId } = req.params;
    const service = getService();
    const webhook = service.deleteWebhook(webhookId);

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
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
 * POST /api/developer/webhook/trigger
 * Trigger webhook
 */
router.post('/webhook/trigger', async (req, res, next) => {
  try {
    const { webhookId, event, data } = req.body;

    if (!webhookId || !event) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: webhookId, event'
      });
    }

    const service = getService();
    const result = await service.triggerWebhook(webhookId, event, data);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== USAGE & ANALYTICS ====================

/**
 * GET /api/developer/usage/:apiKey
 * Get usage stats
 */
router.get('/usage/:apiKey', (req, res, next) => {
  try {
    const { apiKey } = req.params;
    const service = getService();
    const stats = service.getUsageStats(apiKey);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

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
 * GET /api/developer/analytics
 * Get API analytics
 */
router.get('/analytics', (req, res, next) => {
  try {
    const { period } = req.query;
    const service = getService();
    const analytics = service.getAPIAnalytics(period);

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
 * GET /api/developer/metrics
 * Get API metrics
 */
router.get('/metrics', (req, res, next) => {
  try {
    const filters = {
      apiKey: req.query.apiKey,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const service = getService();
    const metrics = service.getAPIMetrics(filters);

    res.json({
      success: true,
      metrics,
      count: metrics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// ==================== DOCUMENTATION ====================

/**
 * GET /api/developer/docs
 * Get API documentation
 */
router.get('/docs', (req, res, next) => {
  try {
    const { category } = req.query;
    const service = getService();
    const docs = service.getAPIDocumentation(category);

    res.json({
      success: true,
      docs,
      count: docs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/developer/docs
 * Create documentation
 */
router.post('/docs', (req, res, next) => {
  try {
    const docData = req.body;
    const service = getService();
    const doc = service.createDocumentation(docData);

    res.json({
      success: true,
      doc,
      message: 'Documentation created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/developer/docs/:docId
 * Update documentation
 */
router.put('/docs/:docId', (req, res, next) => {
  try {
    const { docId } = req.params;
    const updates = req.body;
    const service = getService();
    const doc = service.updateDocumentation(docId, updates);

    res.json({
      success: true,
      doc,
      message: 'Documentation updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/developer/stats
 * Get portal statistics
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

// ==================== PUBLIC API ENDPOINTS (with auth) ====================

/**
 * GET /api/developer/data/items
 * Public API - Get cultural items
 */
router.get('/data/items', validateAPIKey, (req, res, next) => {
  try {
    // In production: fetch from database
    const items = [
      { id: '1', name: 'Kantha Embroidery', category: 'craft' },
      { id: '2', name: 'Dokra Metal Casting', category: 'craft' }
    ];

    res.json({
      success: true,
      data: items,
      count: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/developer/data/stories
 * Public API - Get stories
 */
router.get('/data/stories', validateAPIKey, (req, res, next) => {
  try {
    const stories = [
      { id: '1', title: 'The Legend of the Lost Temple', theme: 'mythology' },
      { id: '2', title: 'The Weaver\'s Secret', theme: 'cultural' }
    ];

    res.json({
      success: true,
      data: stories,
      count: stories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;