// public/scripts/food.js
// This script powers the Traditional Recipe & Food Heritage Archive page.
// It fetches data from the backend API, populates UI components, and handles
// search, filters, favorites, and regional comparison.

(() => {
  const API_BASE = '/api/recipes';

  // State
  let allRecipes = [];
  let favorites = new Set(JSON.parse(localStorage.getItem('favoriteRecipes') || '[]'));

  // DOM references
  const recipesGrid = document.getElementById('recipesGrid');
  const featuredCard = document.getElementById('featuredCard');
  const searchInput = document.getElementById('searchInput');
  const regionFilter = document.getElementById('regionFilter');
  const villageFilter = document.getElementById('villageFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const festivalFilter = document.getElementById('festivalFilter');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const vegFilter = document.getElementById('vegFilter');
  const festivalContainer = document.getElementById('festivalContainer');
  const ingredientContainer = document.getElementById('ingredientContainer');
  const favoritesGrid = document.getElementById('favoritesGrid');
  const compareResult = document.getElementById('compareResult');
  const regionASelect = document.getElementById('regionASelect');
  const regionBSelect = document.getElementById('regionBSelect');
  const compareBtn = document.getElementById('compareBtn');
  const statsGrid = document.getElementById('statsGrid');
  const modal = document.getElementById('recipeModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // Utility helpers
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const setAttributes = (el, attrs) => {
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  };

  // Fetch all recipes
  async function loadRecipes() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load recipes');
      allRecipes = await res.json();
      populateFilters();
      renderFeatured();
      renderRecipes();
      renderFestivalFoods();
      renderIngredientExplorer();
      renderFavorites();
      renderStats();
      populateRegionComparison();
    } catch (e) {
      console.error(e);
    }
  }

  // Populate filter dropdowns based on data
  function populateFilters() {
    const uniq = (arr) => [...new Set(arr)].sort();
    const regions = uniq(allRecipes.map(r => r.region));
    const villages = uniq(allRecipes.map(r => r.village));
    const categories = uniq(allRecipes.map(r => r.category));
    const festivals = uniq(allRecipes.map(r => r.festivalAssociation).filter(Boolean));

    const addOptions = (select, items) => {
      items.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });
    };

    addOptions(regionFilter, regions);
    addOptions(villageFilter, villages);
    addOptions(categoryFilter, categories);
    addOptions(festivalFilter, festivals);
  }

  // Filter logic – returns subset based on current UI controls
  function getFilteredRecipes() {
    const query = searchInput.value.trim().toLowerCase();
    return allRecipes.filter(r => {
      if (query && !(
        r.title.toLowerCase().includes(query) ||
        r.village.toLowerCase().includes(query) ||
        r.region.toLowerCase().includes(query) ||
        r.ingredients.some(i => i.toLowerCase().includes(query))
      )) return false;
      if (regionFilter.value && r.region !== regionFilter.value) return false;
      if (villageFilter.value && r.village !== villageFilter.value) return false;
      if (categoryFilter.value && r.category !== categoryFilter.value) return false;
      if (festivalFilter.value && r.festivalAssociation !== festivalFilter.value) return false;
      if (difficultyFilter.value && r.difficultyLevel !== difficultyFilter.value) return false;
      if (vegFilter.value) {
        const veg = vegFilter.value === 'true';
        if (Boolean(r.isVegetarian) !== veg) return false;
      }
      return true;
    });
  }

  // Render recipe cards into a container
  function renderCard(recipe, container) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${recipe.title}`);

    const img = document.createElement('img');
    img.src = recipe.images && recipe.images[0] ? recipe.images[0] : 'assets/food/placeholder.jpg';
    img.alt = `${recipe.title}`;
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = recipe.title;
    body.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${recipe.region} • ${recipe.village}`;
    body.appendChild(meta);

    const favBtn = document.createElement('button');
    favBtn.className = 'view-btn';
    favBtn.textContent = favorites.has(recipe.id) ? '★ Favorite' : 'View Details';
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (favorites.has(recipe.id)) {
        // toggle favorite
        favorites.delete(recipe.id);
        favBtn.textContent = 'View Details';
        renderFavorites();
        localStorage.setItem('favoriteRecipes', JSON.stringify([...favorites]));
      } else {
        openModal(recipe);
      }
    });
    body.appendChild(favBtn);
    card.appendChild(body);

    card.addEventListener('click', () => openModal(recipe));
    container.appendChild(card);
  }

  function renderRecipes() {
    recipesGrid.innerHTML = '';
    const filtered = getFilteredRecipes();
    if (filtered.length === 0) {
      recipesGrid.textContent = 'No recipes match your criteria.';
      return;
    }
    filtered.forEach(r => renderCard(r, recipesGrid));
  }

  // Featured recipe (random for demo, could be server‑side daily)
  async function renderFeatured() {
    try {
      const res = await fetch(`${API_BASE}/featured`);
      if (!res.ok) throw new Error('Featured not available');
      const recipe = await res.json();
      featuredCard.innerHTML = '';
      const img = document.createElement('img');
      img.src = recipe.images && recipe.images[0] ? recipe.images[0] : 'assets/food/placeholder.jpg';
      img.alt = recipe.title;
      const info = document.createElement('div');
      info.className = 'info';
      const title = document.createElement('h3');
      title.textContent = recipe.title;
      const meta = document.createElement('p');
      meta.textContent = `${recipe.region} • ${recipe.village}`;
      info.appendChild(title);
      info.appendChild(meta);
      featuredCard.appendChild(img);
      featuredCard.appendChild(info);
      featuredCard.addEventListener('click', () => openModal(recipe));
    } catch (e) {
      console.error(e);
    }
  }

  // Festival foods – group recipes by festival
  function renderFestivalFoods() {
    const byFest = {};
    allRecipes.forEach(r => {
      const fest = r.festivalAssociation || 'General';
      if (!byFest[fest]) byFest[fest] = [];
      byFest[fest].push(r);
    });
    festivalContainer.innerHTML = '';
    Object.entries(byFest).forEach(([fest, list]) => {
      const section = document.createElement('div');
      const heading = document.createElement('h4');
      heading.textContent = fest;
      section.appendChild(heading);
      const grid = document.createElement('div');
      grid.className = 'recipes-grid';
      list.slice(0, 4).forEach(r => renderCard(r, grid));
      section.appendChild(grid);
      festivalContainer.appendChild(section);
    });
  }

  // Ingredient explorer – list unique indigenous ingredients
  function renderIngredientExplorer() {
    const ingSet = new Set();
    allRecipes.forEach(r => {
      (r.indigenousIngredients || []).forEach(i => ingSet.add(i));
    });
    ingredientContainer.innerHTML = '';
    ingSet.forEach(ing => {
      const div = document.createElement('div');
      div.className = 'ingredient-card';
      div.textContent = ing;
      ingredientContainer.appendChild(div);
    });
  }

  // Favorites rendering
  function renderFavorites() {
    favoritesGrid.innerHTML = '';
    const favRecipes = allRecipes.filter(r => favorites.has(r.id));
    if (favRecipes.length === 0) {
      favoritesGrid.textContent = 'No favorite recipes yet.';
      return;
    }
    favRecipes.forEach(r => renderCard(r, favoritesGrid));
  }

  // Statistics – simple counts
  function renderStats() {
    const total = allRecipes.length;
    const regions = new Set(allRecipes.map(r => r.region)).size;
    const villages = new Set(allRecipes.map(r => r.village)).size;
    const festivals = new Set(allRecipes.map(r => r.festivalAssociation).filter(Boolean)).size;
    const ingredients = new Set(allRecipes.flatMap(r => r.ingredients)).size;

    const data = [
      { label: 'Total Recipes', value: total },
      { label: 'Regions', value: regions },
      { label: 'Villages', value: villages },
      { label: 'Festivals', value: festivals },
      { label: 'Ingredients', value: ingredients }
    ];
    statsGrid.innerHTML = '';
    data.forEach(d => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `<h3>${d.value}</h3><p>${d.label}</p>`;
      statsGrid.appendChild(card);
    });
  }

  // Regional comparison – simple list of recipes per region
  function populateRegionComparison() {
    const regions = [...new Set(allRecipes.map(r => r.region))].sort();
    regions.forEach(r => {
      const optA = document.createElement('option');
      optA.value = r; optA.textContent = r;
      const optB = optA.cloneNode(true);
      regionASelect.appendChild(optA);
      regionBSelect.appendChild(optB);
    });
  }

  async function runComparison() {
    const a = regionASelect.value;
    const b = regionBSelect.value;
    if (!a || !b) return (compareResult.textContent = 'Select two regions');
    try {
      const res = await fetch(`${API_BASE}/compare?regionA=${encodeURIComponent(a)}&regionB=${encodeURIComponent(b)}`);
      const data = await res.json();
      compareResult.innerHTML = '';
      const renderList = (title, list) => {
        const div = document.createElement('div');
        const h = document.createElement('h4');
        h.textContent = title;
        div.appendChild(h);
        const ul = document.createElement('ul');
        list.forEach(r => {
          const li = document.createElement('li');
          li.textContent = `${r.title} (${r.village})`;
          ul.appendChild(li);
        });
        div.appendChild(ul);
        compareResult.appendChild(div);
      };
      renderList(a, data.regionA);
      renderList(b, data.regionB);
    } catch (e) {
      console.error(e);
      compareResult.textContent = 'Comparison failed.';
    }
  }

  // Modal handling
  function openModal(recipe) {
    modalBody.innerHTML = '';
    const title = document.createElement('h2');
    title.id = 'modalTitle';
    title.textContent = recipe.title;
    modalBody.appendChild(title);

    const img = document.createElement('img');
    img.src = recipe.images && recipe.images[0] ? recipe.images[0] : 'assets/food/placeholder.jpg';
    img.alt = recipe.title;
    img.style.maxWidth = '100%';
    modalBody.appendChild(img);

    const details = document.createElement('div');
    details.innerHTML = `
      <p><strong>Village:</strong> ${recipe.village}</p>
      <p><strong>Region:</strong> ${recipe.region}</p>
      <p><strong>Category:</strong> ${recipe.category}</p>
      <p><strong>Festival:</strong> ${recipe.festivalAssociation || 'N/A'}</p>
      <p><strong>Cooking Method:</strong> ${recipe.traditionalCookingMethod}</p>
      <p><strong>Equipment:</strong> ${recipe.cookingEquipment}</p>
      <p><strong>Duration:</strong> ${recipe.cookingDuration}</p>
      <p><strong>Difficulty:</strong> ${recipe.difficultyLevel}</p>
      <p><strong>Vegetarian:</strong> ${recipe.isVegetarian ? 'Yes' : 'No'}</p>
      <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
      <p><strong>Indigenous:</strong> ${recipe.indigenousIngredients.join(', ')}</p>
      <p><strong>Historical:</strong> ${recipe.historicalBackground}</p>
      <p><strong>Cultural Significance:</strong> ${recipe.culturalSignificance}</p>
      <p><strong>Family Story:</strong> ${recipe.familyStory}</p>
      <p><strong>Contributor:</strong> ${recipe.contributor}</p>
    `;
    modalBody.appendChild(details);

    // Favorite toggle inside modal
    const favBtn = document.createElement('button');
    favBtn.textContent = favorites.has(recipe.id) ? 'Remove from Favorites' : 'Add to Favorites';
    favBtn.addEventListener('click', () => {
      if (favorites.has(recipe.id)) {
        favorites.delete(recipe.id);
        favBtn.textContent = 'Add to Favorites';
      } else {
        favorites.add(recipe.id);
        favBtn.textContent = 'Remove from Favorites';
      }
      localStorage.setItem('favoriteRecipes', JSON.stringify([...favorites]));
      renderFavorites();
      renderRecipes();
    });
    modalBody.appendChild(favBtn);

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    modalClose.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }

  // Event listeners
  searchInput.addEventListener('input', renderRecipes);
  regionFilter.addEventListener('change', renderRecipes);
  villageFilter.addEventListener('change', renderRecipes);
  categoryFilter.addEventListener('change', renderRecipes);
  festivalFilter.addEventListener('change', renderRecipes);
  difficultyFilter.addEventListener('change', renderRecipes);
  vegFilter.addEventListener('change', renderRecipes);
  compareBtn.addEventListener('click', runComparison);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Initialize
  document.addEventListener('DOMContentLoaded', loadRecipes);
})();
