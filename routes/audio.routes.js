const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audio.controller');

// CSRF is enforced globally for POST requests in server.js, 
// so the frontend must send the token.

router.post('/metadata', audioController.saveAudioMetadata);
router.get('/metadata/:id', audioController.getAudioMetadata);

module.exports = router;
