// public/scripts/virtualTour.js

class VirtualTourUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/tours';
    this.userId = this.getUserId();
    this.container = options.container || '#virtual-tour-container';
    this.currentTour = null;
    this.currentSession = null;
    this.currentStream = null;
    this.isInTour = false;
    this.isGuide = false;
    this.map = null;
    this.ws = null;
    this.chatMessages = [];
    
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
    this.loadTours();
    this.loadGuides();
    this.loadStats();
    this.setupEventListeners();
    this.setupWebSocket();
    console.log('✅ Virtual Tour UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <style>
        .tour-interface {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .tour-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          color: white;
        }
        .tour-header h2 { margin: 0; display: flex; align-items: center; gap: 10px; }
        .tour-actions { display: flex; gap: 10px; align-items: center; }
        .tours-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
        }
        .tour-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .tour-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .btn {
          padding: 8px 15px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }
        .btn-primary { background: #4CAF50; color: white; }
        .btn-primary:hover { background: #45a049; }
        .btn-info { background: #2196F3; color: white; }
        .btn-info:hover { background: #1e88e5; }
        .btn-secondary { background: #ff9800; color: white; }
        .btn-secondary:hover { background: #f57c00; }
        .btn-danger { background: #f44336; color: white; }
        .btn-danger:hover { background: #e53935; }
      </style>
      <div class="tour-interface">
        <div class="tour-header">
          <h2>🌍 Virtual Heritage Tours</h2>
          <div class="tour-actions">
            <input type="text" id="join-session-id" placeholder="Tour Session ID" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd; width: 150px;">
            <button id="btn-join-tour" class="btn btn-primary">🤝 Join</button>
            <button id="btn-bookings" class="btn btn-info">📅 My Bookings</button>
            <button id="btn-guides" class="btn btn-secondary">👥 Guides</button>
            <button id="btn-analytics" class="btn btn-primary">📊 Analytics</button>
          </div>
        </div>

        <!-- Tours Grid -->
        <div class="tours-grid" id="tours-grid">
          <div class="loading">Loading tours...</div>
        </div>

        <!-- Tour View -->
        <div id="tour-view" class="tour-view" style="display: none;">
          <div class="tour-player">
            <div class="player-placeholder">
              <p>🎥 Virtual Tour Player</p>
              <div style="font-size: 14px; color: #666;">Join a tour to start exploring</div>
            </div>
          </div>
          <div class="tour-controls">
            <button id="btn-chat" class="btn btn-info">💬 Chat</button>
            <button id="btn-record" class="btn btn-secondary">🔴 Record</button>
            <button id="btn-leave" class="btn btn-danger">🚪 Leave Tour</button>
          </div>
          <div id="chat-container" class="chat-container" style="display: none;">
            <div id="chat-messages" class="chat-messages"></div>
            <div class="chat-input">
              <input type="text" id="chat-input" placeholder="Type a message..." />
              <button id="btn-send-chat" class="btn btn-primary">Send</button>
            </div>
          </div>
        </div>

        <!-- Bookings Modal -->
        <div class="modal" id="bookings-modal" style="display: none;">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>📅 My Bookings</h3>
            <div id="bookings-list">
              <p>No bookings yet</p>
            </div>
          </div>
        </div>

        <!-- Guides Modal -->
        <div class="modal" id="guides-modal" style="display: none;">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>👥 Our Tour Guides</h3>
            <div id="guides-list">
              <p>Loading guides...</p>
            </div>
          </div>
        </div>

        <!-- Analytics Modal -->
        <div class="modal" id="analytics-modal" style="display: none;">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>📊 Tour Analytics</h3>
            <div id="analytics-content">
              <p>Loading analytics...</p>
            </div>
          </div>
        </div>

        <!-- Booking Modal -->
        <div class="modal" id="booking-modal" style="display: none;">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>📅 Book Tour</h3>
            <form id="booking-form">
              <div class="form-group">
                <label>Date</label>
                <input type="date" id="booking-date" required />
              </div>
              <div class="form-group">
                <label>Time</label>
                <input type="time" id="booking-time" required />
              </div>
              <div class="form-group">
                <label>Number of Participants</label>
                <input type="number" id="booking-participants" value="1" min="1" max="10" />
              </div>
              <div class="form-group">
                <label>Special Requests</label>
                <textarea id="booking-requests" rows="2"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Confirm Booking</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  async loadTours() {
    try {
      const response = await fetch(`${this.apiBase}`);
      const data = await response.json();

      if (data.success) {
        this.renderTours(data.tours);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
    }
  }

  renderTours(tours) {
    const container = document.getElementById('tours-grid');
    if (!container) return;

    if (!tours || tours.length === 0) {
      container.innerHTML = '<p>No tours available</p>';
      return;
    }

    container.innerHTML = `
      <div class="tours-grid-layout">
        ${tours.map(tour => `
          <div class="tour-card" style="
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s;
          ">
            <img src="${tour.images?.[0] || 'https://via.placeholder.com/400x200'}" 
                 alt="${tour.name}" 
                 style="width: 100%; height: 200px; object-fit: cover;" />
            <div style="padding: 15px;">
              <h4 style="margin: 0 0 5px 0;">${tour.name}</h4>
              <p style="color: #666; font-size: 14px;">${tour.description}</p>
              <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0;">
                <span style="background: #e3f2fd; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${tour.category}</span>
                <span style="background: #f5f5f5; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${tour.location}</span>
                <span style="background: #fce4ec; padding: 2px 10px; border-radius: 12px; font-size: 11px;">⏱️ ${tour.duration}min</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-size: 20px; font-weight: bold;">₹${tour.price}</span>
                  <span style="color: #999; font-size: 12px;">/person</span>
                </div>
                <div>
                  <span>⭐ ${tour.rating || 0}</span>
                  <span style="color: #999; font-size: 12px;">(${tour.totalReviews || 0})</span>
                </div>
              </div>
              <div style="margin-top: 10px; display: flex; gap: 8px;">
                <button onclick="window.tourUI.startTour('${tour.id}')" style="
                  flex: 1;
                  padding: 8px;
                  background: #4CAF50;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                ">▶️ Start Tour</button>
                <button onclick="window.tourUI.bookTour('${tour.id}')" style="
                  padding: 8px 15px;
                  background: #2196F3;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                ">📅 Book</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async startTour(tourId) {
    try {
      this.showToast('🎥 Starting tour...', 'info');

      // Setup tour session locally for WebSocket
      const sessionId = `tour-${Math.random().toString(36).substr(2, 9)}`;
      this.currentTour = { id: tourId, name: 'Heritage Tour' };
      this.currentSession = sessionId;
      this.isInTour = true;
      this.isGuide = true;

      this.showTourView({ sessionId });
      
      // Notify WS server
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'tour:create',
          roomId: sessionId
        }));
      }

      this.showToast(`✅ Tour started! Session ID: ${sessionId}`, 'success');
      this.startChatPolling();
    } catch (error) {
      console.error('Error starting tour:', error);
      this.showToast('❌ Error starting tour', 'error');
    }
  }

  joinTour(sessionId) {
    if (!sessionId) {
      this.showToast('Please enter a Session ID', 'warning');
      return;
    }
    
    this.currentSession = sessionId;
    this.isInTour = true;
    this.isGuide = false;

    this.showTourView({ sessionId });

    // Notify WS server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'tour:join',
        roomId: sessionId,
        username: `Participant-${this.userId.slice(0, 4)}`
      }));
    }
    
    this.showToast('Joined tour session successfully!', 'success');
  }

  showTourView(data) {
    document.getElementById('tours-grid').style.display = 'none';
    document.getElementById('tour-view').style.display = 'block';

    const player = document.querySelector('.player-placeholder');
    if (player) {
      player.innerHTML = `
        <div style="position: relative; width: 100%; height: 500px; border-radius: 10px; overflow: hidden;">
          <div id="tour-map" style="width: 100%; height: 100%;"></div>
          <div id="tour-participants-overlay" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 8px; z-index: 1000; font-size: 12px; max-height: 200px; overflow-y: auto;">
            <strong>👥 Session: ${data.sessionId}</strong><br/>
            ${this.isGuide ? '<span style="color: #4CAF50;">👑 You are the Guide</span>' : '<span style="color: #2196F3;">👁️ Viewing as Participant</span>'}
          </div>
        </div>
      `;
      this.initMap();
    }
  }

  initMap() {
    if (this.map) {
      this.map.remove();
    }

    this.map = new maplibregl.Map({
      container: 'tour-map',
      style: '/api/map-style', // Fetches dynamic style JSON
      center: [78.9629, 20.5937],
      zoom: 4,
      interactive: this.isGuide // Only guide can interact freely
    });

    this.map.on('load', () => {
      console.log('Map loaded for Virtual Tour');
    });

    if (this.isGuide) {
      this.map.on('moveend', () => {
        if (!this.isInTour || !this.ws) return;
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        
        this.ws.send(JSON.stringify({
          type: 'tour:sync_map',
          roomId: this.currentSession,
          state: { center: [center.lng, center.lat], zoom }
        }));
      });
    }
  }

  setupWebSocket() {
    const wsUrl = `ws://${window.location.hostname}:8080`;
    if (window.ResilientWebSocket) {
      this.ws = new ResilientWebSocket(wsUrl);
    } else {
      this.ws = new WebSocket(wsUrl);
    }

    this.ws.onopen = () => console.log('WebSocket connected for Virtual Tours');
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'tour:state_sync' || data.type === 'tour:sync_map') {
          if (!this.isGuide && this.map) {
            this.map.flyTo({
              center: data.state.center,
              zoom: data.state.zoom,
              speed: 1.2,
              essential: true
            });
          }
        } else if (data.type === 'tour:participant_joined') {
          this.showToast(`👋 ${data.username} joined the tour`, 'info');
        } else if (data.type === 'tour:participant_left') {
          this.showToast(`🚶 ${data.username} left the tour`, 'info');
        } else if (data.type === 'tour:guide_left') {
          this.showToast(`⚠️ The Tour Guide has left the session. Ending tour.`, 'warning');
          this.leaveTour();
        }
      } catch (err) {
        console.error('Error handling WebSocket message', err);
      }
    };
  }

  async bookTour(tourId) {
    this.currentTour = this.currentTour || { id: tourId };
    document.getElementById('booking-modal').style.display = 'flex';
  }

  async submitBooking(event) {
    event.preventDefault();

    const bookingData = {
      date: document.getElementById('booking-date').value,
      time: document.getElementById('booking-time').value,
      participants: parseInt(document.getElementById('booking-participants').value),
      specialRequests: document.getElementById('booking-requests').value
    };

    try {
      const response = await fetch(`${this.apiBase}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: this.currentTour.id,
          userId: this.userId,
          bookingData
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Tour booked successfully!', 'success');
        document.getElementById('booking-modal').style.display = 'none';
        document.getElementById('booking-form').reset();
        this.loadBookings();
      }
    } catch (error) {
      console.error('Error booking tour:', error);
      this.showToast('❌ Error booking tour', 'error');
    }
  }

  async loadGuides() {
    try {
      const response = await fetch(`${this.apiBase}/guides`);
      const data = await response.json();

      if (data.success) {
        this.renderGuides(data.guides);
      }
    } catch (error) {
      console.error('Error loading guides:', error);
    }
  }

  renderGuides(guides) {
    const container = document.getElementById('guides-list');
    if (!container) return;

    container.innerHTML = guides.map(guide => `
      <div class="guide-card" style="
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 15px;
      ">
        <img src="${guide.image || 'https://via.placeholder.com/60'}" 
             alt="${guide.name}" 
             style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />
        <div style="flex: 1;">
          <h4 style="margin: 0;">${guide.name}</h4>
          <p style="margin: 2px 0; color: #666; font-size: 14px;">${guide.specialty}</p>
          <div style="display: flex; gap: 15px; font-size: 12px; color: #888;">
            <span>⭐ ${guide.rating}</span>
            <span>🎤 ${guide.totalTours} tours</span>
            <span>🌍 ${guide.languages.join(', ')}</span>
          </div>
        </div>
        <div>
          <span style="
            background: ${guide.available ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
          ">${guide.available ? 'Available' : 'Unavailable'}</span>
        </div>
      </div>
    `).join('');
  }

  async loadBookings() {
    try {
      const response = await fetch(`${this.apiBase}/bookings/${this.userId}`);
      const data = await response.json();

      if (data.success) {
        this.renderBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  }

  renderBookings(bookings) {
    const container = document.getElementById('bookings-list');
    if (!container) return;

    if (!bookings || bookings.length === 0) {
      container.innerHTML = '<p>No bookings yet</p>';
      return;
    }

    container.innerHTML = bookings.map(booking => `
      <div class="booking-card" style="
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <strong>Tour: ${booking.tourId}</strong>
          <div style="font-size: 12px; color: #888;">
            📅 ${booking.date} at ${booking.time}
            <span style="margin-left: 10px;">👥 ${booking.participants} participants</span>
          </div>
          <span style="
            background: ${booking.status === 'confirmed' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 11px;
          ">${booking.status}</span>
        </div>
        ${booking.status === 'confirmed' ? `
          <button onclick="window.tourUI.cancelBooking('${booking.id}')" style="
            padding: 5px 15px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          ">Cancel</button>
        ` : ''}
      </div>
    `).join('');
  }

  async cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`${this.apiBase}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Booking cancelled', 'success');
        this.loadBookings();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      this.showToast('❌ Error cancelling booking', 'error');
    }
  }

  async loadStats() {
    try {
      const response = await fetch(`${this.apiBase}/stats`);
      const data = await response.json();

      if (data.success) {
        console.log('📊 Tour Stats:', data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async loadAnalytics() {
    try {
      const response = await fetch(`${this.apiBase}/analytics`);
      const data = await response.json();

      if (data.success) {
        this.renderAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  renderAnalytics(analytics) {
    const container = document.getElementById('analytics-content');
    if (!container) return;

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-card">
          <div class="stat-value">${analytics.totalTours || 0}</div>
          <div class="stat-label">Total Tours</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${analytics.totalSessions || 0}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${analytics.totalParticipants || 0}</div>
          <div class="stat-label">Total Participants</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${analytics.totalBookings || 0}</div>
          <div class="stat-label">Total Bookings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${analytics.totalRecordings || 0}</div>
          <div class="stat-label">Recordings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${analytics.activeGuides || 0}/${analytics.totalGuides || 0}</div>
          <div class="stat-label">Active Guides</div>
        </div>
      </div>
      ${analytics.popularTours ? `
        <div style="margin-top: 20px;">
          <h4>🔥 Popular Tours</h4>
          ${analytics.popularTours.map(tour => `
            <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee;">
              <span>${tour.name}</span>
              <span>${tour.bookings} bookings</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  startChatPolling() {
    setInterval(async () => {
      if (!this.isInTour) return;
      // In production: use WebSocket
      // For now: fetch messages
    }, 3000);
  }

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();

    try {
      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSession,
          userId: this.userId,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        input.value = '';
        this.showToast('💬 Message sent!', 'info');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async leaveTour() {
    if (!this.isInTour) return;

    try {
      await fetch(`${this.apiBase}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSession,
          userId: this.userId
        })
      });

      this.isInTour = false;
      this.isGuide = false;
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      document.getElementById('tour-view').style.display = 'none';
      document.getElementById('tours-grid').style.display = 'block';
      this.showToast('👋 Left tour', 'info');
    } catch (error) {
      console.error('Error leaving tour:', error);
    }
  }

  setupEventListeners() {
    // Join Tour
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-join-tour') {
        const sessionId = document.getElementById('join-session-id').value.trim();
        this.joinTour(sessionId);
      }
    });

    // Bookings
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-bookings' || e.target.closest('#btn-bookings')) {
        document.getElementById('bookings-modal').style.display = 'flex';
        this.loadBookings();
      }
    });

    // Guides
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-guides' || e.target.closest('#btn-guides')) {
        document.getElementById('guides-modal').style.display = 'flex';
      }
    });

    // Analytics
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-analytics' || e.target.closest('#btn-analytics')) {
        document.getElementById('analytics-modal').style.display = 'flex';
        this.loadAnalytics();
      }
    });

    // Chat toggle
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-chat' || e.target.closest('#btn-chat')) {
        const container = document.getElementById('chat-container');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Send chat
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-send-chat' || e.target.closest('#btn-send-chat')) {
        this.sendChatMessage();
      }
    });

    document.addEventListener('keypress', (e) => {
      if (e.target.id === 'chat-input' && e.key === 'Enter') {
        this.sendChatMessage();
      }
    });

    // Leave tour
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-leave' || e.target.closest('#btn-leave')) {
        this.leaveTour();
      }
    });

    // Record
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-record' || e.target.closest('#btn-record')) {
        this.toggleRecording();
      }
    });

    // Modal close
    document.addEventListener('click', (e) => {
      if (e.target.closest('.modal-close') || 
          (e.target.closest('.modal') && !e.target.closest('.modal-content'))) {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
        }
      }
    });

    // Booking form
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'booking-form') {
        e.preventDefault();
        this.submitBooking(e);
      }
    });
  }

  async toggleRecording() {
    const btn = document.getElementById('btn-record');
    if (btn.textContent === '🔴 Record') {
      try {
        const response = await fetch(`${this.apiBase}/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: this.currentSession })
        });

        const data = await response.json();

        if (data.success) {
          btn.textContent = '⏹️ Stop Recording';
          btn.style.background = '#f44336';
          this.showToast('🔴 Recording started', 'info');
        }
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    } else {
      try {
        const recordingId = prompt('Enter recording ID:');
        if (!recordingId) return;

        const response = await fetch(`${this.apiBase}/recording/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordingId })
        });

        const data = await response.json();

        if (data.success) {
          btn.textContent = '🔴 Record';
          btn.style.background = '';
          this.showToast('✅ Recording saved!', 'success');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
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
  const tourUI = new VirtualTourUI({
    container: '#virtual-tour-container'
  });
  window.tourUI = tourUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .tour-interface { max-width: 1400px; margin: 0 auto; padding: 20px; }
  .tour-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .tour-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .tours-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
  .tour-card:hover { transform: translateY(-5px); box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important; }
  .tour-view { background: #1a1a2e; border-radius: 12px; padding: 20px; min-height: 400px; }
  .tour-player { min-height: 300px; display: flex; align-items: center; justify-content: center; }
  .player-placeholder { color: white; text-align: center; }
  .tour-controls { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
  .chat-container { margin-top: 15px; background: #2a2a3e; border-radius: 8px; padding: 15px; max-height: 300px; }
  .chat-messages { max-height: 200px; overflow-y: auto; color: white; }
  .chat-input { display: flex; gap: 10px; margin-top: 10px; }
  .chat-input input { flex: 1; padding: 8px; border: none; border-radius: 5px; }
  .analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.3s; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-primary:hover { background: #388E3C; }
  .btn-secondary { background: #FF9800; color: white; }
  .btn-secondary:hover { background: #F57C00; }
  .btn-info { background: #2196F3; color: white; }
  .btn-info:hover { background: #1976D2; }
  .btn-danger { background: #f44336; color: white; }
  .btn-danger:hover { background: #d32f2f; }
  .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: none; justify-content: center; align-items: center; z-index: 99999; }
  .modal-content { background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; }
  .modal-close { position: absolute; top: 15px; right: 20px; font-size: 28px; cursor: pointer; color: #999; }
  .form-group { margin-bottom: 15px; }
  .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
  .form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
  .loading { text-align: center; padding: 40px; color: #666; }
  .guide-card:hover { transform: translateX(5px); }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @media (max-width: 768px) {
    .tour-header { flex-direction: column; align-items: stretch; }
    .tour-actions { justify-content: stretch; }
    .tour-actions .btn { flex: 1; }
    .tours-grid-layout { grid-template-columns: 1fr; }
    .analytics-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;
document.head.appendChild(style);