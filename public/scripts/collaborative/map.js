class CollaborativeMap {
  constructor(options = {}) {
    this.wsUrl = options.wsUrl || `ws://${window.location.hostname}:8080`;
    this.mapInstance = options.mapInstance;
    this.userId = null;
    this.username = this.generateUsername();
    this.markers = new Map();
    this.clients = new Map();
    this.isCollaborativeMode = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.ws = null;
    this.cursorElements = new Map();
    
    this.setupUI();
    this.setupWebSocket();
    this.setupEventListeners();
  }

  generateUsername() {
    const adjectives = ['Wandering', 'Curious', 'Heritage', 'Cultural', 'Travelling'];
    const nouns = ['Explorer', 'Storyteller', 'Guardian', 'Soul', 'Wanderer'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
  }

  setupUI() {
    // Add collaborative mode toggle
    const controls = document.querySelector('.map-controls');
    if (controls) {
      const toggleHtml = `
        <div class="collaborative-controls">
          <button id="collaborative-toggle" class="btn btn-collaborative">
            <i class="fas fa-users"></i> 
            <span>Collaborative Mode</span>
          </button>
          <div class="active-users" id="active-users">
            <span class="user-count">0</span> online
          </div>
          <div class="user-list" id="user-list" style="display: none;">
            <h4>Online Users</h4>
            <ul></ul>
          </div>
        </div>
      `;
      controls.insertAdjacentHTML('beforeend', toggleHtml);
    }

    // Add loading overlay
    const loadingHtml = `
      <div id="collaborative-loading" style="display: none;">
        <div class="loading-spinner"></div>
        <p>Syncing with collaborators...</p>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
  }

  setupWebSocket() {
    try {
      this.ws = new ResilientWebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.showToast('Connected to collaborative session', 'success');
        
        // Send join message
        this.sendMessage({
          type: 'room:join',
          roomId: 'map-session'
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.showToast('Connection error. Retrying...', 'error');
      };

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'init':
        this.handleInitialization(data);
        break;
      case 'user:joined':
        this.handleUserJoined(data);
        break;
      case 'user:left':
        this.handleUserLeft(data);
        break;
      case 'marker:added':
        this.handleMarkerAdded(data);
        break;
      case 'marker:updated':
        this.handleMarkerUpdated(data);
        break;
      case 'marker:deleted':
        this.handleMarkerDeleted(data);
        break;
      case 'marker:moved':
        this.handleMarkerMoved(data);
        break;
      case 'cursor:updated':
        this.handleCursorUpdated(data);
        break;
      case 'room:joined':
        this.handleRoomJoined(data);
        break;
      case 'history:response':
        this.handleHistoryResponse(data);
        break;
      case 'conflict:resolution':
        this.handleConflictResolution(data);
        break;
      case 'error':
        this.handleError(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  handleInitialization(data) {
    this.userId = data.userId;
    
    // Load initial markers
    if (data.markers) {
      data.markers.forEach(marker => {
        this.addMarkerToMap(marker);
      });
    }

    // Load initial clients
    if (data.clients) {
      data.clients.forEach(client => {
        this.addUserCursor(client);
      });
    }

    // Load history
    if (data.history) {
      console.log(`Loaded ${data.history.length} historical operations`);
    }

    this.showToast('Collaborative session initialized', 'info');
    this.updateUserList();
  }

  handleUserJoined(data) {
    this.addUserCursor({
      userId: data.userId,
      username: data.username,
      cursor: { lat: 0, lng: 0 }
    });
    this.updateUserList();
    this.showToast(`${data.username} joined the session`, 'info');
  }

  handleUserLeft(data) {
    this.removeUserCursor(data.userId);
    this.updateUserList();
    const user = this.clients.get(data.userId);
    if (user) {
      this.showToast(`${user.username} left the session`, 'info');
    }
  }

  handleMarkerAdded(data) {
    this.addMarkerToMap(data.marker);
    this.showToast(`New marker added by ${data.userId.slice(0, 6)}`, 'success');
  }

  handleMarkerUpdated(data) {
    this.updateMarkerOnMap(data.markerId, data.updates);
  }

  handleMarkerDeleted(data) {
    this.removeMarkerFromMap(data.markerId);
    this.showToast(`Marker removed`, 'info');
  }

  handleMarkerMoved(data) {
    this.moveMarkerOnMap(data.markerId, data.lat, data.lng);
  }

  handleCursorUpdated(data) {
    this.updateUserCursor(data.userId, data.cursor, data.username);
  }

  handleRoomJoined(data) {
    console.log(`Joined room: ${data.roomId}`);
    data.markers.forEach(marker => {
      this.addMarkerToMap(marker);
    });
  }

  handleHistoryResponse(data) {
    console.log(`Received ${data.count} history entries`);
  }

  handleConflictResolution(data) {
    this.showToast('Conflict detected! Please review changes.', 'warning');
    // Open conflict resolution modal
    this.openConflictModal(data.marker);
  }

  handleError(data) {
    this.showToast(`Error: ${data.message}`, 'error');
  }

  handleDisconnection() {
    this.showToast('Disconnected from collaborative session', 'error');
    this.toggleCollaborativeMode(false);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.setupWebSocket();
      }, 2000 * this.reconnectAttempts);
    }
  }

  addMarkerToMap(marker) {
    if (!this.mapInstance) return;

    // Create marker on map
    const el = document.createElement('div');
    el.className = 'collaborative-marker';
    el.style.backgroundColor = this.getColorForUser(marker.createdBy);
    el.innerHTML = `<i class="fas fa-map-marker-alt"></i>`;
    el.title = `${marker.name || 'Village'} - Added by ${marker.createdBy.slice(0, 6)}`;

    const markerObj = new mapboxgl.Marker(el)
      .setLngLat([marker.coordinates.lng, marker.coordinates.lng])
      .addTo(this.mapInstance);

    this.markers.set(marker.id, {
      ...marker,
      markerObj,
      element: el
    });
  }

  updateMarkerOnMap(markerId, updates) {
    const marker = this.markers.get(markerId);
    if (marker) {
      Object.assign(marker, updates);
      // Update marker element
      if (updates.name) {
        marker.element.title = `${updates.name} - Updated`;
      }
    }
  }

  removeMarkerFromMap(markerId) {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.markerObj.remove();
      this.markers.delete(markerId);
    }
  }

  moveMarkerOnMap(markerId, lat, lng) {
    const marker = this.markers.get(markerId);
    if (marker) {
      marker.markerObj.setLngLat([lng, lat]);
      marker.coordinates = { lat, lng };
    }
  }

  addUserCursor(userData) {
    const el = document.createElement('div');
    el.className = 'collaborative-cursor';
    el.style.backgroundColor = this.getColorForUser(userData.userId);
    el.innerHTML = `
      <div class="cursor-dot"></div>
      <div class="cursor-label">${userData.username || 'User'}</div>
    `;
    el.style.display = 'none';
    document.body.appendChild(el);

    this.clients.set(userData.userId, {
      ...userData,
      element: el
    });

    this.cursorElements.set(userData.userId, el);
  }

  updateUserCursor(userId, cursor, username) {
    const client = this.clients.get(userId);
    if (client && cursor) {
      client.cursor = cursor;
      // Position cursor on map
      if (this.mapInstance) {
        const point = this.mapInstance.project([cursor.lng, cursor.lat]);
        const el = client.element;
        el.style.display = 'block';
        el.style.left = `${point.x}px`;
        el.style.top = `${point.y}px`;
      }
    }
  }

  removeUserCursor(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.element.remove();
      this.clients.delete(userId);
      this.cursorElements.delete(userId);
    }
  }

  updateUserList() {
    const userListEl = document.getElementById('user-list');
    const userCountEl = document.querySelector('.user-count');
    
    if (userCountEl) {
      userCountEl.textContent = this.clients.size;
    }

    if (userListEl) {
      const ul = userListEl.querySelector('ul');
      if (ul) {
        ul.innerHTML = '';
        this.clients.forEach((client, userId) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span class="user-dot" style="background: ${this.getColorForUser(userId)}"></span>
            ${client.username || 'Anonymous'}
            ${userId === this.userId ? ' (You)' : ''}
          `;
          ul.appendChild(li);
        });
      }
    }
  }

  getColorForUser(userId) {
    // Generate consistent color from userId
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#FF9FF3', '#54A0FF'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  openConflictModal(marker) {
    const modal = document.createElement('div');
    modal.className = 'conflict-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>⚠️ Conflict Detected</h3>
        <p>Another user has modified this marker:</p>
        <div class="conflict-details">
          <pre>${JSON.stringify(marker, null, 2)}</pre>
        </div>
        <div class="conflict-actions">
          <button class="btn btn-primary" onclick="this.resolveConflict()">Accept Changes</button>
          <button class="btn btn-secondary" onclick="this.keepChanges()">Keep Your Changes</button>
          <button class="btn btn-danger" onclick="this.discardChanges()">Discard</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  toggleCollaborativeMode(enabled) {
    this.isCollaborativeMode = enabled;
    const toggleBtn = document.getElementById('collaborative-toggle');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', enabled);
      toggleBtn.querySelector('span').textContent = 
        enabled ? 'Collaborative Mode: ON' : 'Collaborative Mode';
    }
  }

  setupEventListeners() {
    // Collaborative mode toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('#collaborative-toggle')) {
        this.toggleCollaborativeMode(!this.isCollaborativeMode);
        if (this.isCollaborativeMode) {
          this.showToast('Collaborative mode activated', 'success');
        } else {
          this.showToast('Collaborative mode deactivated', 'info');
        }
      }
    });

    // Mouse move for cursor sharing
    document.addEventListener('mousemove', (e) => {
      if (this.isCollaborativeMode && this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Convert screen position to map coordinates
        if (this.mapInstance) {
          const point = this.mapInstance.unproject([e.clientX, e.clientY]);
          this.sendMessage({
            type: 'cursor:update',
            data: {
              lat: point.lat,
              lng: point.lng,
              x: e.clientX,
              y: e.clientY
            }
          });
        }
      }
    });
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize when map is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for map to be initialized
  const checkMap = setInterval(() => {
    if (window.mapInstance) {
      clearInterval(checkMap);
      const collabMap = new CollaborativeMap({
        mapInstance: window.mapInstance,
        wsUrl: `ws://${window.location.hostname}:8080`
      });
      window.collaborativeMap = collabMap;
    }
  }, 1000);
});