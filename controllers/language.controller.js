// controllers/language.controller.js
const store = require('../data/store');

// Utility to get today’s word index (deterministic)
function getTodayIndex() {
  const today = new Date();
  const seed = Number(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
  return seed % store.heritageLanguages.length;
}

// GET all words
exports.getAllWords = (req, res) => {
  res.json(store.heritageLanguages);
};

// GET word by ID
exports.getWordById = (req, res) => {
  const word = store.heritageLanguages.find((w) => w.id === req.params.id);
  if (!word) return res.status(404).json({ message: 'Word not found' });
  res.json(word);
};

// GET featured word (first entry for now)
exports.getFeaturedWord = (req, res) => {
  const word = store.heritageLanguages[0] || null;
  res.json(word);
};

// GET word of the day
exports.getWordOfTheDay = (req, res) => {
  if (store.heritageLanguages.length === 0) return res.json(null);
  const idx = getTodayIndex();
  const word = store.heritageLanguages[idx];
  res.json(word);
};

// Filter by language
exports.getByLanguage = (req, res) => {
  const lang = req.params.lang.toLowerCase();
  const filtered = store.heritageLanguages.filter((w) => w.language.toLowerCase() === lang);
  res.json(filtered);
};

// Filter by village
exports.getByVillage = (req, res) => {
  const village = req.params.village.toLowerCase();
  const filtered = store.heritageLanguages.filter((w) => w.village.toLowerCase() === village);
  res.json(filtered);
};

// Filter by category
exports.getByCategory = (req, res) => {
  const cat = req.params.category.toLowerCase();
  const filtered = store.heritageLanguages.filter((w) => w.category.toLowerCase() === cat);
  res.json(filtered);
};

// Search words (query param q on any searchable field)
exports.searchWords = (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json([]);
  const result = store.heritageLanguages.filter((w) => {
    return (
      w.word.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q) ||
      w.village.toLowerCase().includes(q) ||
      w.language.toLowerCase().includes(q) ||
      w.region.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q)
    );
  });
  res.json(result);
};

// Dialect comparison – expects dialectA and dialectB query params
exports.compareDialects = (req, res) => {
  const { dialectA, dialectB } = req.query;
  if (!dialectA || !dialectB) {
    return res.status(400).json({ message: 'Both dialectA and dialectB are required' });
  }
  const wordsA = store.heritageLanguages.filter((w) => w.dialect.toLowerCase() === dialectA.toLowerCase());
  const wordsB = store.heritageLanguages.filter((w) => w.dialect.toLowerCase() === dialectB.toLowerCase());
  const common = wordsA.filter((a) => wordsB.some((b) => b.word === a.word));
  const uniqueA = wordsA.filter((a) => !common.some((c) => c.word === a.word));
  const uniqueB = wordsB.filter((b) => !common.some((c) => c.word === b.word));
  res.json({ common, uniqueA, uniqueB });
};
