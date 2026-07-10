const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');

// Get all recipes (supports query params for search & filters)
router.get('/', recipeController.getAllRecipes);

// Get recipe by ID
router.get('/:id', recipeController.getRecipeById);

// Featured recipe (today's rotation)
router.get('/featured', recipeController.getFeaturedRecipe);

// Recipes by region
router.get('/region/:region', recipeController.getRecipesByRegion);

// Recipes by village
router.get('/village/:village', recipeController.getRecipesByVillage);

// Recipes by category
router.get('/category/:category', recipeController.getRecipesByCategory);

// Recipes by festival
router.get('/festival/:festival', recipeController.getRecipesByFestival);

// Recipes by ingredient
router.get('/ingredient/:ingredient', recipeController.getRecipesByIngredient);

// Compare two regions
router.get('/compare', recipeController.compareRegions);

// Search endpoint (q and optional filters)
router.get('/search', recipeController.searchRecipes);

module.exports = router;
