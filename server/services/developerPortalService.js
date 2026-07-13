// services/developerPortalService.js
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class DeveloperPortalService {
  constructor() {
    this.developers = [];
    this.apiKeys = [];
    this.apiUsage = new Map();
    this.webhooks = [];
    this.apiMetrics = [];
    this.rateLimits = new Map();
    this.documents = [];
    
    this.init();
  }

  init() {
    this.loadSampleDevelopers();
    this.loadSampleAPIKeys();
    this.loadSampleWebhooks();
    this.loadAPIDocumentation();
    console.log('✅ Developer Portal Service initialized');
  }

  loadSampleDevelopers() {
    this.developers = [
      {
        id: 'dev_1',
        name: 'Heritage App Developer',
        email: 'dev1@example.com',
        company: 'Heritage Tech',
        website: 'https://heritagetech.example.com',
        status: 'active',
        plan: 'premium',
        apiKeys: [],
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'dev_2',
        name: 'Cultural Data Analyst',
        email: 'dev2@example.com',
        company: 'Data Insights Inc',
        website: 'https://datainsights.example.com',
        status: 'active',
        plan: 'basic',
        apiKeys: [],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'dev_3',
        name: 'Rural Tourism Platform',
        email: 'dev3@example.com',
        company: 'Rural Connect',
        website: 'https://ruralconnect.example.com',
        status: 'pending',
        plan: 'basic',
        apiKeys: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadSampleAPIKeys() {
    this.apiKeys = [
      {
        id: 'key_1',
        developerId: 'dev_1',
        key: this.generateAPIKey(),
        name: 'Production API Key',
        status: 'active',
        rateLimit: 1000,
        requests: 12345,
        createdAt: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'key_2',
        developerId: 'dev_1',
        key: this.generateAPIKey(),
        name: 'Development API Key',
        status: 'active',
        rateLimit: 100,
        requests: 234,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'key_3',
        developerId: 'dev_2',
        key: this.generateAPIKey(),
        name: 'Data Analysis Key',
        status: 'active',
        rateLimit: 500,
        requests: 4567,
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadSampleWebhooks() {
    this.webhooks = [
      {
        id: 'webhook_1',
        developerId: 'dev_1',
        url: 'https://heritagetech.example.com/webhook',
        events: ['content.created', 'content.updated', 'content.deleted'],
        active: true,
        secret: this.generateWebhookSecret(),
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'webhook_2',
        developerId: 'dev_2',
        url: 'https://datainsights.example.com/webhook',
        events: ['content.created'],
        active: true,
        secret: this.generateWebhookSecret(),
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadAPIDocumentation() {
    this.documents = [
      {
        id: 'doc_1',
        title: 'Getting Started',
        description: 'Learn how to get started with the Parampara API',
        category: 'guide',
        content: '# Getting Started\n\nWelcome to the Parampara API...',
        version: '1.0.0',
        publishedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc_2',
        title: 'Authentication',
        description: 'How to authenticate your API requests',
        category: 'guide',
        content: '# Authentication\n\nUse your API key to authenticate...',
        version: '1.0.0',
        publishedAt: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc_3',
        title: 'API Reference',
        description: 'Complete API reference with examples',
        category: 'reference',
        content: '# API Reference\n\n## Endpoints\n\n...',
        version: '1.0.0',
        publishedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Generate API key
   */
  generateAPIKey() {
    const prefix = 'pk_';
    const random = crypto.randomBytes(32).toString('hex');
    return prefix + random;
  }

  /**
   * Generate webhook secret
   */
  generateWebhookSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Register developer
   */
  registerDeveloper(developerData) {
    const developer = {
      id: `dev_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...developerData,
      status: 'pending',
      plan: 'basic',
      apiKeys: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.developers.push(developer);
    
    // Auto-generate API key
    const apiKey = this.createAPIKey(developer.id, 'Default API Key');
    developer.apiKeys.push(apiKey.id);

    return { developer, apiKey };
  }

  /**
   * Create API key
   */
  createAPIKey(developerId, name) {
    const developer = this.getDeveloper(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    const apiKey = {
      id: `key_${Date.now()}_${uuidv4().slice(0, 8)}`,
      developerId,
      key: this.generateAPIKey(),
      name: name || 'API Key',
      status: 'active',
      rateLimit: this.getRateLimit(developer.plan),
      requests: 0,
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    this.apiKeys.push(apiKey);
    developer.apiKeys.push(apiKey.id);
    developer.updatedAt = new Date().toISOString();

    return apiKey;
  }

  /**
   * Get rate limit for plan
   */
  getRateLimit(plan) {
    const limits = {
      basic: 100,
      premium: 1000,
      enterprise: 10000
    };
    return limits[plan] || 100;
  }

  /**
   * Get developer by ID
   */
  getDeveloper(developerId) {
    return this.developers.find(d => d.id === developerId);
  }

  /**
   * Get developer by API key
   */
  getDeveloperByAPIKey(apiKey) {
    const key = this.apiKeys.find(k => k.key === apiKey && k.status === 'active');
    if (!key) return null;
    return this.getDeveloper(key.developerId);
  }

  /**
   * Get API key by key
   */
  getAPIKey(apiKey) {
    return this.apiKeys.find(k => k.key === apiKey);
  }

  /**
   * Validate API key
   */
  validateAPIKey(apiKey) {
    const key = this.getAPIKey(apiKey);
    if (!key) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (key.status !== 'active') {
      return { valid: false, error: 'API key is not active' };
    }

    // Check rate limit
    const usage = this.apiUsage.get(apiKey) || { count: 0, resetAt: Date.now() + 3600000 };
    if (usage.count >= key.rateLimit) {
      return { valid: false, error: 'Rate limit exceeded' };
    }

    return { valid: true, key, developer: this.getDeveloper(key.developerId) };
  }

  /**
   * Track API usage
   */
  trackUsage(apiKey, endpoint, method, statusCode, responseTime) {
    const key = this.getAPIKey(apiKey);
    if (!key) return;

    // Update usage
    key.requests = (key.requests || 0) + 1;
    key.lastUsed = new Date().toISOString();

    // Update rate limit tracking
    if (!this.apiUsage.has(apiKey)) {
      this.apiUsage.set(apiKey, {
        count: 0,
        resetAt: Date.now() + 3600000 // 1 hour
      });
    }

    const usage = this.apiUsage.get(apiKey);
    usage.count++;

    // Track metrics
    const metric = {
      apiKey,
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: new Date().toISOString()
    };

    this.apiMetrics.push(metric);

    // Keep only last 10,000 metrics
    if (this.apiMetrics.length > 10000) {
      this.apiMetrics = this.apiMetrics.slice(-10000);
    }

    return { usage, metric };
  }

  /**
   * Get API usage stats
   */
  getUsageStats(apiKey = null) {
    if (apiKey) {
      const key = this.getAPIKey(apiKey);
      if (!key) return null;

      const metrics = this.apiMetrics.filter(m => m.apiKey === apiKey);
      const totalRequests = metrics.length;
      const successRate = metrics.filter(m => m.statusCode < 400).length / (totalRequests || 1) * 100;
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / (totalRequests || 1);

      return {
        apiKey,
        developerId: key.developerId,
        totalRequests,
        successRate: Math.round(successRate),
        avgResponseTime: Math.round(avgResponseTime),
        rateLimit: key.rateLimit,
        used: this.apiUsage.get(apiKey)?.count || 0,
        remaining: key.rateLimit - (this.apiUsage.get(apiKey)?.count || 0)
      };
    }

    // Overall stats
    const totalRequests = this.apiMetrics.length;
    const successRate = this.apiMetrics.filter(m => m.statusCode < 400).length / (totalRequests || 1) * 100;
    const avgResponseTime = this.apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / (totalRequests || 1);

    const topEndpoints = this.getTopEndpoints();
    const topDevelopers = this.getTopDevelopers();

    return {
      totalRequests,
      successRate: Math.round(successRate),
      avgResponseTime: Math.round(avgResponseTime),
      totalDevelopers: this.developers.length,
      totalAPIKeys: this.apiKeys.length,
      topEndpoints,
      topDevelopers,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get top endpoints
   */
  getTopEndpoints(limit = 5) {
    const endpointCount = {};
    this.apiMetrics.forEach(m => {
      endpointCount[m.endpoint] = (endpointCount[m.endpoint] || 0) + 1;
    });

    return Object.entries(endpointCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  /**
   * Get top developers
   */
  getTopDevelopers(limit = 5) {
    const developerCount = {};
    this.apiMetrics.forEach(m => {
      const key = this.getAPIKey(m.apiKey);
      if (key) {
        developerCount[key.developerId] = (developerCount[key.developerId] || 0) + 1;
      }
    });

    return Object.entries(developerCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([developerId, count]) => {
        const developer = this.getDeveloper(developerId);
        return { developer: developer?.name || developerId, count };
      });
  }

  /**
   * Create webhook
   */
  createWebhook(developerId, webhookData) {
    const developer = this.getDeveloper(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    const webhook = {
      id: `webhook_${Date.now()}_${uuidv4().slice(0, 8)}`,
      developerId,
      ...webhookData,
      active: true,
      secret: this.generateWebhookSecret(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastTriggered: null
    };

    this.webhooks.push(webhook);
    return webhook;
  }

  /**
   * Get webhooks
   */
  getWebhooks(developerId = null) {
    if (developerId) {
      return this.webhooks.filter(w => w.developerId === developerId);
    }
    return this.webhooks;
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(webhookId, event, data) {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    if (!webhook.active) {
      throw new Error('Webhook is not active');
    }

    if (!webhook.events.includes(event)) {
      throw new Error('Event not supported by webhook');
    }

    // In production: send HTTP request to webhook URL
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString()
    };

    console.log(`🔔 Triggering webhook ${webhook.id} for event ${event}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    webhook.lastTriggered = new Date().toISOString();
    webhook.updatedAt = new Date().toISOString();

    return { success: true, webhook, payload };
  }

  /**
   * Update webhook
   */
  updateWebhook(webhookId, updates) {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    Object.assign(webhook, updates);
    webhook.updatedAt = new Date().toISOString();
    return webhook;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId) {
    const index = this.webhooks.findIndex(w => w.id === webhookId);
    if (index === -1) {
      throw new Error('Webhook not found');
    }
    return this.webhooks.splice(index, 1)[0];
  }

  /**
   * Get API documentation
   */
  getAPIDocumentation(category = null) {
    if (category) {
      return this.documents.filter(d => d.category === category);
    }
    return this.documents;
  }

  /**
   * Create documentation
   */
  createDocumentation(docData) {
    const doc = {
      id: `doc_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...docData,
      version: docData.version || '1.0.0',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.documents.push(doc);
    return doc;
  }

  /**
   * Update documentation
   */
  updateDocumentation(docId, updates) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) {
      throw new Error('Documentation not found');
    }

    Object.assign(doc, updates);
    doc.updatedAt = new Date().toISOString();
    return doc;
  }

  /**
   * Get API metrics
   */
  getAPIMetrics(filters = {}) {
    let metrics = [...this.apiMetrics];

    if (filters.apiKey) {
      metrics = metrics.filter(m => m.apiKey === filters.apiKey);
    }

    if (filters.startDate) {
      metrics = metrics.filter(m => new Date(m.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      metrics = metrics.filter(m => new Date(m.timestamp) <= new Date(filters.endDate));
    }

    return metrics;
  }

  /**
   * Get API analytics
   */
  getAPIAnalytics(period = 'day') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }

    const metrics = this.apiMetrics.filter(m => new Date(m.timestamp) >= startDate);
    const total = metrics.length;

    // Status distribution
    const statusDistribution = {};
    metrics.forEach(m => {
      const status = m.statusCode < 400 ? 'success' : 'error';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Response time distribution
    const avgResponseTime = total > 0 ? 
      metrics.reduce((sum, m) => sum + m.responseTime, 0) / total : 0;

    // Endpoint usage
    const endpointUsage = {};
    metrics.forEach(m => {
      endpointUsage[m.endpoint] = (endpointUsage[m.endpoint] || 0) + 1;
    });

    return {
      period,
      totalRequests: total,
      statusDistribution,
      avgResponseTime: Math.round(avgResponseTime),
      endpointUsage: Object.entries(endpointUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get developer portal statistics
   */
  getStats() {
    const totalDevelopers = this.developers.length;
    const activeDevelopers = this.developers.filter(d => d.status === 'active').length;
    const totalAPIKeys = this.apiKeys.length;
    const activeKeys = this.apiKeys.filter(k => k.status === 'active').length;
    const totalWebhooks = this.webhooks.length;
    const activeWebhooks = this.webhooks.filter(w => w.active).length;
    const totalDocs = this.documents.length;

    const totalRequests = this.apiMetrics.length;
    const avgResponseTime = totalRequests > 0 ?
      this.apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests : 0;

    return {
      totalDevelopers,
      activeDevelopers,
      totalAPIKeys,
      activeKeys,
      totalWebhooks,
      activeWebhooks,
      totalDocs,
      totalAPICalls: totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      topDevelopers: this.getTopDevelopers(3),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = DeveloperPortalService;