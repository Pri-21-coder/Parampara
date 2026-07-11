const express = require('express');
const router = express.Router();
const artifactController = require('../controllers/artifact.controller');
const { validateArtifactQuery, validateArtifactId } = require('../middleware/artifactValidator');

// GET /api/artifacts - List all artifacts with filters, sorting, and pagination
router.get('/', validateArtifactQuery, artifactController.getArtifacts);

// GET /api/artifacts/search - Full-text search on artifacts
router.get('/search', validateArtifactQuery, artifactController.searchArtifacts);

// GET /api/artifacts/categories - Get list of unique categories
router.get('/categories', artifactController.getCategories);

// GET /api/artifacts/regions - Get list of unique regions (states/districts/villages)
router.get('/regions', artifactController.getRegions);

// GET /api/artifacts/:id - Retrieve single artifact detail by ID
router.get('/:id', validateArtifactId, artifactController.getArtifactById);

module.exports = router;
