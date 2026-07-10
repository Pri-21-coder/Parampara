const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

// GET /api/profile - Fetch basic profile info
router.get('/', profileController.getProfile);

// POST /api/profile - Update avatar or bio
router.post('/', profileController.updateProfile);

// GET /api/profile/stats - Fetch exploration statistics
router.get('/stats', profileController.getProfileStats);

// GET /api/profile/badges - Fetch badges (earned and locked)
router.get('/badges', profileController.getProfileBadges);

// GET /api/profile/timeline - Fetch chronological activity timeline
router.get('/timeline', profileController.getProfileTimeline);

// GET /api/profile/achievements - Fetch milestones/achievements
router.get('/achievements', profileController.getProfileAchievements);

// GET /api/profile/passport - Fetch digital passport summary
router.get('/passport', profileController.getProfilePassport);

module.exports = router;
