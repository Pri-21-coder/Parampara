// routes/language.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllWords,
  getWordById,
  getFeaturedWord,
  getWordOfTheDay,
  getByLanguage,
  getByVillage,
  getByCategory,
  searchWords,
  compareDialects,
} = require('../controllers/language.controller');

// GET all vocabulary words
router.get('/', getAllWords);

// GET featured (highlighted) word – for now returns first item
router.get('/featured', getFeaturedWord);

// GET word of the day – deterministic based on date
router.get('/daily', getWordOfTheDay);

// Search endpoint – query param q
router.get('/search', searchWords);

// Dialect comparison – expects ?dialectA=...&dialectB=...
router.get('/compare', compareDialects);

// Filter by language
router.get('/language/:lang', getByLanguage);

// Filter by village
router.get('/village/:village', getByVillage);

// Filter by category
router.get('/category/:category', getByCategory);

// GET single word by id
router.get('/:id', getWordById);

module.exports = router;
