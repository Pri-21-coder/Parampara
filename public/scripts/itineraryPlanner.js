// public/scripts/itineraryPlanner.js

class ItineraryPlannerUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/itinerary';
    this.container = options.container || '#itinerary-container';
    this.culturalSites = [];
    this.daysData = []; // Structure: [{ id: 'day-1', sites: [siteObj1, siteObj2] }]
    this.draggedSite = null;
    this.draggedFromDay = null; // null if dragging from search pool, or string 'day-1' if reordering
    
    this.init();
  }

  async init() {
    this.renderLayout();
    await this.loadSites();
    this.loadPersistedItinerary();
    this.setupEventListeners();
  }

  renderLayout() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="itinerary-builder">
        <div class="itinerary-header">
          <h2>🗺️ Interactive Itinerary Planner</h2>
          <div class="header-actions">
            <button class="btn btn-secondary" id="btn-add-day">➕ Add Day</button>
            <button class="btn btn-primary" id="btn-print">🖨️ Print Itinerary</button>
            <button class="btn btn-danger" id="btn-clear">🗑️ Clear All</button>
          </div>
        </div>

        <div class="builder-layout">
          <!-- Left Column: Search & Pool -->
          <div class="pool-column no-print">
            <h3>Discover Sites</h3>
            <input type="text" id="site-search" placeholder="Search heritage, museums, nature..." class="search-input" />
            <div id="sites-pool" class="sites-pool">
              <!-- Draggable sites populate here -->
            </div>
          </div>

          <!-- Right Column: Days Dropzone -->
          <div class="schedule-column">
            <h3>Your Travel Schedule</h3>
            <div id="days-container" class="days-container">
              <!-- Day dropzones populate here -->
            </div>
            
            <div class="itinerary-summary" id="itinerary-summary" style="display:none;">
               <h4>Summary</h4>
               <p>Total Estimated Travel: <strong id="total-distance">0 km</strong></p>
               <p>Estimated Journey Time: <strong id="total-time">0 hrs</strong></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadSites() {
    try {
      const response = await fetch(`${this.apiBase}/sites`);
      const data = await response.json();
      if (data.success && data.sites) {
        this.culturalSites = data.sites;
        this.renderSitesPool(this.culturalSites);
      }
    } catch (err) {
      console.error('Failed to load cultural sites:', err);
    }
  }

  renderSitesPool(sites) {
    const pool = document.getElementById('sites-pool');
    if (!pool) return;
    pool.innerHTML = '';

    const escapeHtml = (unsafe) => {
      return (unsafe || '').toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    sites.forEach(site => {
      const el = document.createElement('div');
      el.className = 'site-card draggable-card';
      el.draggable = true;
      el.dataset.id = site.id;
      el.innerHTML = `
        <div class="card-title">${escapeHtml(site.name)}</div>
        <div class="card-meta">📍 ${escapeHtml(site.category)} | ⏱️ ${site.duration || 2} hrs</div>
        <div class="card-desc">${escapeHtml(site.description)}</div>
      `;

      // HTML5 Drag Events
      el.addEventListener('dragstart', (e) => {
        this.draggedSite = site;
        this.draggedFromDay = null; // dragging from pool
        e.dataTransfer.setData('text/plain', site.id);
        el.classList.add('dragging');
      });

      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        this.draggedSite = null;
        this.draggedFromDay = null;
      });

      pool.appendChild(el);
    });
  }

  createDayContainer(dayId, dayIndex) {
    const dayData = this.daysData.find(d => d.id === dayId);
    
    const dayEl = document.createElement('div');
    dayEl.className = 'day-dropzone';
    dayEl.dataset.dayId = dayId;
    
    let innerHtml = `
      <div class="day-header">
        <h4>Day ${dayIndex + 1}</h4>
        <button class="btn-remove-day" data-day="${dayId}">✖</button>
      </div>
      <div class="day-sites-list" id="list-${dayId}">
    `;

    if (dayData && dayData.sites.length > 0) {
      dayData.sites.forEach(site => {
        innerHtml += this.generateSiteHTML(site, dayId);
      });
    } else {
      innerHtml += `<div class="empty-drop-msg">Drag sites here to build your day</div>`;
    }

    innerHtml += `</div>
      <div class="day-metrics" id="metrics-${dayId}"></div>
    `;

    dayEl.innerHTML = innerHtml;

    // Drag & Drop event listeners for the dropzone
    const listEl = dayEl.querySelector('.day-sites-list');

    dayEl.addEventListener('dragover', (e) => {
      e.preventDefault(); // allow drop
      dayEl.classList.add('drag-over');
    });

    dayEl.addEventListener('dragleave', (e) => {
      dayEl.classList.remove('drag-over');
    });

    dayEl.addEventListener('drop', async (e) => {
      e.preventDefault();
      dayEl.classList.remove('drag-over');
      
      const siteId = e.dataTransfer.getData('text/plain');
      if (this.draggedSite) {
        // Prevent adding same site to the same day twice
        const targetDay = this.daysData.find(d => d.id === dayId);
        if (targetDay.sites.some(s => s.id === siteId)) {
          alert('Site is already added to this day!');
          return;
        }

        // Add to new day
        targetDay.sites.push(this.draggedSite);
        
        // Remove from old day if reordering between days
        if (this.draggedFromDay && this.draggedFromDay !== dayId) {
          const oldDay = this.daysData.find(d => d.id === this.draggedFromDay);
          if (oldDay) {
            oldDay.sites = oldDay.sites.filter(s => s.id !== siteId);
          }
        }

        this.saveAndRenderDays();
      }
    });

    // Remove site from day
    dayEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-site')) {
        const sid = e.target.dataset.siteId;
        const dData = this.daysData.find(d => d.id === dayId);
        dData.sites = dData.sites.filter(s => s.id !== sid);
        this.saveAndRenderDays();
      }
      
      if (e.target.classList.contains('btn-remove-day')) {
        this.daysData = this.daysData.filter(d => d.id !== dayId);
        this.saveAndRenderDays();
      }
    });

    return dayEl;
  }

  generateSiteHTML(site, dayId) {
    const escapeHtml = (unsafe) => {
      return (unsafe || '').toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    
    return `
      <div class="site-card scheduled-card" draggable="true" data-id="${site.id}" data-day="${dayId}" ondragstart="window.plannerUI.handleScheduledDragStart(event, '${site.id}', '${dayId}')" ondragend="window.plannerUI.handleScheduledDragEnd(event)">
        <div style="flex-grow: 1;">
          <div class="card-title">${escapeHtml(site.name)}</div>
          <div class="card-meta">⏱️ ${site.duration || 2} hrs</div>
        </div>
        <button class="btn-remove-site" data-site-id="${site.id}">✖</button>
      </div>
    `;
  }

  // Hook for scheduled cards dragging
  handleScheduledDragStart(e, siteId, dayId) {
    this.draggedSite = this.culturalSites.find(s => s.id === siteId);
    this.draggedFromDay = dayId;
    e.dataTransfer.setData('text/plain', siteId);
    e.target.classList.add('dragging');
  }

  handleScheduledDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedSite = null;
    this.draggedFromDay = null;
  }

  saveAndRenderDays() {
    this.persistItinerary();
    this.renderDays();
    this.calculateRoutes();
  }

  renderDays() {
    const container = document.getElementById('days-container');
    container.innerHTML = '';
    
    this.daysData.forEach((dayData, index) => {
      const dayEl = this.createDayContainer(dayData.id, index);
      container.appendChild(dayEl);
    });

    if (this.daysData.length > 0) {
      document.getElementById('itinerary-summary').style.display = 'block';
    } else {
      document.getElementById('itinerary-summary').style.display = 'none';
    }
  }

  async calculateRoutes() {
    let globalDistance = 0;
    let globalTime = 0;

    for (const day of this.daysData) {
      const metricsEl = document.getElementById(`metrics-${day.id}`);
      
      // Filter out sites without valid coordinates
      const routeCoords = day.sites
        .map(s => s.location)
        .filter(l => l && typeof l.lat === 'number' && typeof l.lng === 'number');

      if (routeCoords.length > 1) {
        try {
          const res = await fetch(`${this.apiBase}/calculate-route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: routeCoords })
          });
          const data = await res.json();
          if (data.success) {
            metricsEl.innerHTML = `🛣️ Travel: <strong>${data.totalDistanceKm.toFixed(1)} km</strong> | 🚗 Time: <strong>${data.estimatedTimeHours.toFixed(1)} hrs</strong>`;
            globalDistance += data.totalDistanceKm;
            globalTime += data.estimatedTimeHours;
          }
        } catch(err) {
          console.error("Haversine calc failed", err);
          metricsEl.innerHTML = `<span style="color:#f44336">Error calculating route</span>`;
        }
      } else {
        metricsEl.innerHTML = '';
      }
    }

    document.getElementById('total-distance').innerText = `${globalDistance.toFixed(1)} km`;
    document.getElementById('total-time').innerText = `${globalTime.toFixed(1)} hrs`;
  }

  persistItinerary() {
    localStorage.setItem('parampara_itinerary', JSON.stringify(this.daysData));
  }

  loadPersistedItinerary() {
    const saved = localStorage.getItem('parampara_itinerary');
    if (saved) {
      try {
        this.daysData = JSON.parse(saved);
        this.renderDays();
        this.calculateRoutes();
      } catch (e) {
        console.error("Corrupted localstorage itinerary", e);
      }
    }
    
    if (this.daysData.length === 0) {
      // Default state
      this.daysData.push({ id: 'day-' + Date.now(), sites: [] });
      this.renderDays();
    }
  }

  setupEventListeners() {
    // Add Day Button
    document.getElementById('btn-add-day').addEventListener('click', () => {
      this.daysData.push({ id: 'day-' + Date.now(), sites: [] });
      this.saveAndRenderDays();
    });

    // Clear All
    document.getElementById('btn-clear').addEventListener('click', () => {
      if(confirm('Are you sure you want to clear your entire itinerary?')) {
        this.daysData = [{ id: 'day-' + Date.now(), sites: [] }];
        this.saveAndRenderDays();
      }
    });

    // Search Filter
    const searchInput = document.getElementById('site-search');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = this.culturalSites.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
      );
      this.renderSitesPool(filtered);
    });

    // Print Logic
    document.getElementById('btn-print').addEventListener('click', () => {
      window.print();
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.plannerUI = new ItineraryPlannerUI();
});

// CSS Injection
const style = document.createElement('style');
style.textContent = \`
  .itinerary-builder { max-width: 1300px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
  .itinerary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  .header-actions { display: flex; gap: 10px; }
  
  .builder-layout { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
  
  .pool-column { background: #f9f9f9; padding: 20px; border-radius: 12px; border: 1px solid #ddd; height: 80vh; display: flex; flex-direction: column; }
  .pool-column h3 { margin-top: 0; color: #2E7D32; }
  .search-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; font-size: 14px; }
  .sites-pool { overflow-y: auto; flex-grow: 1; padding-right: 5px; }
  
  .site-card { background: white; border: 1px solid #e0e0e0; padding: 12px; border-radius: 8px; margin-bottom: 10px; cursor: grab; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; }
  .site-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-color: #4CAF50; }
  .site-card.dragging { opacity: 0.5; background: #e8f5e9; }
  .card-title { font-weight: 600; color: #333; margin-bottom: 4px; font-size: 15px; }
  .card-meta { font-size: 12px; color: #666; margin-bottom: 6px; }
  .card-desc { font-size: 12px; color: #777; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  
  .schedule-column { padding: 10px; }
  .schedule-column h3 { margin-top: 0; color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 10px; display: inline-block; }
  
  .day-dropzone { background: #fff; border: 2px dashed #ccc; border-radius: 12px; padding: 20px; margin-bottom: 20px; transition: background 0.3s, border-color 0.3s; }
  .day-dropzone.drag-over { background: #f1f8e9; border-color: #4CAF50; }
  .day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .day-header h4 { margin: 0; font-size: 18px; color: #333; }
  
  .empty-drop-msg { text-align: center; color: #999; padding: 20px; background: #fbfbfb; border-radius: 8px; font-style: italic; font-size: 14px; }
  
  .scheduled-card { display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #4CAF50; }
  .scheduled-card .card-desc { display: none; }
  
  .btn-remove-site, .btn-remove-day { background: none; border: none; color: #ff5252; cursor: pointer; font-size: 16px; transition: transform 0.2s; }
  .btn-remove-site:hover, .btn-remove-day:hover { transform: scale(1.2); }
  
  .day-metrics { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee; font-size: 13px; color: #555; text-align: right; }
  .itinerary-summary { background: #e8f5e9; padding: 20px; border-radius: 12px; border: 1px solid #c8e6c9; margin-top: 30px; }
  .itinerary-summary h4 { margin-top: 0; color: #2E7D32; }
  
  .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: opacity 0.2s; }
  .btn:hover { opacity: 0.9; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-secondary { background: #2196F3; color: white; }
  .btn-danger { background: #f44336; color: white; }

  /* Print Styles */
  @media print {
    body { background: white; }
    .no-print, .header-actions, .btn-remove-site, .btn-remove-day { display: none !important; }
    .builder-layout { display: block; }
    .schedule-column { padding: 0; margin: 0; }
    .day-dropzone { border: 1px solid #ccc; break-inside: avoid; page-break-inside: avoid; padding: 15px; margin-bottom: 20px; }
    .itinerary-builder { padding: 0; }
    h2, h3 { color: black !important; border-bottom: 1px solid black !important; }
  }
\`;
document.head.appendChild(style);