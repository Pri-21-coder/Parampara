// routes/nature.routes.js
const express = require('express');
const router = express.Router();

const {
  getNatureSites,
  getNatureSiteById,
  submitFolklore
} = require('../controllers/nature.controller');

// GET all sites (supports query parameters e.g., ?category=forest&q=sundari)
router.get('/', getNatureSites);

// GET details of a specific site
router.get('/:id', getNatureSiteById);

// POST folklore submission for a specific site
router.post('/:id/folklore', submitFolklore);

module.exports = router;
