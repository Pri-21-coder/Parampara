const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const validateGalleryQuery = require('../middleware/galleryValidator');

// GET /api/gallery - list all gallery items with validation, search, filter, sort, and pagination
router.get('/', validateGalleryQuery, galleryController.getGallery);

module.exports = router;
