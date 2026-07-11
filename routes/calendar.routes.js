const express = require('express');
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  getEventsByMonth,
  getEventsBySeason,
  getEventsByState,
} = require('../controllers/calendar.controller');

// Main list & filters
router.get('/', getAllEvents);

// Search endpoint (aliases search parameters to regular query matching)
router.get('/search', getAllEvents);

// Helper endpoints
router.get('/upcoming', getUpcomingEvents);
router.get('/month/:month', getEventsByMonth);
router.get('/season/:season', getEventsBySeason);
router.get('/state/:state', getEventsByState);

// Details by ID
router.get('/:id', getEventById);

module.exports = router;
