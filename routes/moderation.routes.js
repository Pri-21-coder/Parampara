const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/moderation.controller');

// Register a trusted moderator peer
router.post('/register-peer', ctrl.registerPeer);

// Submit content for moderation
router.post('/submit', ctrl.submitForModeration);

// Cast a signed vote on a pending item
router.post('/vote', ctrl.castVote);

// Get moderation queue (optionally filtered by status)
router.get('/queue', ctrl.getQueue);

// Get audit log
router.get('/log', ctrl.getLog);

// Get list of trusted peers
router.get('/peers', ctrl.getPeers);

module.exports = router;
