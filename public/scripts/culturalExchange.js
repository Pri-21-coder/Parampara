// public/scripts/culturalExchange.js

class CulturalExchangeUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/exchange';
    this.userId = this.getUserId();
    this.container = options.container || '#exchange-container';
    this.currentView = 'communities';
    
    this.init();
  }

  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  init() {
    this.renderInterface();
    this.loadCommunities();
    this.loadEvents();
    this.loadWorkshops();
    this.loadStats();
    this.setupEventListeners();
    console.log('✅ Cultural Exchange UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="exchange-interface">
        <div class="exchange-header">
          <h2>🌍 Cultural Exchange Platform</h2>
          <div class="exchange-actions">
            <button id="btn-communities" class="btn btn-primary">🏛️ Communities</button>
            <button id="btn-events" class="btn btn-info">📅 Events</button>
            <button id="btn-workshops" class="btn btn-secondary">📚 Workshops</button>
            <button id="btn-ambassadors" class="btn btn-success">🌟 Ambassadors</button>
            <button id="btn-match" class="btn btn-warning">🤝 Match</button>
          </div>
        </div>

        <!-- Stats -->
        <div id="exchange-stats" class="exchange-stats">
          <div class="loading">Loading stats...</div>
        </div>

        <!-- Communities View -->
        <div id="communities-view" class="exchange-view">
          <h3>🏛️ Communities</h3>
          <div id="communities-grid" class="communities-grid">
            <div class="loading">Loading communities...</div>
          </div>
        </div>

        <!-- Events View -->
        <div id="events-view" class="exchange-view" style="display: none;">
          <h3>📅 Cultural Events</h3>
          <div id="events-grid" class="events-grid">
            <div class="loading">Loading events...</div>
          </div>
        </div>

        <!-- Workshops View -->
        <div id="workshops-view" class="exchange-view" style="display: none;">
          <h3>📚 Workshops</h3>
          <div id="workshops-grid" class="workshops-grid">
            <div class="loading">Loading workshops...</div>
          </div>
        </div>

        <!-- Ambassadors View -->
        <div id="ambassadors-view" class="exchange-view" style="display: none;">
          <h3>🌟 Cultural Ambassadors</h3>
          <div id="ambassadors-grid" class="ambassadors-grid">
            <div class="loading">Loading ambassadors...</div>
          </div>
        </div>
      </div>
    `;
  }

  async loadCommunities() {
    try {
      const response = await fetch(`${this.apiBase}/communities`);
      const data = await response.json();

      if (data.success) {
        this.renderCommunities(data.communities);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  }

  renderCommunities(communities) {
    const container = document.getElementById('communities-grid');
    if (!container) return;

    if (!communities || communities.length === 0) {
      container.innerHTML = '<p>No communities found</p>';
      return;
    }

    container.innerHTML = `
      <div class="communities-grid-layout">
        ${communities.map(community => `
          <div class="community-card" style="
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s;
            cursor: pointer;
          " onclick="window.exchangeUI.viewCommunity('${community.id}')">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <h4 style="margin: 0;">${community.name}</h4>
              <span style="
                background: ${community.active ? '#4CAF50' : '#f44336'};
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
              ">${community.active ? 'Active' : 'Inactive'}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">${community.region} • ${community.culture}</p>
            <p style="font-size: 13px; color: #555;">${community.description}</p>
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin: 10px 0;">
              ${community.traditions.slice(0, 3).map(t =>
                `<span style="background: #e3f2fd; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${t}</span>`
              ).join('')}
              ${community.traditions.length > 3 ? `<span style="color: #999; font-size: 11px;">+${community.traditions.length - 3} more</span>` : ''}
            </div>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #888;">
              <span>👥 ${community.members} members</span>
              <span>📅 Est. ${community.established}</span>
              <span>⭐ ${community.rating}</span>
              <span>🎪 ${community.eventsHosted} events</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Add hover effect
    container.querySelectorAll('.community-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      });
    });
  }

  async loadEvents() {
    try {
      const response = await fetch(`${this.apiBase}/events?upcoming=true`);
      const data = await response.json();

      if (data.success) {
        this.renderEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  renderEvents(events) {
    const container = document.getElementById('events-grid');
    if (!container) return;

    if (!events || events.length === 0) {
      container.innerHTML = '<p>No upcoming events</p>';
      return;
    }

    container.innerHTML = `
      <div class="events-grid-layout">
        ${events.map(event => `
          <div class="event-card" style="
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s;
          ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <h4 style="margin: 0;">${event.title}</h4>
              <span style="
                background: ${event.status === 'upcoming' ? '#4CAF50' : '#FF9800'};
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
              ">${event.status}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">${event.type} • ${event.venue}</p>
            <p style="font-size: 13px; color: #555;">${event.description}</p>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #888; margin: 10px 0;">
              <span>📅 ${new Date(event.date).toLocaleDateString()}</span>
              <span>⏱️ ${event.duration} days</span>
              <span>👥 ${event.registered}/${event.capacity}</span>
              <span>💰 ₹${event.registrationFee}</span>
            </div>
            ${event.virtual ? '<span style="background: #e8f5e9; padding: 2px 10px; border-radius: 12px; font-size: 11px;">🌐 Virtual</span>' : ''}
            <div style="margin-top: 10px;">
              <button onclick="window.exchangeUI.registerForEvent('${event.id}')" style="
                padding: 8px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
              ">Register</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async loadWorkshops() {
    try {
      const response = await fetch(`${this.apiBase}/workshops`);
      const data = await response.json();

      if (data.success) {
        this.renderWorkshops(data.workshops);
      }
    } catch (error) {
      console.error('Error loading workshops:', error);
    }
  }

  renderWorkshops(workshops) {
    const container = document.getElementById('workshops-grid');
    if (!container) return;

    if (!workshops || workshops.length === 0) {
      container.innerHTML = '<p>No workshops available</p>';
      return;
    }

    container.innerHTML = `
      <div class="workshops-grid-layout">
        ${workshops.map(workshop => `
          <div class="workshop-card" style="
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s;
          ">
            <h4 style="margin: 0;">${workshop.title}</h4>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">${workshop.level} • ${workshop.instructor}</p>
            <p style="font-size: 13px; color: #555;">${workshop.description}</p>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #888; margin: 10px 0;">
              <span>⏱️ ${workshop.duration} hours</span>
              <span>📚 ${workshop.sessions} sessions</span>
              <span>👥 ${workshop.currentParticipants}/${workshop.maxParticipants}</span>
              <span>💰 ₹${workshop.fee}</span>
            </div>
            <span style="background: #e8f5e9; padding: 2px 10px; border-radius: 12px; font-size: 11px;">⭐ ${workshop.rating}</span>
            <div style="margin-top: 10px;">
              <button onclick="window.exchangeUI.registerForWorkshop('${workshop.id}')" style="
                padding: 8px 20px;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
              ">Register</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async loadAmbassadors() {
    try {
      const response = await fetch(`${this.apiBase}/ambassadors`);
      const data = await response.json();

      if (data.success) {
        this.renderAmbassadors(data.ambassadors);
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
    }
  }

  renderAmbassadors(ambassadors) {
    const container = document.getElementById('ambassadors-grid');
    if (!container) return;

    if (!ambassadors || ambassadors.length === 0) {
      container.innerHTML = '<p>No ambassadors found</p>';
      return;
    }

    container.innerHTML = `
      <div class="ambassadors-grid-layout">
        ${ambassadors.map(ambassador => `
          <div class="ambassador-card" style="
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
          ">
            <img src="${ambassador.image || 'https://via.placeholder.com/80'}" 
                 alt="${ambassador.name}" 
                 style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;" />
            <h4 style="margin: 0;">${ambassador.name}</h4>
            <p style="color: #666; font-size: 14px;">${ambassador.region}</p>
            <p style="font-size: 12px; color: #888;">${ambassador.experience} years experience</p>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin: 10px 0;">
              ${ambassador.expertise.slice(0, 3).map(e =>
                `<span style="background: #e3f2fd; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${e}</span>`
              ).join('')}
            </div>
            <div style="display: flex; justify-content: center; gap: 15px; font-size: 12px; color: #888;">
              <span>⭐ ${ambassador.rating}</span>
              <span>🎪 ${ambassador.eventsHosted} events</span>
            </div>
            <div style="margin-top: 10px;">
              <span style="
                background: ${ambassador.available ? '#4CAF50' : '#f44336'};
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
              ">${ambassador.available ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async loadStats() {
    try {
      const response = await fetch(`${this.apiBase}/stats`);
      const data = await response.json();

      if (data.success) {
        this.renderStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  renderStats(stats) {
    const container = document.getElementById('exchange-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalCommunities || 0}</div>
          <div class="stat-label">Communities</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalEvents || 0}</div>
          <div class="stat-label">Events</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalWorkshops || 0}</div>
          <div class="stat-label">Workshops</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalAmbassadors || 0}</div>
          <div class="stat-label">Ambassadors</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalExchanges || 0}</div>
          <div class="stat-label">Exchanges</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalCollaborations || 0}</div>
          <div class="stat-label">Collaborations</div>
        </div>
      </div>
    `;
  }

  async viewCommunity(communityId) {
    try {
      const response = await fetch(`${this.apiBase}/community/${communityId}`);
      const data = await response.json();

      if (data.success) {
        this.showCommunityModal(data.community);
      }
    } catch (error) {
      console.error('Error viewing community:', error);
    }
  }

  showCommunityModal(community) {
    const modal = document.createElement('div');
    modal.className = 'community-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    `;
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3 style="margin-top: 0;">${community.name}</h3>
        <p><strong>Region:</strong> ${community.region}</p>
        <p><strong>Culture:</strong> ${community.culture}</p>
        <p><strong>Description:</strong> ${community.description}</p>
        <p><strong>Traditions:</strong> ${community.traditions.join(', ')}</p>
        <p><strong>Members:</strong> ${community.members}</p>
        <p><strong>Established:</strong> ${community.established}</p>
        <p><strong>Events Hosted:</strong> ${community.eventsHosted}</p>
        <p><strong>Rating:</strong> ⭐ ${community.rating}</p>
        <button onclick="window.exchangeUI.matchCommunities('${community.id}')" style="
          margin: 10px 5px;
          padding: 8px 20px;
          background: #FF9800;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">🤝 Find Matches</button>
        <button onclick="this.closest('.community-modal').remove()" style="
          margin: 10px 5px;
          padding: 8px 20px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async matchCommunities(communityId) {
    try {
      this.showToast('🔍 Finding matches...', 'info');

      const response = await fetch(`${this.apiBase}/match/${communityId}`);
      const data = await response.json();

      if (data.success) {
        this.showMatchesModal(data.matches);
      }
    } catch (error) {
      console.error('Error matching communities:', error);
      this.showToast('❌ Error finding matches', 'error');
    }
  }

  showMatchesModal(matches) {
    const modal = document.createElement('div');
    modal.className = 'matches-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    `;
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3 style="margin-top: 0;">🤝 Community Matches</h3>
        ${matches.map(match => `
          <div style="
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
          ">
            <h4 style="margin: 0;">${match.community.name}</h4>
            <p style="margin: 5px 0; color: #666;">${match.community.region} • ${match.community.culture}</p>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: #4CAF50; width: ${match.score}%;"></div>
              </div>
              <span style="font-weight: bold;">${match.score}%</span>
            </div>
            <button onclick="window.exchangeUI.scheduleExchange('${match.community.id}')" style="
              margin-top: 10px;
              padding: 5px 15px;
              background: #2196F3;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            ">Schedule Exchange</button>
          </div>
        `).join('')}
        <button onclick="this.closest('.matches-modal').remove()" style="
          margin-top: 10px;
          padding: 8px 20px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async scheduleExchange(communityId) {
    this.showToast('📅 Exchange scheduled!', 'success');
  }

  async registerForEvent(eventId) {
    try {
      const response = await fetch(`${this.apiBase}/event/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId: this.userId })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Registered for event!', 'success');
        this.loadEvents();
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      this.showToast('❌ Error registering for event', 'error');
    }
  }

  async registerForWorkshop(workshopId) {
    try {
      const response = await fetch(`${this.apiBase}/workshop/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId, userId: this.userId })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Registered for workshop!', 'success');
        this.loadWorkshops();
      }
    } catch (error) {
      console.error('Error registering for workshop:', error);
      this.showToast('❌ Error registering for workshop', 'error');
    }
  }

  setupEventListeners() {
    // Communities view
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-communities' || e.target.closest('#btn-communities')) {
        this.switchView('communities');
      }
    });

    // Events view
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-events' || e.target.closest('#btn-events')) {
        this.switchView('events');
        this.loadEvents();
      }
    });

    // Workshops view
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-workshops' || e.target.closest('#btn-workshops')) {
        this.switchView('workshops');
        this.loadWorkshops();
      }
    });

    // Ambassadors view
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-ambassadors' || e.target.closest('#btn-ambassadors')) {
        this.switchView('ambassadors');
        this.loadAmbassadors();
      }
    });

    // Match
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-match' || e.target.closest('#btn-match')) {
        this.showMatchDialog();
      }
    });
  }

  switchView(view) {
    // Hide all views
    document.getElementById('communities-view').style.display = 'none';
    document.getElementById('events-view').style.display = 'none';
    document.getElementById('workshops-view').style.display = 'none';
    document.getElementById('ambassadors-view').style.display = 'none';

    // Show selected view
    document.getElementById(`${view}-view`).style.display = 'block';
    this.currentView = view;
  }

  showMatchDialog() {
    const communityId = prompt('Enter community ID to find matches:');
    if (communityId) {
      this.matchCommunities(communityId);
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 8px;
      z-index: 99999;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const exchangeUI = new CulturalExchangeUI({
    container: '#exchange-container'
  });
  window.exchangeUI = exchangeUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .exchange-interface { max-width: 1400px; margin: 0 auto; padding: 20px; }
  .exchange-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .exchange-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .exchange-view { margin-top: 20px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .communities-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
  .events-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
  .workshops-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .ambassadors-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
  .community-card:hover { transform: translateY(-5px); box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important; }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.3s; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-primary:hover { background: #388E3C; }
  .btn-secondary { background: #FF9800; color: white; }
  .btn-secondary:hover { background: #F57C00; }
  .btn-info { background: #2196F3; color: white; }
  .btn-info:hover { background: #1976D2; }
  .btn-success { background: #4CAF50; color: white; }
  .btn-success:hover { background: #388E3C; }
  .btn-warning { background: #FFC107; color: #333; }
  .btn-warning:hover { background: #FFB300; }
  .loading { text-align: center; padding: 40px; color: #666; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @media (max-width: 768px) {
    .exchange-header { flex-direction: column; align-items: stretch; }
    .exchange-actions { justify-content: stretch; }
    .exchange-actions .btn { flex: 1; }
    .communities-grid-layout { grid-template-columns: 1fr; }
    .events-grid-layout { grid-template-columns: 1fr; }
    .workshops-grid-layout { grid-template-columns: 1fr; }
    .ambassadors-grid-layout { grid-template-columns: 1fr; }
  }
`;
document.head.appendChild(style);