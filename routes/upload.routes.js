const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/upload.controller');

// Server chunk config (no auth needed)
router.get('/config', ctrl.getConfig);

// Init new upload session
router.post('/init', ctrl.initSession);

// Upload a single chunk (raw binary body)
router.post('/chunk/:sessionId/:chunkIndex', (req, res, next) => {
  // Disable body-parser for this route — we read raw stream manually
  req.rawBody = true;
  ctrl.uploadChunk(req, res, next);
});

// Complete upload — assemble all chunks
router.post('/complete/:sessionId', ctrl.completeUpload);

// Get session status (for resume detection)
router.get('/status/:sessionId', ctrl.getSessionStatus);

module.exports = router;
