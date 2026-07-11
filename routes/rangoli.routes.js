const express = require('express');
const router = express.Router();
const rangoliController = require('../controllers/rangoli.controller');

router.get('/explore', rangoliController.getDesigns);
router.post('/save', rangoliController.saveDesign);
router.get('/:id', rangoliController.getDesignById);

module.exports = router;
