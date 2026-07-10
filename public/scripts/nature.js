// Sacred Natural Heritage Explorer JavaScript

let map;
let markers = [];
let sites = [];
let selectedSiteId = null;

let currentLanguage =
  localStorage.getItem('parampara_lang') ||
  localStorage.getItem('language') ||
  'en';

document.addEventListener('DOMContentLoaded', () => {
  initializeMap();
  setupFiltersAndSearch();
  setupTabs();
  setupFormHandler();
  setupGlobalLangListener();
});

// Translation helper
function getTranslation(key) {
  if (typeof PARAMPARA_TRANSLATIONS === 'undefined') return key;
  const dict = PARAMPARA_TRANSLATIONS[currentLanguage] || PARAMPARA_TRANSLATIONS['en'];
  return (dict && dict[key]) || PARAMPARA_TRANSLATIONS['en'][key] || key;
}

// Localized object content helper
function getLocalized(obj) {
  if (!obj) return '';
  return obj[currentLanguage] || obj['en'] || '';
}

// Map Loading Fallback Notice (matches map.js style)
function showMapUnavailableNotice(message) {
  const mapEl = document.getElementById('nature-map');
  if (!mapEl) return;
  mapEl.innerHTML = '';
  mapEl.style.display = 'flex';
  mapEl.style.alignItems = 'center';
  mapEl.style.justifyContent = 'center';

  const notice = document.createElement('div');
  notice.className = 'map-unavailable-notice';
  notice.style.textAlign = 'center';
  notice.style.padding = '2rem';
  notice.style.color = '#fff8dc';

  notice.innerHTML = `
        <p style="font-size:3rem;margin-bottom:1rem;">🗺️</p>
        <p style="font-size:1.15rem;font-weight:600;margin-bottom:0.75rem;line-height:1.6;">
          ${message || getTranslation('mapConfigMessage')}
        </p>
        <p style="font-size:0.95rem;color:rgba(255,248,220,0.7);line-height:1.5;">
          ${getTranslation('mapConfigHint')}
        </p>
    `;

  mapEl.appendChild(notice);
}

// Initialize MapLibre Map
async function initializeMap() {
  try {
    const response = await fetch('/api/map-style');
    const styleData = await response.json();

    if (!response.ok || styleData.configured === false) {
      showMapUnavailableNotice(styleData.message);
      // Still load sites list even if map is unavailable
      loadSites();
      return;
    }

    map = new maplibregl.Map({
      container: 'nature-map',
      style: styleData,
      center: [78.9629, 22.5937],
      zoom: 5,
    });

    map.addControl(new maplibregl.NavigationControl());

    map.on('load', () => {
      setMapLanguage(currentLanguage);
      loadSites();
    });

    map.on('error', (event) => {
      console.error('Map error:', event.error);
    });
  } catch (error) {
    console.error('Error initializing map:', error);
    showMapUnavailableNotice(null);
    loadSites();
  }
}

// Set language layers on map
function setMapLanguage(lang) {
  if (!map) return;
  const style = map.getStyle();
  if (!style || !style.layers) return;

  style.layers.forEach((layer) => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      if (lang === 'hi') {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name:hi'],
          ['get', 'name'],
        ]);
      } else if (lang === 'mr') {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name:mr'],
          ['get', 'name:hi'],
          ['get', 'name'],
        ]);
      } else {
        map.setLayoutProperty(layer.id, 'text-field', ['get', 'name']);
      }
    }
  });
}

// Fetch Sites from Backend API
async function loadSites() {
  try {
    const response = await fetch('/api/nature');
    if (!response.ok) throw new Error('API request failed');
    sites = await response.json();

    filterAndRender();
  } catch (error) {
    console.error('Failed to load sacred heritage sites:', error);
    const container = document.getElementById('sites-list');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;color:var(--warm-beige);padding:2rem;">
          <p>⚠️ Failed to load sacred natural heritage sites.</p>
          <button class="btn btn-primary" onclick="loadSites()" style="margin-top:1rem;">Retry</button>
        </div>
      `;
    }
  }
}

// Filter and Render logic
function filterAndRender() {
  const searchInput = document.getElementById('nature-search-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const activeChip = document.querySelector('.chip.active');
  const category = activeChip ? activeChip.dataset.category : 'all';

  let filtered = sites;

  // Filter by category
  if (category !== 'all') {
    filtered = filtered.filter(site => site.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by search text
  if (query) {
    filtered = filtered.filter(site => {
      const name = getLocalized(site.name).toLowerCase();
      const location = getLocalized(site.location).toLowerCase();
      const desc = getLocalized(site.description).toLowerCase();
      const cat = site.category.toLowerCase();
      return name.includes(query) || location.includes(query) || desc.includes(query) || cat.includes(query);
    });
  }

  renderSitesList(filtered);
  addSiteMarkers(filtered);
}

// Render the list of cards
function renderSitesList(filteredSites) {
  const container = document.getElementById('sites-list');
  if (!container) return;

  if (filteredSites.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;color:rgba(255,248,220,0.6);padding:3rem 1rem;">
        <p style="font-size:2rem;margin-bottom:0.5rem;">🍃</p>
        <p>No sacred natural landmarks match your filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredSites.map(site => {
    const isSelected = selectedSiteId === site.id ? 'selected' : '';
    const catNameKey = `cat_${site.category}`;
    return `
      <div class="nature-card ${isSelected}" data-id="${site.id}" onclick="selectSite('${site.id}')">
        <div class="nature-card-header">
          <h4>${escapeHtml(getLocalized(site.name))}</h4>
          <span class="card-category-badge ${site.category}">${escapeHtml(getTranslation(catNameKey))}</span>
        </div>
        <div class="nature-card-loc">📍 ${escapeHtml(getLocalized(site.location))}</div>
        <p class="nature-card-desc">${escapeHtml(getLocalized(site.description))}</p>
      </div>
    `;
  }).join('');
}

// Add site markers to map
function addSiteMarkers(filteredSites) {
  if (!map) return;

  // Remove existing markers
  markers.forEach(m => m.remove());
  markers = [];

  filteredSites.forEach(site => {
    if (!site.coordinates || site.coordinates.length !== 2) return;

    // Create custom marker element
    const el = document.createElement('div');
    el.className = `nature-marker ${site.category}`;
    el.title = getLocalized(site.name);

    // Give category appropriate emoji
    let emoji = '🍃';
    if (site.category === 'pond') emoji = '💧';
    if (site.category === 'tree') emoji = '🌳';
    if (site.category === 'river') emoji = '🌊';
    if (site.category === 'hill') emoji = '⛰️';
    el.innerHTML = emoji;

    // Coordinate mapping: database stores [latitude, longitude], MapLibre expects [longitude, latitude]
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([site.coordinates[1], site.coordinates[0]])
      .addTo(map);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSite(site.id);
    });

    markers.push(marker);
  });
}

// Select a site
function selectSite(siteId) {
  selectedSiteId = siteId;

  // Update card highlighting
  document.querySelectorAll('.nature-card').forEach(card => {
    if (card.dataset.id === siteId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const site = sites.find(s => s.id === siteId);
  if (!site) return;

  // Zoom map to coordinates
  if (map && site.coordinates) {
    map.flyTo({
      center: [site.coordinates[1], site.coordinates[0]],
      zoom: 12,
      essential: true
    });
  }

  showSiteDetails(site);
}

// Show sliding detail panel
function showSiteDetails(site) {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  // Reset form messages
  const msgEl = document.getElementById('submission-message');
  if (msgEl) msgEl.className = 'submission-msg';

  // Populating text content
  document.getElementById('detail-name').textContent = getLocalized(site.name);
  document.getElementById('detail-location-badge').innerHTML = `📍 ${escapeHtml(getLocalized(site.location))}`;
  
  const catNameKey = `cat_${site.category}`;
  const catBadge = document.getElementById('detail-category-badge');
  catBadge.textContent = getTranslation(catNameKey);
  catBadge.className = `category-badge ${site.category}`;

  document.getElementById('detail-description').textContent = getLocalized(site.description);
  document.getElementById('detail-conservation-status').textContent = getLocalized(site.conservationStatus);

  // Tab details
  document.getElementById('detail-significance').textContent = getLocalized(site.significance);
  document.getElementById('detail-folklore').textContent = getLocalized(site.folklore);
  document.getElementById('detail-rituals').textContent = getLocalized(site.rituals);
  document.getElementById('detail-seasonal').textContent = getLocalized(site.seasonalChanges);

  // Hero Image
  const imgEl = document.getElementById('detail-image');
  if (site.images && site.images.length > 0) {
    imgEl.style.backgroundImage = `url('${site.images[0]}')`;
  } else {
    imgEl.style.backgroundImage = 'none';
  }

  // User submissions list
  renderUserFolklore(site.userFolklore);

  // Connections rendering
  renderConnections('connections-villages', site.nearbyConnections.villages);
  renderConnections('connections-crafts', site.nearbyConnections.crafts);
  renderConnections('connections-festivals', site.nearbyConnections.festivals);

  panel.classList.add('active');
}

// Render User folklore
function renderUserFolklore(userList) {
  const container = document.getElementById('detail-user-folklore');
  if (!container) return;

  if (!userList || userList.length === 0) {
    container.innerHTML = `<p style="font-style:italic;color:var(--text-muted);font-size:0.9rem;">No community folklore submitted yet. Be the first to share!</p>`;
    return;
  }

  container.innerHTML = userList.map(item => `
    <div class="folklore-item">
      <div class="folklore-item-meta">
        <span>👤 ${escapeHtml(item.author)}</span>
        <span>${formatDate(item.timestamp)}</span>
      </div>
      <p style="margin:0;font-size:0.9rem;">${escapeHtml(item.content)}</p>
    </div>
  `).join('');
}

// Render nearby connections badges
function renderConnections(elementId, items) {
  const container = document.getElementById(elementId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<span style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">None</span>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <a href="${item.link}" class="connection-badge-link">${escapeHtml(getLocalized(item.name))}</a>
  `).join('');
}

// Tabs setup
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.id === `tab-${targetTab}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

// Filter and search setup
function setupFiltersAndSearch() {
  const searchInput = document.getElementById('nature-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterAndRender);
  }

  const chips = document.querySelectorAll('#category-filter-chips .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterAndRender();
    });
  });

  const closeBtn = document.getElementById('close-detail-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const panel = document.getElementById('detail-panel');
      if (panel) panel.classList.remove('active');
      selectedSiteId = null;
      document.querySelectorAll('.nature-card').forEach(card => card.classList.remove('selected'));
    });
  }
}

// Submit Folklore Form handler
function setupFormHandler() {
  const form = document.getElementById('folklore-submission-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedSiteId) return;

    const authorInput = document.getElementById('folklore-author');
    const contentInput = document.getElementById('folklore-content');
    const msgEl = document.getElementById('submission-message');

    const author = authorInput ? authorInput.value : '';
    const content = contentInput ? contentInput.value : '';

    if (!content.trim()) {
      msgEl.textContent = getTranslation('folklore_submitted_error');
      msgEl.className = 'submission-msg error';
      return;
    }

    try {
      const response = await fetch(`/api/nature/${selectedSiteId}/folklore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content })
      });

      if (!response.ok) throw new Error('Folklore submission failed');
      const data = await response.json();

      // Update local storage site cache
      const siteIdx = sites.findIndex(s => s.id === selectedSiteId);
      if (siteIdx !== -1) {
        sites[siteIdx].userFolklore = data.allFolklore;
      }

      // Re-render
      renderUserFolklore(data.allFolklore);

      // Reset fields
      if (authorInput) authorInput.value = '';
      if (contentInput) contentInput.value = '';

      msgEl.textContent = getTranslation('folklore_submitted_success');
      msgEl.className = 'submission-msg success';
      setTimeout(() => {
        msgEl.className = 'submission-msg';
      }, 5000);

    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Failed to submit. Please try again later.';
      msgEl.className = 'submission-msg error';
    }
  });
}

// Global langchange listener
function setupGlobalLangListener() {
  window.addEventListener('parampara:langchange', (e) => {
    const newLang = e.detail.lang;
    if (currentLanguage === newLang) return;
    currentLanguage = newLang;

    // Apply translations to static placeholders if any
    const searchInput = document.getElementById('nature-search-input');
    if (searchInput) {
      searchInput.placeholder = getTranslation('nature_search_placeholder');
    }

    // Refresh map layout values
    setMapLanguage(currentLanguage);

    // Re-render UI list & maps
    filterAndRender();

    // Re-render detail pane if active
    if (selectedSiteId) {
      const site = sites.find(s => s.id === selectedSiteId);
      if (site) showSiteDetails(site);
    }
  });
}

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : currentLanguage === 'hi' ? 'hi-IN' : 'mr-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
