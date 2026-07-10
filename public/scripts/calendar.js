// Seasonal Cultural Calendar Logic

let currentView = 'monthly'; // 'monthly', 'seasonal', 'timeline', 'region'
let eventsList = [];
let allUniqueStates = [];

let activeFilters = {
  q: '',
  category: '',
  month: '',
  season: '',
  state: '',
  sortBy: 'upcoming',
  page: 1,
  limit: 12,
};

let detailMap = null;

// Translation helper
function getActiveLanguage() {
  return (
    localStorage.getItem('parampara_lang') ||
    localStorage.getItem('language') ||
    'en'
  );
}

document.addEventListener('DOMContentLoaded', () => {
  initializeView();
  setupEventListeners();
  fetchInitialData();
});

// Sync with global language switcher
window.addEventListener('parampara:langchange', () => {
  renderEvents();
});

function initializeView() {
  // Set default active tab
  const tabs = document.querySelectorAll('.view-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      const selectedTab = e.currentTarget;
      selectedTab.classList.add('active');
      selectedTab.setAttribute('aria-selected', 'true');
      selectedTab.setAttribute('tabindex', '0');

      const tabId = selectedTab.id;
      if (tabId === 'btn-view-monthly') currentView = 'monthly';
      else if (tabId === 'btn-view-seasonal') currentView = 'seasonal';
      else if (tabId === 'btn-view-timeline') currentView = 'timeline';
      else if (tabId === 'btn-view-region') currentView = 'region';

      // Hide/Show pagination depending on view
      const pgBar = document.getElementById('pagination-panel');
      if (
        currentView === 'monthly' ||
        currentView === 'seasonal' ||
        currentView === 'region'
      ) {
        pgBar.style.display = 'none';
      } else {
        pgBar.style.display = 'flex';
      }

      renderEvents();
    });
  });
}

function setupEventListeners() {
  // Search input with debounce
  let debounceTimeout;
  const searchInput = document.getElementById('calendar-search');
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      activeFilters.q = e.target.value;
      activeFilters.page = 1;
      fetchFilteredEvents();
    }, 300);
  });

  // Filter Dropdowns
  document.getElementById('filter-category').addEventListener('change', (e) => {
    activeFilters.category = e.target.value;
    activeFilters.page = 1;
    fetchFilteredEvents();
  });

  document.getElementById('filter-month').addEventListener('change', (e) => {
    activeFilters.month = e.target.value;
    activeFilters.page = 1;
    fetchFilteredEvents();
  });

  document.getElementById('filter-season').addEventListener('change', (e) => {
    activeFilters.season = e.target.value;
    activeFilters.page = 1;
    fetchFilteredEvents();
  });

  document.getElementById('filter-state').addEventListener('change', (e) => {
    activeFilters.state = e.target.value;
    activeFilters.page = 1;
    fetchFilteredEvents();
  });

  document.getElementById('sort-by').addEventListener('change', (e) => {
    activeFilters.sortBy = e.target.value;
    activeFilters.page = 1;
    fetchFilteredEvents();
  });

  // Pagination buttons
  document.getElementById('prev-page-btn').addEventListener('click', () => {
    if (activeFilters.page > 1) {
      activeFilters.page--;
      fetchFilteredEvents();
    }
  });

  document.getElementById('next-page-btn').addEventListener('click', () => {
    activeFilters.page++;
    fetchFilteredEvents();
  });

  // Modal close listeners
  document
    .getElementById('close-detail-modal')
    .addEventListener('click', closeDetailModal);

  // Close modal when clicking outside content
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('event-detail-modal');
    if (e.target === modal) {
      closeDetailModal();
    }
  });

  // Esc key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
    }
  });

  // Reminder setup form
  document
    .getElementById('reminder-setup-form')
    .addEventListener('submit', handleReminderSubmit);
}

// Fetch all events initially to populate filters (like unique states)
async function fetchInitialData() {
  try {
    const response = await fetch('/api/calendar');
    if (!response.ok) throw new Error('Failed to load initial events data');
    const data = await response.json();

    // Extract unique states for dropdown filter
    allUniqueStates = [...new Set(data.map((e) => e.state))].sort();

    // Populate state filter dropdown
    const stateSelect = document.getElementById('filter-state');
    stateSelect.innerHTML =
      '<option value="">All States</option>' +
      allUniqueStates
        .map((state) => `<option value="${state}">${state}</option>`)
        .join('');

    // Save to list and render
    eventsList = data;
    renderEvents();
  } catch (error) {
    console.error('Error fetching initial data:', error);
    showErrorState(
      'Failed to load seasonal calendar data. Please try again later.'
    );
  }
}

// Fetch filtered events from API
async function fetchFilteredEvents() {
  try {
    let queryParams = new URLSearchParams();

    if (activeFilters.q) queryParams.append('q', activeFilters.q);
    if (activeFilters.category)
      queryParams.append('category', activeFilters.category);
    if (activeFilters.month) queryParams.append('month', activeFilters.month);
    if (activeFilters.season)
      queryParams.append('season', activeFilters.season);
    if (activeFilters.state) queryParams.append('state', activeFilters.state);
    if (activeFilters.sortBy)
      queryParams.append('sortBy', activeFilters.sortBy);

    // Only apply pagination parameters for Timeline View
    if (currentView === 'timeline') {
      queryParams.append('page', activeFilters.page);
      queryParams.append('limit', activeFilters.limit);
    }

    const response = await fetch(`/api/calendar?${queryParams.toString()}`);
    if (!response.ok) throw new Error('API server returned error');
    const data = await response.json();

    if (currentView === 'timeline') {
      eventsList = data.events || [];
      updatePagination(data.total, data.page, data.totalPages);
    } else {
      eventsList = data || [];
    }

    renderEvents();
  } catch (error) {
    console.error('Error fetching filtered events:', error);
    showErrorState('Failed to load search results.');
  }
}

function updatePagination(total, page, totalPages) {
  const pgBar = document.getElementById('pagination-panel');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const pageInfo = document.getElementById('page-info');

  if (total === 0) {
    pgBar.style.display = 'none';
    return;
  }

  pgBar.style.display = 'flex';
  pageInfo.textContent = `Page ${page} of ${totalPages || 1}`;

  prevBtn.disabled = page === 1;
  nextBtn.disabled = page >= totalPages;
}

function renderEvents() {
  const container = document.getElementById('view-content');
  if (!container) return;

  if (eventsList.length === 0) {
    renderEmptyState(container);
    return;
  }

  if (currentView === 'monthly') {
    renderMonthlyGrid(container);
  } else if (currentView === 'seasonal') {
    renderSeasonalView(container);
  } else if (currentView === 'timeline') {
    renderTimelineView(container);
  } else if (currentView === 'region') {
    renderRegionView(container);
  }
}

/* RENDERING FUNCTIONS */

// Monthly Grid View
function renderMonthlyGrid(container) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let html = `<div class="monthly-grid-container">`;

  months.forEach((month) => {
    // Filter events happening in this specific month
    const monthEvents = eventsList.filter(
      (e) => e.month.toLowerCase() === month.toLowerCase()
    );

    html += `
      <div class="month-box">
        <div class="month-header">
          <h3>${month}</h3>
          <span class="month-event-count">${monthEvents.length} events</span>
        </div>
        <ul class="month-events-list">
          ${
            monthEvents
              .map(
                (e) => `
            <li class="month-event-item" onclick="openDetailModal('${e.id}')" role="button" tabindex="0">
              <strong>${e.startDate.split('-')[2]}:</strong> ${e.title}
            </li>
          `
              )
              .join('') ||
            `<p style="font-size:0.82rem; color:rgba(255,255,255,0.4); text-align:center; margin-top:2rem;">No events scheduled</p>`
          }
        </ul>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Seasonal View
function renderSeasonalView(container) {
  const seasons = ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter'];
  const seasonIcons = {
    Spring: 'ti-flower-filled',
    Summer: 'ti-sun-filled',
    Monsoon: 'ti-cloud-rain',
    Autumn: 'ti-leaf-2',
    Winter: 'ti-snowflake',
  };

  let html = `<div class="seasonal-decks">`;

  seasons.forEach((season) => {
    const seasonEvents = eventsList.filter(
      (e) => e.season.toLowerCase() === season.toLowerCase()
    );
    if (seasonEvents.length === 0) return; // Skip empty seasons

    html += `
      <div class="season-deck">
        <div class="season-deck-header">
          <i class="ti ${seasonIcons[season] || 'ti-wind-sun'}"></i>
          <h3>${season} Season</h3>
        </div>
        <div class="events-cards-grid">
          ${seasonEvents.map((e) => renderEventCardHtml(e)).join('')}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Timeline View (Chronological listing)
function renderTimelineView(container) {
  let html = `<div class="timeline-list">`;

  eventsList.forEach((e) => {
    html += `
      <div class="timeline-item" onclick="openDetailModal('${e.id}')" role="button" tabindex="0">
        <div class="timeline-marker"></div>
        <div class="timeline-card">
          <span class="timeline-date">${formatDate(e.startDate)} ${e.endDate !== e.startDate ? ` - ${formatDate(e.endDate)}` : ''}</span>
          <h4>${e.title}</h4>
          <p class="event-card-meta">
            <span><i class="ti ti-map-pin"></i> ${e.village ? e.village + ', ' : ''}${e.state}</span>
            <span><i class="ti ti-tag"></i> ${e.category}</span>
          </p>
          <p style="font-size:0.9rem; color:rgba(245,222,179,0.85); margin-top:0.5rem;">${e.description}</p>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Region View
function renderRegionView(container) {
  // Group events by state
  const stateGroups = {};
  eventsList.forEach((e) => {
    if (!stateGroups[e.state]) {
      stateGroups[e.state] = [];
    }
    stateGroups[e.state].push(e);
  });

  let html = `<div class="region-clusters">`;

  Object.keys(stateGroups)
    .sort()
    .forEach((state) => {
      html += `
      <div class="region-cluster">
        <h3 class="region-cluster-title">${state} (${stateGroups[state].length} events)</h3>
        <div class="events-cards-grid">
          ${stateGroups[state].map((e) => renderEventCardHtml(e)).join('')}
        </div>
      </div>
    `;
    });

  html += `</div>`;
  container.innerHTML = html;
}

function renderEventCardHtml(event) {
  const metaText = `${event.village ? event.village + ', ' : ''}${event.state}`;
  return `
    <div class="event-card" onclick="openDetailModal('${event.id}')" role="button" tabindex="0">
      <div class="event-card-image" style="background-image: url('${event.images[0] || 'https://images.unsplash.com/photo-1547841243-eacb14453cd9?auto=format&fit=crop&w=800&q=80'}')">
        <span class="event-card-badge">${event.category}</span>
      </div>
      <div class="event-card-content">
        <h4 class="event-card-title">${event.title}</h4>
        <div class="event-card-meta">
          <span><i class="ti ti-calendar"></i> ${formatDate(event.startDate)}</span>
          <span><i class="ti ti-map-pin"></i> ${metaText}</span>
        </div>
        <p class="event-card-desc">${event.description}</p>
      </div>
    </div>
  `;
}

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <i class="ti ti-calendar-off"></i>
      <h3>No events found</h3>
      <p>Try adjustments to your search or category filters.</p>
    </div>
  `;
}

function showErrorState(message) {
  const container = document.getElementById('view-content');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" style="border-color: var(--rust-red);">
      <i class="ti ti-alert-triangle" style="color: var(--rust-red);"></i>
      <h3>Something went wrong</h3>
      <p>${message}</p>
    </div>
  `;
}

/* EVENT DETAIL MODAL HANDLING */

async function openDetailModal(eventId) {
  const modal = document.getElementById('event-detail-modal');
  if (!modal) return;

  try {
    const response = await fetch(`/api/calendar/${eventId}`);
    if (!response.ok) throw new Error('Could not load event data');
    const event = await response.json();

    // Map DOM values
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-img').src = event.images[0] || '';
    document.getElementById('modal-event-img').alt =
      `Visual depiction of ${event.title}`;
    document.getElementById('modal-event-desc').textContent = event.description;
    document.getElementById('modal-event-history').textContent =
      event.historicalBackground || 'Historical background not yet archived.';
    document.getElementById('modal-event-importance').textContent =
      event.culturalImportance || 'Cultural significance details coming soon.';

    // Date and locations
    document.getElementById('modal-event-date').innerHTML =
      `<i class="ti ti-calendar-event"></i> ${formatDate(event.startDate)} ${event.endDate !== event.startDate ? ` - ${formatDate(event.endDate)}` : ''}`;
    document.getElementById('modal-event-category').innerHTML =
      `<i class="ti ti-tag"></i> ${event.category}`;
    document.getElementById('modal-event-location').innerHTML =
      `<i class="ti ti-map-pin"></i> ${event.village ? event.village + ', ' : ''}${event.district ? event.district + ', ' : ''}${event.state}`;
    document.getElementById('modal-event-community').innerHTML =
      `<i class="ti ti-users"></i> ${event.community || 'Local villagers'}`;

    // Audio narration
    const audioContainer = document.getElementById('modal-audio-container');
    const audioElem = document.getElementById('modal-event-audio');
    if (event.audioStory) {
      audioContainer.style.display = 'block';
      audioElem.src = event.audioStory;
    } else {
      audioContainer.style.display = 'none';
      audioElem.src = '';
    }

    // Traditional rituals
    const ritualsUl = document.getElementById('modal-event-rituals');
    if (event.rituals && event.rituals.length > 0) {
      ritualsUl.innerHTML = event.rituals.map((r) => `<li>${r}</li>`).join('');
    } else {
      ritualsUl.innerHTML =
        '<li>Details on traditional rituals are currently being collected.</li>';
    }

    // Cross integrations tags
    renderTags(
      'modal-associated-crafts',
      event.associatedCrafts,
      'No associated crafts recorded'
    );
    renderTags(
      'modal-associated-recipes',
      event.associatedRecipes,
      'No associated recipes recorded'
    );
    renderTags(
      'modal-associated-stories',
      event.associatedStories,
      'No associated stories recorded'
    );
    renderTags(
      'modal-associated-trails',
      event.relatedHeritageTrails,
      'No related trails recorded'
    );

    // Visitor Guide
    document.getElementById('modal-visitor-info').textContent =
      event.visitorInformation || 'No visitor guidance details available.';
    document.getElementById('modal-travel-tips').textContent =
      event.travelTips ||
      'Respect local customs, seek permissions before photography, and do not litter.';

    // Countdown Badge
    updateCountdown(event.startDate, event.endDate);

    // Setup ICS export button action
    const exportBtn = document.getElementById('btn-export-ics');
    exportBtn.onclick = () => exportToICS(event);

    // Save active event ID in form for future mock reminders
    document.getElementById('reminder-setup-form').dataset.eventId = event.id;
    document.getElementById('reminder-status-message').textContent = '';

    // Open Modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock background scroll

    // Load Detail Map Libre Map
    initializeDetailMap(event.coordinates, event.title, event.village);
  } catch (error) {
    console.error('Error opening event detail modal:', error);
    alert('Unable to load event details.');
  }
}

function renderTags(elementId, tagList, fallbackText) {
  const container = document.getElementById(elementId);
  if (!container) return;

  if (tagList && tagList.length > 0) {
    container.innerHTML = tagList.map((tag) => `<span>${tag}</span>`).join('');
  } else {
    container.innerHTML = `<span style="opacity: 0.6; background: transparent; border-style: dashed;">${fallbackText}</span>`;
  }
}

function updateCountdown(startStr, endStr) {
  const badge = document.getElementById('modal-event-countdown');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (now >= start && now <= end) {
    badge.textContent = 'Happening Now';
    badge.style.background = 'var(--field-green)';
    badge.style.borderColor = 'var(--wheat-yellow)';
  } else if (start > now) {
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    badge.textContent = `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    badge.style.background = 'var(--terracotta)';
    badge.style.borderColor = 'var(--mustard)';
  } else {
    badge.textContent = `Completed on ${formatDate(startStr)}`;
    badge.style.background = 'rgba(20, 10, 3, 0.8)';
    badge.style.borderColor = 'rgba(205, 133, 63, 0.4)';
  }
}

function closeDetailModal() {
  const modal = document.getElementById('event-detail-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto'; // Unlock background scroll

  // Stop audio if playing
  const audioElem = document.getElementById('modal-event-audio');
  if (audioElem) {
    audioElem.pause();
    audioElem.src = '';
  }

  // Destroy MapLibre map instance to free memory
  if (detailMap) {
    detailMap.remove();
    detailMap = null;
  }
}

/* MapLibre GL Integration in Modal */
async function initializeDetailMap(coordinates, eventTitle, villageName) {
  const mapContainer = document.getElementById('detail-map');
  if (!mapContainer) return;

  // Clean container just in case
  mapContainer.innerHTML = '';

  if (!coordinates || coordinates.length !== 2) {
    mapContainer.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.4)">Map coordinates unavailable</div>';
    return;
  }

  try {
    const response = await fetch('/api/map-style');
    const data = await response.json();

    if (!response.ok || data.configured === false) {
      mapContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:1rem;text-align:center;">
          <p style="font-size:1.5rem;margin-bottom:0.5rem">🗺️</p>
          <p style="font-size:0.8rem;color:rgba(255,255,255,0.6)">${data.message || 'Map tiles unavailable'}</p>
        </div>
      `;
      return;
    }

    detailMap = new maplibregl.Map({
      container: 'detail-map',
      style: data,
      center: [coordinates[1], coordinates[0]], // MapLibre takes [lng, lat]
      zoom: 10,
    });

    detailMap.addControl(new maplibregl.NavigationControl());

    detailMap.on('load', () => {
      // Add custom marker
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.background = 'var(--terracotta)';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="color:var(--text-dark);padding:0.25rem;">
          <strong style="display:block;font-size:0.9rem;">${eventTitle}</strong>
          <span style="font-size:0.75rem;color:#666">${villageName || 'Local Village'}</span>
        </div>
      `);

      new maplibregl.Marker(el)
        .setLngLat([coordinates[1], coordinates[0]])
        .setPopup(popup)
        .addTo(detailMap);

      // Open popup on load
      popup.addTo(detailMap);
    });
  } catch (error) {
    console.error('Error loading detail map:', error);
    mapContainer.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.4)">Error loading map tiles</div>';
  }
}

/* CALENDAR EXPORT (.ICS) */

function exportToICS(event) {
  const title = event.title;
  const desc = event.description.replace(/\r?\n/g, '\\n');
  const loc = `${event.village ? event.village + ', ' : ''}${event.state}`;
  const startStr = event.startDate.replace(/-/g, '');
  const endStr = event.endDate.replace(/-/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Parampara//Seasonal Cultural Calendar//EN',
    'BEGIN:VEVENT',
    `UID:event-${event.id}@parampara.org`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startStr}T090000`,
    `DTEND:${endStr}T180000`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_schedule.ics`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* REMINDER SUBMIT (MOCK SYSTEM) */

function handleReminderSubmit(e) {
  e.preventDefault();
  const leadTime = document.getElementById('reminder-lead-time').value;
  const statusMsg = document.getElementById('reminder-status-message');

  statusMsg.className = 'reminder-status success';

  const activeLang = getActiveLanguage();
  if (activeLang === 'hi') {
    statusMsg.textContent = `✓ अनुस्मारक सफलतापूर्वक सेट किया गया: कार्यक्रम से ${leadTime} दिन पहले!`;
  } else if (activeLang === 'mr') {
    statusMsg.textContent = `✓ स्मरणपत्र यशस्वीरित्या सेट केला: कार्यक्रमाच्या ${leadTime} दिवस आधी!`;
  } else {
    statusMsg.textContent = `✓ Reminder successfully configured for ${leadTime} day(s) before the event!`;
  }
}

/* GENERAL HELPERS */

function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString(getActiveLanguage(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

window.openDetailModal = openDetailModal;
