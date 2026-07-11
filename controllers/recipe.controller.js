const store = require('../data/store');

// Helper to find recipe by ID
const findRecipe = (id) => store.recipes.find((r) => r.id === id);

// GET /api/recipes
// Supports optional query params: search, region, village, category, festival, ingredient, difficulty, vegetarian, season
exports.getAllRecipes = (req, res, next) => {
  try {
    let results = store.recipes;
    const {
      q,
      region,
      village,
      category,
      festival,
      ingredient,
      difficulty,
      vegetarian,
      season,
    } = req.query;
    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(lower) ||
          r.village.toLowerCase().includes(lower) ||
          r.region.toLowerCase().includes(lower) ||
          r.ingredients.some((i) => i.toLowerCase().includes(lower))
      );
    }
    if (region) results = results.filter((r) => r.region === region);
    if (village) results = results.filter((r) => r.village === village);
    if (category) results = results.filter((r) => r.category === category);
    if (festival) results = results.filter((r) => r.festival === festival);
    if (ingredient)
      results = results.filter((r) => r.ingredients.includes(ingredient));
    if (difficulty)
      results = results.filter((r) => r.difficultyLevel === difficulty);
    if (vegetarian)
      results = results.filter((r) => String(r.isVegetarian) === vegetarian);
    if (season) results = results.filter((r) => r.season === season);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/:id
exports.getRecipeById = (req, res, next) => {
  try {
    const recipe = findRecipe(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/featured
exports.getFeaturedRecipe = (req, res, next) => {
  try {
    // Simple random featured; client may rotate via localStorage
    const idx = Math.floor(Math.random() * store.recipes.length);
    const recipe = store.recipes[idx];
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/region/:region
exports.getRecipesByRegion = (req, res, next) => {
  try {
    const { region } = req.params;
    const results = store.recipes.filter((r) => r.region === region);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/village/:village
exports.getRecipesByVillage = (req, res, next) => {
  try {
    const { village } = req.params;
    const results = store.recipes.filter((r) => r.village === village);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/category/:category
exports.getRecipesByCategory = (req, res, next) => {
  try {
    const { category } = req.params;
    const results = store.recipes.filter((r) => r.category === category);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/festival/:festival
exports.getRecipesByFestival = (req, res, next) => {
  try {
    const { festival } = req.params;
    const results = store.recipes.filter(
      (r) => r.festivalAssociation === festival
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/ingredient/:ingredient
exports.getRecipesByIngredient = (req, res, next) => {
  try {
    const { ingredient } = req.params;
    const results = store.recipes.filter((r) =>
      r.ingredients.includes(ingredient)
    );
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/compare?regionA=...&regionB=...
exports.compareRegions = (req, res, next) => {
  try {
    const { regionA, regionB } = req.query;
    if (!regionA || !regionB)
      return res
        .status(400)
        .json({ message: 'Both regionA and regionB are required' });
    const dataA = store.recipes.filter((r) => r.region === regionA);
    const dataB = store.recipes.filter((r) => r.region === regionB);
    res.json({ regionA: dataA, regionB: dataB });
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/search?q=...&filters=...
exports.searchRecipes = (req, res, next) => {
  // Reuse getAllRecipes logic – query params already handle filters
  return exports.getAllRecipes(req, res, next);
};
