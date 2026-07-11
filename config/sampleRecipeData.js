const store = require('../data/store');

// Sample recipes covering multiple Indian states
const sampleRecipes = [
  {
    id: 'r1',
    title: 'Litti Chokha',
    village: 'Bihar Village',
    region: 'Bihar',
    state: 'Bihar',
    category: 'Snack',
    festivalAssociation: 'Holi',
    ingredients: ['Wheat flour', 'Sattu', 'Garlic', 'Onion', 'Green chili'],
    indigenousIngredients: ['Sattu (roasted gram flour)'],
    preparationSteps: [
      'Make dough with wheat flour and water.',
      'Prepare sattu stuffing with spices.',
      'Stuff dough balls and bake over fire.',
      'Serve with roasted tomato‑onion chutney.',
    ],
    traditionalCookingMethod: 'Open‑fire baking',
    cookingEquipment: 'Clay oven or charcoal grill',
    cookingDuration: '45 mins',
    difficultyLevel: 'Medium',
    isVegetarian: true,
    nutritionalHighlights: 'High protein, fibre',
    historicalBackground:
      'Traditional Bihari winter snack enjoyed during harvest festivals.',
    culturalSignificance: 'Symbol of rustic hospitality',
    familyStory: 'Grandma used to prepare it for village fairs.',
    images: ['/assets/food/litti_chokha.jpg'],
    audioNarration: '/assets/food/litti_chokha.mp3',
    contributor: 'Anita Sharma',
  },
  {
    id: 'r2',
    title: 'Pakhala Bhata',
    village: 'Puri Village',
    region: 'Odisha',
    state: 'Odisha',
    category: 'Main',
    festivalAssociation: 'Raja',
    ingredients: ['Rice', 'Water', 'Curd', 'Salt', 'Green chilies'],
    indigenousIngredients: [],
    preparationSteps: [
      'Boil rice and let it cool.',
      'Soak rice in water overnight.',
      'Add curd, salt, and chilies before serving.',
    ],
    traditionalCookingMethod: 'Fermentation',
    cookingEquipment: 'Pot',
    cookingDuration: '12 hrs (fermentation) + 5 mins cooking',
    difficultyLevel: 'Easy',
    isVegetarian: true,
    nutritionalHighlights: 'Probiotic, light digestion',
    historicalBackground:
      'Ancient rice‑water dish consumed during hot summers.',
    culturalSignificance: 'Integral to Raja festival celebrations.',
    familyStory: 'Parents served it during school vacations.',
    images: ['/assets/food/pakhala.jpg'],
    audioNarration: '',
    contributor: 'Ramesh Patnaik',
  },
  {
    id: 'r3',
    title: 'Kerala Sadya',
    village: 'Alappuzha Village',
    region: 'Kerala',
    state: 'Kerala',
    category: 'Feast',
    festivalAssociation: 'Onam',
    ingredients: ['Rice', 'Lentils', 'Vegetables', 'Coconut', 'Spices'],
    indigenousIngredients: ['Coconut oil', 'Tapioca'],
    preparationSteps: [
      'Cook rice and set as base.',
      'Prepare multiple side dishes (stew, pickle, banana chips, etc.).',
      'Arrange all dishes on banana leaf in specific order.',
    ],
    traditionalCookingMethod: 'Steaming & sautéing',
    cookingEquipment: 'Clay pots, banana leaf',
    cookingDuration: '2–3 hrs',
    difficultyLevel: 'Hard',
    isVegetarian: true,
    nutritionalHighlights: 'Balanced vegetarian meal',
    historicalBackground:
      'Royal banquet tradition now practiced by households.',
    culturalSignificance: 'Core of Onam celebrations representing prosperity.',
    familyStory: 'Grandfather taught the art of arranging Sadya.',
    images: ['/assets/food/sadya.jpg'],
    audioNarration: '',
    contributor: 'Lakshmi Nair',
  },
];

store.recipes = sampleRecipes;

module.exports = function initializeSampleRecipeData() {
  // This function is invoked in server.js to load recipes.
};
