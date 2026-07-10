const express = require('express');

const router = express.Router();

const { getPosts, streamPosts, createPost } = require('../controllers/post.controller');
const moderateContent = require('../middleware/moderation');
const { cacheMiddleware } = require('../middleware/lruCache');
const { authenticateToken, requirePermission } = require('../middleware/auth');

router.get('/', cacheMiddleware, getPosts);

router.get('/stream', streamPosts);

router.post('/', authenticateToken, requirePermission('create:items'), moderateContent({ action: 'block', fields: ['title', 'content', 'village'] }), createPost);

module.exports = router;
