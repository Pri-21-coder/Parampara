const express = require('express');
const router = express.Router();

const { chatResponse } = require('../controllers/chat.controller');

const HeuristicRateLimiter = require('../middleware/rateLimiter');

// Strict rate limit for AI Chat (15 tokens / 1 min, cost is 3)
const chatLimiter = new HeuristicRateLimiter({
  windowMs: 60000,
  maxTokens: 15,
  message: 'Too many chat messages from this IP, please try again after a minute.'
});

router.post('/', chatLimiter.middleware(), chatResponse);

module.exports = router;
