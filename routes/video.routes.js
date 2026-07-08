const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/video.controller');

// GET /api/video/stream?sessionId=... or ?videoUrl=...
router.get('/stream', ctrl.streamVideo);

module.exports = router;
