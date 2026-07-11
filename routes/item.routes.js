const express = require('express');

const router = express.Router();

const { getItems, createItem, deleteItem } = require('../controllers/item.controller');
const moderateContent = require('../middleware/moderation');
const { cacheMiddleware } = require('../middleware/lruCache');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { verifyOwnership } = require('../middleware/ownership');

const HeuristicRateLimiter = require('../middleware/rateLimiter');

// Strict rate limit for creating items (20 tokens / 1 min)
const createItemLimiter = new HeuristicRateLimiter({
  windowMs: 60000,
  maxTokens: 20,
  message: 'Too many item creation requests from this IP, please try again after a minute.'
});

router.get('/', cacheMiddleware, getItems);

router.post(
  '/',
  authenticateToken,
  requirePermission('create:items'),
  createItemLimiter.middleware(),
  moderateContent({ action: 'block', fields: ['title', 'description', 'location'] }),
  createItem
);

router.delete(
  '/:id',
  authenticateToken,
  verifyOwnership('culturalItems'),
  deleteItem
);

module.exports = router;
