// public/scripts/language.js
/*
  Language Hub Front‑end Logic
  -------------------------------------------------
  This script wires up all UI components on language.html
  to the backend Language API (routes defined in
  routes/language.routes.js). It provides:
    • Hero button smooth‑scroll
    • Word‑of‑the‑Day card (with audio + bookmark)
    • Search box + filters (language, region, village, category)
    • Vocabulary grid rendering
    • Dialect comparison UI
    • Favorites section persisted via localStorage
    • Minimal toast notifications & error handling
  Dependencies: vanilla ES6, fetch API, and the existing
  translation / languageSwitcher scripts for i18n.
*/

const API_BASE = '/api/language';
const FAVORITES_KEY = 'languageHubFavorites';
const DEBOUNCE_DELAY = 300;

/** Utility: debounce a function */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Utility: simple toast (auto‑hide) */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/** Load favorites from localStorage (array of word objects) */
function loadFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Save favorites back to localStorage */
function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

/** Render a single vocabulary card */
function createCard(word) {
  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h3');
  title.textContent = word.word || word.title || '—';
  card.appendChild(title);

  const meaning = document.createElement('p');
  meaning.textContent = word.meaning || word.description || '';
  card.appendChild(meaning);

  // Tags (language, region, village, category etc.)
  if (word.tags && Array.isArray(word.tags) && word.tags.length) {
    const tagContainer = document.createElement('div');
    tagContainer.className = 'tags';
    word.tags.forEach((t) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tagContainer.appendChild(span);
    });
    card.appendChild(tagContainer);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';

  // Audio button
  if (word.audioUrl) {
    const audioBtn = document.createElement('button');
    audioBtn.className = 'play-audio';
    audioBtn.title = 'Play pronunciation';
    audioBtn.innerHTML = '🔊';
    audioBtn.addEventListener('click', () => {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(() => showToast('Audio playback failed', 'error'));
    });
    actions.appendChild(audioBtn);
  }

  // Bookmark button
  const bookmarkBtn = document.createElement('button');
  bookmarkBtn.className = 'bookmark';
  bookmarkBtn.title = 'Add to favorites';
  bookmarkBtn.innerHTML = '★';
  const isFav = loadFavorites().some((f) => f.id === word.id);
  if (isFav) bookmarkBtn.classList.add('active');
  bookmarkBtn.addEventListener('click', () => {
    const favs = loadFavorites();
    const idx = favs.findIndex((f) => f.id === word.id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      bookmarkBtn.classList.remove('active');
      showToast('Removed from favorites');
    } else {
      favs.push(word);
      bookmarkBtn.classList.add('active');
      showToast('Added to favorites');
    }
    saveFavorites(favs);
    renderFavorites();
  });
  actions.appendChild(bookmarkBtn);

  card.appendChild(actions);
  return card;
}

/** Render a list of words into a container element */
function renderGrid(containerId, words) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!words || !words.length) {
    container.textContent = 'No results found.';
    return;
  }
  words.forEach((word) => container.appendChild(createCard(word)));
}

/** Render favorites section */
function renderFavorites() {
  const favs = loadFavorites();
  renderGrid('favoritesGrid', favs);
}

/** Populate filter dropdowns based on the full dataset */
async function populateFilters() {
  try {
    const res = await fetch(API_BASE);
    const all = await res.json(); // expect array of word objects
    const langs = new Set();
    const regions = new Set();
    const villages = new Set();
    const categories = new Set();
    all.forEach((w) => {
      if (w.language) langs.add(w.language);
      if (w.region) regions.add(w.region);
      if (w.village) villages.add(w.village);
      if (w.category) categories.add(w.category);
    });
    const fillSelect = (id, set) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      // clear existing (keep first placeholder option)
      sel.length = 1; // preserve placeholder
      Array.from(set)
        .sort()
        .forEach((val) => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          sel.appendChild(opt);
        });
    };
    fillSelect('filterLanguage', langs);
    fillSelect('filterRegion', regions);
    fillSelect('filterVillage', villages);
    fillSelect('filterCategory', categories);
  } catch (e) {
    console.error('Failed to populate filters', e);
  }
}

/** Load and render Word of the Day */
async function loadWordOfTheDay() {
  try {
    const res = await fetch(`${API_BASE}/daily`);
    if (!res.ok) throw new Error('Network response was not ok');
    const word = await res.json();
    const container = document.getElementById('wordOfDayContainer');
    container.innerHTML = '';
    container.appendChild(createCard(word));
  } catch (e) {
    console.error('Word of the Day error', e);
    showToast('Could not load Word of the Day', 'error');
  }
}

/** Perform search based on term + filters */
const performSearch = debounce(async () => {
  const term = document.getElementById('searchInput').value.trim();
  const lang = document.getElementById('filterLanguage').value;
  const region = document.getElementById('filterRegion').value;
  const village = document.getElementById('filterVillage').value;
  const category = document.getElementById('filterCategory').value;
  const params = new URLSearchParams();
  if (term) params.append('q', term);
  if (lang) params.append('language', lang);
  if (region) params.append('region', region);
  if (village) params.append('village', village);
  if (category) params.append('category', category);

  try {
    const url = params.toString()
      ? `${API_BASE}/search?${params}`
      : `${API_BASE}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    renderGrid('vocabGrid', data);
  } catch (e) {
    console.error(e);
    showToast('Search error', 'error');
  }
}, DEBOUNCE_DELAY);

/** Dialect comparison */
async function loadDialectComparison() {
  const dialectA = document.getElementById('compareDialectA').value;
  const dialectB = document.getElementById('compareDialectB').value;
  if (!dialectA || !dialectB) {
    showToast('Select both dialects to compare', 'warning');
    return;
  }
  const params = new URLSearchParams({ dialectA, dialectB });
  try {
    const res = await fetch(`${API_BASE}/compare?${params}`);
    if (!res.ok) throw new Error('Comparison failed');
    const data = await res.json(); // Expected: [{term, a, b}, ...]
    const resultsDiv = document.getElementById('comparisonResults');
    resultsDiv.innerHTML = '';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Term', dialectA, dialectB].forEach((txt) => {
      const th = document.createElement('th');
      th.textContent = txt;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    data.forEach((row) => {
      const tr = document.createElement('tr');
      const tdTerm = document.createElement('td');
      tdTerm.textContent = row.term;
      const tdA = document.createElement('td');
      tdA.textContent = row.a || '-';
      const tdB = document.createElement('td');
      tdB.textContent = row.b || '-';
      tr.append(tdTerm, tdA, tdB);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultsDiv.appendChild(table);
  } catch (e) {
    console.error(e);
    showToast('Dialect comparison error', 'error');
  }
}

/** Hero button smooth scroll */
function initHeroButtons() {
  const heroBtns = document.querySelectorAll('.hero-buttons a');
  heroBtns.forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const targetId = btn.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/** Attach all event listeners once DOM is ready */
function initListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', performSearch);

  // Filter selects
  ['filterLanguage', 'filterRegion', 'filterVillage', 'filterCategory'].forEach(
    (id) => {
      const sel = document.getElementById(id);
      if (sel) sel.addEventListener('change', performSearch);
    }
  );

  // Compare button
  const compareBtn = document.getElementById('compareBtn');
  if (compareBtn)
    compareBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      loadDialectComparison();
    });

  initHeroButtons();
}

/** Initial page bootstrap */
async function initPage() {
  renderFavorites(); // show any saved favorites immediately
  await populateFilters();
  await loadWordOfTheDay();
  // initial load of all words into the vocab grid (optional)
  try {
    const res = await fetch(API_BASE);
    if (res.ok) {
      const all = await res.json();
      renderGrid('vocabGrid', all);
    }
  } catch (e) {
    console.error('Failed to load initial vocab list', e);
  }
  initListeners();
}

document.addEventListener('DOMContentLoaded', initPage);

/* Toast styling (inject minimal CSS if not present) */
(function injectToastStyle() {
  const style = document.createElement('style');
  style.textContent = `
  .toast {
    position: fixed; bottom: 1rem; right: 1rem; padding: 0.8rem 1.2rem;
    background: rgba(0,0,0,0.7); color: #fff; border-radius: 0.5rem; z-index: 1000;
    font-size: 0.9rem; opacity: 0; transform: translateY(20px);
    transition: opacity 0.3s, transform 0.3s;
  }
  .toast.toast-info { background: rgba(0,123,255,0.9); }
  .toast.toast-warning { background: rgba(255,193,7,0.9); }
  .toast.toast-error { background: rgba(220,53,69,0.9); }
  .toast.show { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
})();
