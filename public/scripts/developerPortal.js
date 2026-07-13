// public/scripts/developerPortal.js

class DeveloperPortalUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/developer';
    this.container = options.container || '#developer-container';
    this.currentDeveloper = null;
    
    this.init();
  }

  init() {
    this.renderInterface();
    this.loadStats();
    this.loadDevelopers();
    this.loadDocs();
    this.setupEventListeners();
    console.log('✅ Developer Portal UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="developer-interface">
        <div class="developer-header">
          <h2>👨‍💻 Developer Portal</h2>
          <div class="developer-actions">
            <button id="btn-register" class="btn btn-primary">📝 Register</button>
            <button id="btn-docs" class="btn btn-info">📚 API Docs</button>
            <button id="btn-keys" class="btn btn-secondary">🔑 API Keys</button>
            <button id="btn-analytics" class="btn btn-success">📊 Analytics</button>
          </div>
        </div>

        <!-- Stats -->
        <div id="developer-stats" class="developer-stats">
          <div class="loading">Loading stats...</div>
        </div>

        <!-- Developers -->
        <div class="developers-section">
          <h4>👥 Registered Developers</h4>
          <div id="developers-list" class="developers-list">
            <div class="loading">Loading developers...</div>
          </div>
        </div>

        <!-- API Keys -->
        <div class="keys-section" id="keys-section" style="display: none;">
          <h4>🔑 API Keys</h4>
          <div id="keys-list" class="keys-list"></div>
          <button id="btn-generate-key" class="btn btn-primary">Generate New Key</button>
        </div>

        <!-- Documentation -->
        <div class="docs-section" id="docs-section" style="display: none;">
          <h4>📚 API Documentation</h4>
          <div id="docs-list" class="docs-list"></div>
        </div>

        <!-- Analytics -->
        <div class="analytics-section" id="analytics-section" style="display: none;">
          <h4>📊 API Analytics</h4>
          <div id="analytics-content" class="analytics-content"></div>
        </div>
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
    const container = document.getElementById('developer-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalDevelopers || 0}</div>
          <div class="stat-label">Total Developers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.activeDevelopers || 0}</div>
          <div class="stat-label">Active Developers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalAPIKeys || 0}</div>
          <div class="stat-label">Total API Keys</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.activeKeys || 0}</div>
          <div class="stat-label">Active Keys</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalWebhooks || 0}</div>
          <div class="stat-label">Webhooks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalAPICalls || 0}</div>
          <div class="stat-label">API Calls</div>
        </div>
      </div>
    `;
  }

  async loadDevelopers() {
    try {
      const response = await fetch(`${this.apiBase}/developers`);
      const data = await response.json();

      if (data.success) {
        this.renderDevelopers(data.developers);
      }
    } catch (error) {
      console.error('Error loading developers:', error);
    }
  }

  renderDevelopers(developers) {
    const container = document.getElementById('developers-list');
    if (!container) return;

    if (!developers || developers.length === 0) {
      container.innerHTML = '<p>No developers registered yet</p>';
      return;
    }

    container.innerHTML = developers.map(dev => `
      <div class="developer-card" style="
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        cursor: pointer;
      " onclick="window.portalUI.viewDeveloper('${dev.id}')">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h5 style="margin: 0;">${dev.name}</h5>
            <p style="margin: 2px 0; color: #666; font-size: 14px;">${dev.email}</p>
            <p style="margin: 2px 0; font-size: 12px; color: #888;">${dev.company || 'Independent'}</p>
          </div>
          <div>
            <span style="
              background: ${dev.status === 'active' ? '#4CAF50' : dev.status === 'pending' ? '#FFC107' : '#f44336'};
              color: white;
              padding: 2px 10px;
              border-radius: 12px;
              font-size: 11px;
            ">${dev.status}</span>
            <span style="
              background: #e3f2fd;
              padding: 2px 10px;
              border-radius: 12px;
              font-size: 11px;
              margin-left: 5px;
            ">${dev.plan}</span>
          </div>
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 5px;">
          📅 Joined: ${new Date(dev.createdAt).toLocaleDateString()}
          ${dev.apiKeys ? ` | 🔑 ${dev.apiKeys.length} keys` : ''}
        </div>
      </div>
    `).join('');
  }

  async viewDeveloper(developerId) {
    try {
      const response = await fetch(`${this.apiBase}/${developerId}`);
      const data = await response.json();

      if (data.success) {
        this.currentDeveloper = data.developer;
        this.showDeveloperModal(data.developer);
        this.loadKeys(developerId);
      }
    } catch (error) {
      console.error('Error viewing developer:', error);
    }
  }

  showDeveloperModal(developer) {
    const modal = document.createElement('div');
    modal.className = 'developer-modal';
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
        <h3 style="margin-top: 0;">${developer.name}</h3>
        <p><strong>Email:</strong> ${developer.email}</p>
        <p><strong>Company:</strong> ${developer.company || 'N/A'}</p>
        <p><strong>Website:</strong> ${developer.website || 'N/A'}</p>
        <p><strong>Status:</strong> ${developer.status}</p>
        <p><strong>Plan:</strong> ${developer.plan}</p>
        <p><strong>API Keys:</strong> ${developer.apiKeys?.length || 0}</p>
        <p><strong>Joined:</strong> ${new Date(developer.createdAt).toLocaleDateString()}</p>
        
        <div style="margin-top: 15px;">
          <h4>API Keys</h4>
          <div id="modal-keys-list"></div>
        </div>
        
        <button onclick="window.portalUI.generateKey('${developer.id}')" style="
          margin-top: 10px;
          padding: 8px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Generate API Key</button>
        <button onclick="this.closest('.developer-modal').remove()" style="
          margin-top: 10px;
          margin-left: 10px;
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

  async loadKeys(developerId) {
    try {
      const response = await fetch(`${this.apiBase}/keys/${developerId}`);
      const data = await response.json();

      if (data.success) {
        this.renderKeys(data.keys, '#modal-keys-list');
      }
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  }

  renderKeys(keys, containerId = '#keys-list') {
    const container = document.querySelector(containerId);
    if (!container) return;

    if (!keys || keys.length === 0) {
      container.innerHTML = '<p style="font-size: 12px; color: #888;">No API keys</p>';
      return;
    }

    container.innerHTML = keys.map(key => `
      <div style="
        background: #f5f5f5;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      ">
        <div>
          <strong>${key.name}</strong>
          <span style="font-size: 11px; color: #888; margin-left: 10px;">${key.key.slice(0, 8)}...</span>
        </div>
        <div>
          <span style="
            background: ${key.status === 'active' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
          ">${key.status}</span>
          <span style="font-size: 11px; color: #888; margin-left: 5px;">
            ${key.requests || 0} requests
          </span>
        </div>
      </div>
    `).join('');
  }

  async generateKey(developerId) {
    const name = prompt('Enter API key name:', 'My API Key');
    if (!name) return;

    try {
      const response = await fetch(`${this.apiBase}/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerId, name })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ API key generated!', 'success');
        this.loadKeys(developerId);
        
        // Show the key
        alert(`Your API Key: ${data.apiKey.key}\n\nPlease save this key securely.`);
      }
    } catch (error) {
      console.error('Error generating key:', error);
      this.showToast('❌ Error generating key', 'error');
    }
  }

  async loadDocs() {
    try {
      const response = await fetch(`${this.apiBase}/docs`);
      const data = await response.json();

      if (data.success) {
        this.renderDocs(data.docs);
      }
    } catch (error) {
      console.error('Error loading docs:', error);
    }
  }

  renderDocs(docs) {
    const container = document.getElementById('docs-list');
    if (!container) return;

    if (!docs || docs.length === 0) {
      container.innerHTML = '<p>No documentation available</p>';
      return;
    }

    container.innerHTML = docs.map(doc => `
      <div style="
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      ">
        <h5 style="margin: 0;">${doc.title}</h5>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">${doc.description}</p>
        <div style="display: flex; gap: 10px; font-size: 12px; color: #888;">
          <span>📂 ${doc.category}</span>
          <span>📅 ${new Date(doc.publishedAt).toLocaleDateString()}</span>
          <span>📌 v${doc.version}</span>
        </div>
      </div>
    `).join('');
  }

  async loadAnalytics() {
    try {
      const response = await fetch(`${this.apiBase}/analytics?period=day`);
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
      <div style="
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      ">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
          <div>
            <div style="font-size: 12px; color: #888;">Total Requests</div>
            <div style="font-size: 24px; font-weight: bold;">${analytics.totalRequests}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #888;">Avg Response</div>
            <div style="font-size: 24px; font-weight: bold;">${analytics.avgResponseTime}ms</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #888;">Success Rate</div>
            <div style="font-size: 24px; font-weight: bold;">
              ${analytics.statusDistribution?.success || 0}%
            </div>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <h5>Top Endpoints</h5>
          ${analytics.endpointUsage?.map(e => `
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; font-size: 14px;">
              <span>${e.endpoint}</span>
              <span>${e.count} requests</span>
            </div>
          `).join('') || '<p>No data</p>'}
        </div>
        <div style="font-size: 12px; color: #888; margin-top: 15px;">
          Period: ${analytics.period} | ${new Date(analytics.timestamp).toLocaleString()}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Register developer
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-register' || e.target.closest('#btn-register')) {
        this.registerDeveloper();
      }
    });

    // API Docs
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-docs' || e.target.closest('#btn-docs')) {
        document.getElementById('docs-section').style.display = 'block';
        document.getElementById('keys-section').style.display = 'none';
        document.getElementById('analytics-section').style.display = 'none';
        this.loadDocs();
      }
    });

    // API Keys
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-keys' || e.target.closest('#btn-keys')) {
        document.getElementById('keys-section').style.display = 'block';
        document.getElementById('docs-section').style.display = 'none';
        document.getElementById('analytics-section').style.display = 'none';
        
        if (this.currentDeveloper) {
          this.loadKeys(this.currentDeveloper.id);
        } else {
          alert('Please select a developer first');
        }
      }
    });

    // Analytics
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-analytics' || e.target.closest('#btn-analytics')) {
        document.getElementById('analytics-section').style.display = 'block';
        document.getElementById('docs-section').style.display = 'none';
        document.getElementById('keys-section').style.display = 'none';
        this.loadAnalytics();
      }
    });

    // Generate key
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-generate-key' || e.target.closest('#btn-generate-key')) {
        if (this.currentDeveloper) {
          this.generateKey(this.currentDeveloper.id);
        } else {
          alert('Please select a developer first');
        }
      }
    });
  }

  async registerDeveloper() {
    const name = prompt('Developer Name:');
    if (!name) return;

    const email = prompt('Email:');
    if (!email) return;

    const company = prompt('Company (optional):');
    const website = prompt('Website (optional):');

    try {
      const response = await fetch(`${this.apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, website })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Developer registered!', 'success');
        this.loadDevelopers();
        this.loadStats();
        
        // Show API key
        alert(`Registration successful!\n\nYour API Key: ${data.apiKey.key}\n\nPlease save this key securely.`);
      }
    } catch (error) {
      console.error('Error registering developer:', error);
      this.showToast('❌ Error registering developer', 'error');
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
  const portalUI = new DeveloperPortalUI({
    container: '#developer-container'
  });
  window.portalUI = portalUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .developer-interface { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .developer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .developer-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .developer-card:hover { transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important; }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.3s; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-primary:hover { background: #388E3C; }
  .btn-secondary { background: #FF9800; color: white; }
  .btn-secondary:hover { background: #F57C00; }
  .btn-info { background: #2196F3; color: white; }
  .btn-info:hover { background: #1976D2; }
  .btn-success { background: #4CAF50; color: white; }
  .btn-success:hover { background: #388E3C; }
  .loading { text-align: center; padding: 40px; color: #666; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @media (max-width: 768px) {
    .developer-header { flex-direction: column; align-items: stretch; }
    .developer-actions { justify-content: stretch; }
    .developer-actions .btn { flex: 1; }
  }
`;
document.head.appendChild(style);