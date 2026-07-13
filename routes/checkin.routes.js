const express = require('express');
const router = express.Router();

const { checkIn, getCheckInHistory, getCheckInStats } = require('../controllers/checkin.controller');

// POST /api/checkin - Check-in to a village
router.post('/', checkIn);

// GET /api/checkin/history/:userId - Get check-in history with pagination
// Query params: page (default 1), limit (default 10, max 100)
router.get('/history/:userId', getCheckInHistory);

// GET /api/checkin/stats/:userId - Get check-in statistics
router.get('/stats/:userId', getCheckInStats);

module.exports = router;