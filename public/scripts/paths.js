// Heritage Paths Page JavaScript

let allPaths = [];      // current displayed paths (after filter/sort)
let totalPaths = 0;     // total paths from the last API response (for results count)
let allItems = [];
let currentPath = null;
let currentStepIndex = 0;

// ── Translation helper ──────────────────────────────────────────────────────
function tPath(key) {
  if (typeof PARAMPARA_TRANSLATIONS === 'undefined') return key;
  const lang =
    localStorage.getItem('parampara_lang') ||
    localStorage.getItem('language') ||
    'en';
  const dict = PARAMPARA_TRANSLATIONS[lang] || PARAMPARA_TRANSLATIONS['en'];
  return (dict && dict[key]) || PARAMPARA_TRANSLATIONS['en'][key] || key;
}

// ── Re-render when language changes ─────────────────────────────────────────
window.addEventListener('parampara:langchange', () => {
  refreshFilterControlLabels();
  displayPaths();
  updateResultsCount();
  const modal = document.getElementById('path-player-modal');
  if (modal && modal.classList.contains('active') && currentPath) {
    document.getElementById('path-player-title').textContent =
      pathTitle(currentPath);
    displayPathStep();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Boot sequence — loadThemes MUST be awaited so that select options exist
// before we try to restore theme from URL (fixes race condition on refresh)
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupBackToTop();
  await loadThemes();     // populate theme options first
  loadFiltersFromURL();   // now theme <option>s exist → value assignment works
  loadItems();            // player items — don't block initial render
  applyFiltersAndSort();  // fetch with correct params
});

// ─────────────────────────────────────────────────────────────────────────────
// Back-to-top
// ─────────────────────────────────────────────────────────────────────────────
function setupBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 300);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Event listeners
// ─────────────────────────────────────────────────────────────────────────────
function setupEventListeners() {
  // Create path button / modal
  document.getElementById('create-path-btn').addEventListener('click', () => {
    document.getElementById('create-path-modal').classList.add('active');
  });
  document
    .getElementById('close-create-modal')
    .addEventListener('click', () => {
      document.getElementById('create-path-modal').classList.remove('active');
    });
  document
    .getElementById('create-path-form')
    .addEventListener('submit', handleCreatePath);

  // Path player modal
  document.getElementById('close-player').addEventListener('click', () => {
    document.getElementById('path-player-modal').classList.remove('active');
    currentPath = null;
    currentStepIndex = 0;
  });
  document.getElementById('prev-step').addEventListener('click', () => {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      displayPathStep();
    }
  });
  document.getElementById('next-step').addEventListener('click', () => {
    if (
      currentPath &&
      currentStepIndex < (currentPath.items || []).length - 1
    ) {
      currentStepIndex++;
      displayPathStep();
    }
  });

  // Filter / sort controls
  document
    .getElementById('theme-filter')
    .addEventListener('change', applyFiltersAndSort);
  document
    .getElementById('sort-select')
    .addEventListener('change', applyFiltersAndSort);
  document
    .getElementById('order-select')
    .addEventListener('change', applyFiltersAndSort);

  // Clear all filters
  document
    .getElementById('clear-filters-btn')
    .addEventListener('click', clearFilters);
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme dropdown — populated from /api/paths/themes
// ─────────────────────────────────────────────────────────────────────────────
async function loadThemes() {
  try {
    const res = await fetch('/api/paths/themes');
    if (!res.ok) throw new Error('API error');
    const themes = await res.json();
    const select = document.getElementById('theme-filter');

    // Clear any stale options except the first "All Themes" option
    while (select.options.length > 1) select.remove(1);

    themes.forEach((theme) => {
      const opt = document.createElement('option');
      opt.value = theme;
      opt.textContent = theme;
      select.appendChild(opt);
    });
    // URL sync is done by loadFiltersFromURL() AFTER this function returns
  } catch (err) {
    console.warn('Could not load themes from API:', err);
    // Non-fatal: theme dropdown will only show "All Themes"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter + Sort — server-side via query params
// ─────────────────────────────────────────────────────────────────────────────
async function applyFiltersAndSort() {
  const theme = document.getElementById('theme-filter').value;
  const sort = document.getElementById('sort-select').value;
  const order = document.getElementById('order-select').value;

  // Build query string
  const params = new URLSearchParams();
  if (theme) params.set('theme', theme);
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);

  saveFiltersToURL({ theme, sort, order });
  renderActiveFilterBadges({ theme, sort, order });

  const pathsList = document.getElementById('paths-list');
  if (window.SkeletonEngine) {
    window.SkeletonEngine.show(pathsList, 'list', 5, false);
  }

  try {
    const qs = params.toString();
    const res = await fetch(`/api/paths${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    allPaths = data.map((p) => ({ ...p, items: p.items || [] }));
  } catch (err) {
    console.error('Error loading paths, falling back to sample data:', err);
    allPaths = getSamplePaths();
  }
  
  if (window.SkeletonEngine) {
    window.SkeletonEngine.hide(pathsList);
  }

  totalPaths = allPaths.length;
  displayPaths();
  updateResultsCount();
}

// ─────────────────────────────────────────────────────────────────────────────
// URL persistence
// ─────────────────────────────────────────────────────────────────────────────
function saveFiltersToURL({ theme, sort, order }) {
  const params = new URLSearchParams(window.location.search);
  if (theme) {
    params.set('theme', theme);
  } else {
    params.delete('theme');
  }
  if (sort) {
    params.set('sort', sort);
    params.set('order', order);
  } else {
    params.delete('sort');
    params.delete('order');
  }
  const newURL =
    window.location.pathname + (params.toString() ? '?' + params.toString() : '');
  window.history.replaceState({}, '', newURL);
}

function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme') || '';
  const sort = params.get('sort') || '';
  const order = params.get('order') || 'desc';

  const themeEl = document.getElementById('theme-filter');
  const sortEl = document.getElementById('sort-select');
  const orderEl = document.getElementById('order-select');

  if (themeEl) themeEl.value = theme;
  if (sortEl) sortEl.value = sort;
  if (orderEl) orderEl.value = order;
}

// ─────────────────────────────────────────────────────────────────────────────
// Active filter badges
// ─────────────────────────────────────────────────────────────────────────────
function renderActiveFilterBadges({ theme, sort, order }) {
  const container = document.getElementById('active-filters');
  const clearBtn = document.getElementById('clear-filters-btn');
  container.innerHTML = '';

  const hasFilters = Boolean(theme) || Boolean(sort);
  clearBtn.hidden = !hasFilters;

  if (theme) {
    container.appendChild(
      makeBadge(`🏷️ ${theme}`, () => {
        document.getElementById('theme-filter').value = '';
        applyFiltersAndSort();
      })
    );
  }

  // Only show sort badge when a valid sort is active
  if (sort === 'itemCount') {
    const sortLabel = tPath('paths_sort_item_count');
    const orderLabel = order === 'asc' ? tPath('paths_order_asc') : tPath('paths_order_desc');
    container.appendChild(
      makeBadge(`📊 ${sortLabel} (${orderLabel})`, () => {
        document.getElementById('sort-select').value = '';
        applyFiltersAndSort();
      })
    );
  }
}

function makeBadge(label, onRemove) {
  const badge = document.createElement('span');
  badge.className = 'filter-badge';

  const text = document.createElement('span');
  text.textContent = label;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.setAttribute('aria-label', `Remove filter: ${label}`);
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onRemove();
  });

  badge.appendChild(text);
  badge.appendChild(removeBtn);
  return badge;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clear all filters
// ─────────────────────────────────────────────────────────────────────────────
function clearFilters() {
  document.getElementById('theme-filter').value = '';
  document.getElementById('sort-select').value = '';
  document.getElementById('order-select').value = 'desc';
  applyFiltersAndSort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Results count
// ─────────────────────────────────────────────────────────────────────────────
function updateResultsCount() {
  const el = document.getElementById('paths-results-count');
  if (!el) return;
  // Only show the count when there are results (empty state has its own UI)
  el.textContent = totalPaths > 0
    ? tPath('paths_results_count').replace('{n}', totalPaths)
    : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh i18n labels inside controls (called on lang change)
// ─────────────────────────────────────────────────────────────────────────────
function refreshFilterControlLabels() {
  // The languageSwitcher handles data-i18n elements automatically;
  // only the dynamic option text for sort/order need manual refresh.
  const sortDefault = document.querySelector('#sort-select option[value=""]');
  if (sortDefault) sortDefault.textContent = tPath('paths_sort_default');
  const sortItem = document.querySelector('#sort-select option[value="itemCount"]');
  if (sortItem) sortItem.textContent = tPath('paths_sort_item_count');

  const orderAsc = document.querySelector('#order-select option[value="asc"]');
  if (orderAsc) orderAsc.textContent = tPath('paths_order_asc');
  const orderDesc = document.querySelector('#order-select option[value="desc"]');
  if (orderDesc) orderDesc.textContent = tPath('paths_order_desc');

  const themeAll = document.querySelector('#theme-filter option[value=""]');
  if (themeAll) themeAll.textContent = tPath('paths_filter_all_themes');
}

// ─────────────────────────────────────────────────────────────────────────────
// Sample paths (offline fallback — keys only)
// ─────────────────────────────────────────────────────────────────────────────
function getSamplePaths() {
  return [
    {
      id: 'path-sample-1',
      titleKey: 'path_sample1_title',
      themeKey: 'path_sample1_theme',
      descKey: 'path_sample1_desc',
      items: ['sample-item-1', 'sample-item-2', 'sample-item-3'],
    },
    {
      id: 'path-sample-2',
      titleKey: 'path_sample2_title',
      themeKey: 'path_sample2_theme',
      descKey: 'path_sample2_desc',
      items: ['sample-item-4', 'sample-item-5'],
    },
  ];
}

// ── Sample gallery items so the player has something to show ─────────────────
function getSampleItems() {
  return [
    {
      id: 'sample-item-1',
      title: 'Kantha Running Stitch',
      type: 'visual',
      location: 'Murshidabad, Bengal',
      description:
        'The basic running stitch used in Kantha embroidery, layering old saris to create warmth and beauty.',
      imageUrl: '',
      audioUrl: '',
    },
    {
      id: 'sample-item-2',
      title: 'Nakshi Kantha Motifs',
      type: 'visual',
      location: 'Rajshahi, Bengal',
      description:
        'Intricate motifs depicting fish, lotus flowers, and village life stitched in bright threads.',
      imageUrl: '',
      audioUrl: '',
    },
    {
      id: 'sample-item-3',
      title: "Elder's Story: Origins of Kantha",
      type: 'audio',
      location: 'Birbhum, Bengal',
      description:
        'A village elder recounts how Kantha began as a way to recycle worn saris into quilts for newborns.',
      imageUrl: '',
      audioUrl: '',
    },
    {
      id: 'sample-item-4',
      title: 'Madhubani Fish Motif',
      type: 'visual',
      location: 'Madhubani, Bihar',
      description:
        'Fish are considered auspicious in Mithila culture and appear in almost every Madhubani painting.',
      imageUrl: '',
      audioUrl: '',
    },
    {
      id: 'sample-item-5',
      title: 'Kohbar Room Paintings',
      type: 'visual',
      location: 'Darbhanga, Bihar',
      description:
        'Traditional paintings done on the walls of the bridal chamber, depicting bamboo groves and lotus ponds.',
      imageUrl: '',
      audioUrl: '',
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve display text from API path or sample path
// ─────────────────────────────────────────────────────────────────────────────
function pathTitle(path) {
  return path.titleKey ? tPath(path.titleKey) : path.title || '';
}
function pathTheme(path) {
  return path.themeKey ? tPath(path.themeKey) : path.theme || '';
}
function pathDesc(path) {
  return path.descKey ? tPath(path.descKey) : path.description || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Items loader (for the path player)
// ─────────────────────────────────────────────────────────────────────────────
async function loadItems() {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    allItems = Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('Error loading items, using samples:', error);
    allItems = getSampleItems();
  }
  populateItemsSelector();
}

// ─────────────────────────────────────────────────────────────────────────────
// Render path cards
// ─────────────────────────────────────────────────────────────────────────────
function displayPaths() {
  const pathsList = document.getElementById('paths-list');

  if (!allPaths || allPaths.length === 0) {
    // Distinguish: active filter returned nothing vs truly no paths exist
    const theme = document.getElementById('theme-filter')?.value || '';
    const sort  = document.getElementById('sort-select')?.value || '';
    const hasActiveFilter = Boolean(theme) || Boolean(sort);

    if (hasActiveFilter) {
      pathsList.innerHTML = `
        <div class="paths-empty">
          <span class="paths-empty-icon">🔍</span>
          <p class="paths-empty-title">${escapeHtml(tPath('paths_no_match_title') || 'No paths match your filters')}</p>
          <p>${escapeHtml(tPath('paths_no_match_desc') || 'Try adjusting the theme filter or clearing all filters.')}</p>
          <button class="btn btn-ghost" onclick="clearFilters()" style="margin-top:1rem;">
            ${escapeHtml(tPath('paths_clear_filters_btn'))}
          </button>
        </div>`;
    } else {
      pathsList.innerHTML = `
        <div class="paths-empty">
          <span class="paths-empty-icon">🛤️</span>
          <p class="paths-empty-title">${escapeHtml(tPath('paths_empty_title'))}</p>
          <p>${escapeHtml(tPath('paths_empty_desc'))}</p>
        </div>`;
    }
    return;
  }

  pathsList.innerHTML = allPaths
    .map((path) => {
      const items = path.items || [];
      const theme = escapeHtml(pathTheme(path));
      return `
        <div class="path-card" onclick="playPath('${path.id}')" tabindex="0" role="button"
             aria-label="${escapeHtml(pathTitle(path))}">
          <div class="path-card-header">
            <div>
              <h3>${escapeHtml(pathTitle(path))}</h3>
              <span class="path-card-theme">${theme}</span>
            </div>
          </div>
          <p>${escapeHtml(pathDesc(path))}</p>
          <div class="path-card-stats">
            <span>📚 ${items.length} ${tPath('paths_items_label')}</span>
            <span>⏱️ ~${Math.ceil(items.length * 3)} ${tPath('paths_min_label')}</span>
          </div>
          <div class="path-card-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" onclick="event.stopPropagation(); window.location.href='map.html?flyover=${path.id}'">
              🚁 3D Flyover
            </button>
          </div>
        </div>`;
    })
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Create path modal
// ─────────────────────────────────────────────────────────────────────────────
function populateItemsSelector() {
  const itemsSelector = document.getElementById('available-items');
  if (!allItems || allItems.length === 0) {
    itemsSelector.innerHTML = `<p style="color:var(--text-muted);">${tPath('paths_no_items')}</p>`;
    return;
  }
  itemsSelector.innerHTML = allItems
    .map(
      (item) => `
        <div class="item-checkbox">
          <input type="checkbox" name="path-items" value="${item.id}" id="item-${item.id}">
          <label for="item-${item.id}">${escapeHtml(item.title)} — ${escapeHtml(item.location)}</label>
        </div>
      `
    )
    .join('');
}

async function handleCreatePath(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const selectedItems = Array.from(
    document.querySelectorAll('input[name="path-items"]:checked')
  ).map((cb) => cb.value);

  if (selectedItems.length === 0) {
    alert(tPath('paths_select_items_alert'));
    return;
  }

  const data = {
    title: formData.get('title'),
    theme: formData.get('theme'),
    description: formData.get('description'),
    items: selectedItems,
  };

  try {
    const response = await fetch('/api/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      e.target.reset();
      document.getElementById('create-path-modal').classList.remove('active');
      alert(tPath('paths_created_success'));
      // Reload themes and re-apply filters to include the new path
      await loadThemes();
      await applyFiltersAndSort();
    } else {
      alert(tPath('paths_created_error'));
    }
  } catch (error) {
    console.error('Error creating path:', error);
    alert(tPath('paths_created_error'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Path player
// ─────────────────────────────────────────────────────────────────────────────
function playPath(pathId) {
  currentPath = allPaths.find((p) => p.id === pathId);
  if (!currentPath) return;
  currentPath.items = currentPath.items || [];
  currentStepIndex = 0;
  document.getElementById('path-player-title').textContent =
    pathTitle(currentPath);
  document.getElementById('path-player-modal').classList.add('active');
  displayPathStep();
}

function displayPathStep() {
  const items = currentPath ? currentPath.items || [] : [];

  if (!currentPath || items.length === 0) {
    document.getElementById('path-content').innerHTML =
      `<p style="text-align:center;padding:2rem;color:var(--text-muted);">${tPath('paths_no_steps')}</p>`;
    document.getElementById('path-progress-text').textContent =
      `${tPath('path_step_label')} 0 ${tPath('path_step_of_label')} 0`;
    document.getElementById('prev-step').disabled = true;
    document.getElementById('next-step').disabled = true;
    return;
  }

  const stepItemId = items[currentStepIndex];
  const stepItem = allItems.find((item) => item.id === stepItemId);

  if (!stepItem) {
    document.getElementById('path-content').innerHTML =
      `<p>${tPath('paths_item_not_found')}</p>`;
    return;
  }

  const progress = ((currentStepIndex + 1) / items.length) * 100;
  document.getElementById('path-progress-fill').style.width = `${progress}%`;
  document.getElementById('path-progress-text').textContent =
    `${tPath('path_step_label')} ${currentStepIndex + 1} ${tPath('path_step_of_label')} ${items.length}`;

  const audioHTML = stepItem.audioUrl
    ? `<div class="path-step-audio">
         <audio controls class="audio-player">
           <source src="${stepItem.audioUrl}" type="audio/mpeg">
           ${tPath('paths_audio_unsupported')}
         </audio>
       </div>`
    : '';

  document.getElementById('path-content').innerHTML = `
    <div class="path-step">
      ${
        stepItem.imageUrl
          ? `<img src="${stepItem.imageUrl}" alt="${escapeHtml(stepItem.title)}" class="path-step-image">`
          : `<div style="text-align:center;font-size:4rem;padding:2rem;">🖼️</div>`
      }
      <h4>${escapeHtml(stepItem.title)}</h4>
      <p><strong>${tPath('paths_location_label')}:</strong> ${escapeHtml(stepItem.location)}</p>
      <div class="markdown-body">${renderMarkdown(stepItem.description)}</div>
      ${audioHTML}
    </div>`;

  document.getElementById('prev-step').disabled = currentStepIndex === 0;
  document.getElementById('next-step').disabled =
    currentStepIndex === items.length - 1;

  const audioPlayer = document.querySelector('#path-content .audio-player');
  if (audioPlayer && typeof window.setupAudioVisualizer === 'function') {
    window.setupAudioVisualizer(audioPlayer);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.playPath = playPath;
window.clearFilters = clearFilters;
