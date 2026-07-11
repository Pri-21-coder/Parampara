/**
 * HistoricalTimelineComponent (Advanced)
 * Renders an interactive, proportional chronological timeline.
 * Supports drag-to-scroll, dynamic scaling, alternating card placement,
 * and semantic expansion of historical milestones.
 */
class HistoricalTimelineComponent {
  constructor(options = {}) {
    this.containerId = options.containerId;
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.warn(`HistoricalTimelineComponent: Container #${this.containerId} not found.`);
      return;
    }

    this.events = [];
    this.filteredEvents = [];
    this.selectedEventId = null;
    this.categories = new Set();
    
    this.scale = 1; // zoom level
    this.baseWidthPerYear = 15; // 15px per year at scale 1
    
    // Drag to scroll state
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    
    this.init();
  }

  async init() {
    this.container.innerHTML = `
      <div class="historical-timeline-wrapper">
        <div class="historical-timeline-header">
          <div class="historical-timeline-title">
            <i class="ti ti-history"></i>
            Chronological Exploration
          </div>
          <div class="historical-timeline-controls">
            <button id="ht-zoom-out" title="Zoom Out"><i class="ti ti-zoom-out"></i></button>
            <button id="ht-zoom-in" title="Zoom In"><i class="ti ti-zoom-in"></i></button>
            <select id="ht-category-filter">
              <option value="all">All Eras & Themes</option>
            </select>
          </div>
        </div>
        <div class="historical-timeline-track-container" id="ht-track-container">
          <div class="timeline-skeleton" id="ht-skeleton"></div>
          <div class="historical-timeline-ruler" id="ht-ruler" style="display:none;"></div>
        </div>
      </div>
    `;

    this.bindDragEvents();
    
    await this.fetchData();
    this.renderFilters();
    this.renderTimeline();
    this.bindEvents();
  }

  bindDragEvents() {
    const track = document.getElementById('ht-track-container');
    if (!track) return;

    track.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on a card
      if (e.target.closest('.timeline-event-card')) return;
      
      this.isDragging = true;
      this.startX = e.pageX - track.offsetLeft;
      this.scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });

    track.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    track.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - this.startX) * 2; // scroll speed multiplier
      track.scrollLeft = this.scrollLeft - walk;
    });
  }

  async fetchData() {
    try {
      const response = await fetch('/api/timeline');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      this.events = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
      this.filteredEvents = [...this.events];
      
      this.events.forEach(event => {
        if (event.type) this.categories.add(event.type.toLowerCase());
      });
    } catch (error) {
      console.error('Failed to fetch timeline events:', error);
      this.events = [];
      this.filteredEvents = [];
    }
  }

  renderFilters() {
    const filterSelect = document.getElementById('ht-category-filter');
    if (!filterSelect) return;
    
    Array.from(this.categories).sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      filterSelect.appendChild(option);
    });
  }

  renderTimeline() {
    const track = document.getElementById('ht-track-container');
    const skeleton = document.getElementById('ht-skeleton');
    
    if (skeleton) skeleton.remove();
    
    // Clear old elements (except the ruler itself)
    const oldNodes = track.querySelectorAll('.timeline-event-node, .historical-timeline-tick, .timeline-empty');
    oldNodes.forEach(node => node.remove());

    if (this.filteredEvents.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'timeline-empty';
      empty.textContent = 'No historical records found for this selection.';
      track.appendChild(empty);
      return;
    }
    
    const ruler = document.getElementById('ht-ruler');
    ruler.style.display = 'block';
    
    const minYear = parseInt(this.filteredEvents[0].year);
    const maxYear = parseInt(this.filteredEvents[this.filteredEvents.length - 1].year);
    
    // Add padding years
    const startYear = minYear - 10;
    const endYear = maxYear + 10;
    const totalYears = endYear - startYear;
    
    const widthPerYear = this.baseWidthPerYear * this.scale;
    const totalWidth = totalYears * widthPerYear;
    
    ruler.style.width = `${totalWidth}px`;
    
    // Render decades ticks
    for (let y = Math.floor(startYear / 10) * 10; y <= endYear; y += 10) {
      if (y < startYear) continue;
      const pos = (y - startYear) * widthPerYear;
      
      const tick = document.createElement('div');
      tick.className = 'historical-timeline-tick';
      tick.style.left = `${pos}px`;
      
      const label = document.createElement('div');
      label.className = 'historical-timeline-tick-label';
      label.textContent = y;
      
      tick.appendChild(label);
      ruler.appendChild(tick);
    }
    
    // Render events alternating top/bottom
    this.filteredEvents.forEach((event, index) => {
      const year = parseInt(event.year);
      const pos = (year - startYear) * widthPerYear;
      
      const positionClass = index % 2 === 0 ? 'top' : 'bottom';
      
      const node = document.createElement('div');
      node.className = `timeline-event-node ${positionClass} ${this.selectedEventId === event.id ? 'selected' : ''}`;
      node.style.left = `${pos}px`;
      node.dataset.id = event.id;
      
      node.innerHTML = `
        <div class="timeline-event-dot"></div>
        <div class="timeline-event-connector"></div>
        <div class="timeline-event-card">
          <div class="timeline-event-header">
            <span class="timeline-event-year">${event.year}</span>
            <span class="timeline-event-icon">${event.image || '🏛️'}</span>
          </div>
          <div class="timeline-event-title">${event.title}</div>
          <div class="timeline-event-type">${event.type || 'Event'} | ${event.item}</div>
          <div class="timeline-event-description">${event.description}</div>
          ${event.significance ? `<div class="timeline-event-significance"><i class="ti ti-bulb"></i> ${event.significance}</div>` : ''}
        </div>
      `;
      
      // Node click handler
      const dot = node.querySelector('.timeline-event-dot');
      const card = node.querySelector('.timeline-event-card');
      
      [dot, card].forEach(el => {
        if (el) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectEvent(event.id);
          });
        }
      });
      
      ruler.appendChild(node);
    });
  }

  bindEvents() {
    const filterSelect = document.getElementById('ht-category-filter');
    const btnZoomIn = document.getElementById('ht-zoom-in');
    const btnZoomOut = document.getElementById('ht-zoom-out');
    
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'all') {
          this.filteredEvents = [...this.events];
        } else {
          this.filteredEvents = this.events.filter(event => event.type && event.type.toLowerCase() === category);
        }
        this.renderTimeline();
      });
    }

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        if (this.scale < 3) {
          this.scale += 0.5;
          this.renderTimeline();
          this.centerSelectedEvent();
        }
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (this.scale > 0.5) {
          this.scale -= 0.5;
          this.renderTimeline();
          this.centerSelectedEvent();
        }
      });
    }
  }

  async selectEvent(eventId) {
    if (this.selectedEventId === eventId) {
      this.selectedEventId = null; // deselect
    } else {
      this.selectedEventId = eventId;
    }
    
    // Update classes without full re-render for smooth transition
    const ruler = document.getElementById('ht-ruler');
    const nodes = ruler.querySelectorAll('.timeline-event-node');
    nodes.forEach(node => {
      if (node.dataset.id === this.selectedEventId) {
        node.classList.add('selected');
      } else {
        node.classList.remove('selected');
      }
    });
    
    const selectedEvent = this.events.find(e => e.id === this.selectedEventId);
    
    // Dispatch core map integration event
    const event = new CustomEvent('parampara:timeline:select', {
      detail: { 
        eventId: this.selectedEventId, 
        eventData: selectedEvent 
      }
    });
    window.dispatchEvent(event);
    
    this.centerSelectedEvent();

    // Advanced: Automatically find item coordinates and fly to it on map
    if (selectedEvent && window.map) {
      try {
        const res = await fetch(`/api/items?search=${encodeURIComponent(selectedEvent.item)}&limit=1`);
        const data = await res.json();
        const items = data.data || data;
        if (items.length > 0 && items[0].coordinates) {
          const coords = items[0].coordinates;
          window.map.flyTo({
            center: [coords[1], coords[0]],
            zoom: 12,
            pitch: 45,
            essential: true
          });
        }
      } catch (err) {
        console.warn('Timeline: Could not fetch map coordinates for flyover.', err);
      }
    }
  }

  centerSelectedEvent() {
    if (!this.selectedEventId) return;
    
    setTimeout(() => {
      const track = document.getElementById('ht-track-container');
      const node = track.querySelector(`.timeline-event-node[data-id="${this.selectedEventId}"]`);
      if (node && track) {
        const nodeLeft = parseInt(node.style.left);
        const scrollLeft = nodeLeft - (track.clientWidth / 2);
        if (typeof track.scrollTo === 'function') {
          track.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        } else {
          track.scrollLeft = Math.max(0, scrollLeft);
        }
      }
    }, 50);
  }
}

window.HistoricalTimelineComponent = HistoricalTimelineComponent;
