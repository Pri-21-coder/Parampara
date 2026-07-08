const express = require('express');
const router = express.Router();
const themeController = require('../controllers/theme.controller');

// GET /api/themes/:villageId
router.get('/:villageId', themeController.getTheme);

// POST /api/themes/:villageId
router.post('/:villageId', themeController.saveTheme);

module.exports = router;
