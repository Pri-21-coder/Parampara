// public/scripts/preservation.js

class PreservationUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/preservation';
    this.container = options.container || '#preservation-container';
    this.currentItem = null;
    this.insights = null;
    
    this.init();
  }

  init() {
    this.renderInterface();
    this.loadItems();
    this.loadStats();
    this.loadInsights();
    this.setupEventListeners();
    console.log('✅ Preservation UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="preservation-interface">
        <div class="preservation-header">
          <h2>🛡️ Heritage Preservation System</h2>
          <div class="preservation-actions">
            <button id="btn-assess-all" class="btn btn-primary">🔍 Assess All</button>
            <button id="btn-insights" class="btn btn-info">🧠 AI Insights</button>
            <button id="btn-stats" class="btn btn-secondary">📊 Stats</button>
          </div>
        </div>

        <!-- Stats -->
        <div id="preservation-stats" class="preservation-stats">
          <div class="loading">Loading stats...</div>
        </div>

        <!-- Insights -->
        <div id="insights-container" class="insights-container" style="display: none;">
          <!-- Insights will be loaded here -->
        </div>

        <!-- Heritage Items -->
        <div class="heritage-list">
          <h4>🏛️ Heritage Items</h4>
          <div id="items-grid" class="items-grid">
            <div class="loading">Loading items...</div>
          </div>
        </div>
      </div>
    `;
  }

  async loadItems() {
    try {
      const response = await fetch(`${this.apiBase}/items`);
      const data = await response.json();

      if (data.success) {
        this.renderItems(data.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  }

  renderItems(items) {
    const container = document.getElementById('items-grid');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<p>No heritage items found</p>';
      return;
    }

    const statusColors = {
      'critically_endangered': '#f44336',
      'endangered': '#FF9800',
      'vulnerable': '#FFC107',
      'stable': '#4CAF50',
      'safe': '#2196F3'
    };

    container.innerHTML = `
      <div class="items-grid-layout">
        ${items.map(item => `
          <div class="item-card" data-item-id="${item.id}" style="
            background: white;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.3s;
            border-left: 4px solid ${statusColors[item.status] || '#999'};
          " onclick="window.preservationUI.viewItem('${item.id}')">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <h4 style="margin: 0;">${item.name}</h4>
              <span style="
                background: ${statusColors[item.status] || '#999'};
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
              ">${item.status}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">${item.category} • ${item.region}</p>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #888; margin-top: 10px;">
              <span>📅 ${item.age} years old</span>
              <span>📊 ${item.significance}% significance</span>
              <span>🛡️ ${item.currentCondition}% condition</span>
            </div>
            <div style="margin-top: 10px;">
              <button onclick="event.stopPropagation(); window.preservationUI.assessItem('${item.id}')" style="
                padding: 5px 15px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
              ">🔍 Assess</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Hover effect
    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-3px)';
        card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      });
    });
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
    const container = document.getElementById('preservation-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalItems}</div>
          <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.riskDistribution.critical || 0}</div>
          <div class="stat-label">Critical Risk</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.recommendations.total || 0}</div>
          <div class="stat-label">Recommendations</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.resources.inProgress || 0}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.resources.completed || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.engagement.totalActivities || 0}</div>
          <div class="stat-label">Engagement Activities</div>
        </div>
      </div>
    `;
  }

  async loadInsights() {
    try {
      const response = await fetch(`${this.apiBase}/insights`);
      const data = await response.json();

      if (data.success) {
        this.insights = data.insights;
        this.renderInsights(data.insights);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  }

  renderInsights(insights) {
    const container = document.getElementById('insights-container');
    if (!container) return;

    container.innerHTML = `
      <div class="insights-content">
        <h4>🧠 AI Preservation Insights</h4>
        <div class="insights-grid">
          <div class="insight-card" style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px;">📊</div>
            <div style="font-size: 28px; font-weight: bold;">${insights.criticalItems}</div>
            <div>Critical Items Need Attention</div>
          </div>
          <div class="insight-card" style="background: #fff3e0; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px;">🎯</div>
            <div style="font-size: 28px; font-weight: bold;">${insights.overallRisk}%</div>
            <div>Overall Risk Score</div>
          </div>
          <div class="insight-card" style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px;">🏆</div>
            <div style="font-size: 28px; font-weight: bold;">${insights.preservationPriority?.length || 0}</div>
            <div>Priority Areas</div>
          </div>
        </div>

        <div style="margin-top: 15px;">
          <h5>⚡ Urgent Actions</h5>
          ${insights.urgentActions?.map(action => `
            <div style="background: #ffebee; padding: 10px; border-radius: 8px; margin-bottom: 5px; border-left: 3px solid #f44336;">
              <strong>${action.name}</strong>
              <span style="float: right;">Urgency: ${action.urgency}%</span>
              <div style="font-size: 12px; color: #666;">${action.action}</div>
            </div>
          `).join('') || '<p>No urgent actions</p>'}
        </div>

        <div style="margin-top: 15px;">
          <h5>📌 Top Recommendations</h5>
          ${insights.topRecommendations?.map(rec => `
            <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; margin-bottom: 5px;">
              <strong>${rec.action}</strong>
              <span style="float: right; background: ${rec.priority === 'critical' ? '#f44336' : rec.priority === 'high' ? '#FF9800' : '#4CAF50'}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${rec.priority}</span>
              <div style="font-size: 12px; color: #666;">${rec.description}</div>
            </div>
          `).join('') || '<p>No recommendations available</p>'}
        </div>
      </div>
    `;
  }

  async viewItem(itemId) {
    try {
      const response = await fetch(`${this.apiBase}/item/${itemId}`);
      const data = await response.json();

      if (data.success) {
        this.currentItem = data;
        this.showItemModal(data);
      }
    } catch (error) {
      console.error('Error viewing item:', error);
    }
  }

  showItemModal(data) {
    const item = data.item;
    const assessment = data.assessment;
    const recommendations = data.recommendations || [];
    const progress = data.progress || [];

    const riskColors = {
      'critical': '#f44336',
      'high': '#FF9800',
      'medium': '#FFC107',
      'low': '#4CAF50',
      'minimal': '#2196F3'
    };

    const modal = document.createElement('div');
    modal.className = 'item-modal';
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
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3 style="margin-top: 0;">${item.name}</h3>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Region:</strong> ${item.region}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Age:</strong> ${item.age} years</p>
        <p><strong>Significance:</strong> ${item.significance}%</p>
        <p><strong>Condition:</strong> ${item.currentCondition}%</p>
        <p><strong>Threat Level:</strong> ${item.threatLevel}%</p>

        ${assessment ? `
          <div style="margin: 15px 0; background: ${riskColors[assessment.riskLevel] || '#999'}20; padding: 15px; border-radius: 8px; border-left: 4px solid ${riskColors[assessment.riskLevel] || '#999'};">
            <h4>Risk Assessment</h4>
            <p><strong>Score:</strong> ${assessment.riskScore}%</p>
            <p><strong>Level:</strong> <span style="background: ${riskColors[assessment.riskLevel] || '#999'}; color: white; padding: 2px 10px; border-radius: 12px;">${assessment.riskLevel}</span></p>
            <p><strong>Urgency:</strong> ${assessment.urgency?.score || 0}% (${assessment.urgency?.level || 'N/A'})</p>
          </div>
        ` : ''}

        ${recommendations.length > 0 ? `
          <div style="margin: 15px 0;">
            <h4>📋 Recommendations</h4>
            ${recommendations.slice(0, 3).map(rec => `
              <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; margin-bottom: 5px; border-left: 3px solid ${rec.priority === 'critical' ? '#f44336' : rec.priority === 'high' ? '#FF9800' : '#4CAF50'};">
                <strong>${rec.action}</strong>
                <div style="font-size: 12px; color: #666;">${rec.description}</div>
              </div>
            `).join('')}
            ${recommendations.length > 3 ? `<p style="font-size: 12px; color: #888;">+ ${recommendations.length - 3} more recommendations</p>` : ''}
          </div>
        ` : ''}

        <div style="margin-top: 15px; display: flex; gap: 10px;">
          <button onclick="window.preservationUI.assessItem('${item.id}')" class="btn btn-primary">
            🔍 Assess
          </button>
          <button onclick="window.preservationUI.trackProgress('${item.id}')" class="btn btn-secondary">
            📈 Track Progress
          </button>
          <button onclick="this.closest('.item-modal').remove()" class="btn btn-danger">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async assessItem(itemId) {
    try {
      this.showToast('🔍 Assessing risk...', 'info');

      const response = await fetch(`${this.apiBase}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heritageId: itemId })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Risk assessment completed!', 'success');
        this.loadItems();
        this.loadStats();
        this.viewItem(itemId);
      }
    } catch (error) {
      console.error('Error assessing item:', error);
      this.showToast('❌ Error assessing item', 'error');
    }
  }

  async trackProgress(itemId) {
    const status = prompt('Enter progress status (in_progress, completed, pending):', 'in_progress');
    if (!status) return;

    const notes = prompt('Enter notes (optional):', '');

    try {
      const response = await fetch(`${this.apiBase}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heritageId: itemId,
          progressData: { status, notes }
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Progress tracked!', 'success');
        this.viewItem(itemId);
        this.loadStats();
      }
    } catch (error) {
      console.error('Error tracking progress:', error);
      this.showToast('❌ Error tracking progress', 'error');
    }
  }

  setupEventListeners() {
    // Assess All
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-assess-all' || e.target.closest('#btn-assess-all')) {
        this.assessAll();
      }
    });

    // Insights toggle
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-insights' || e.target.closest('#btn-insights')) {
        const container = document.getElementById('insights-container');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        if (container.style.display === 'block') {
          this.loadInsights();
        }
      }
    });

    // Stats
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-stats' || e.target.closest('#btn-stats')) {
        this.loadStats();
        this.showToast('📊 Stats refreshed!', 'info');
      }
    });
  }

  async assessAll() {
    this.showToast('🔍 Assessing all items...', 'info');

    try {
      const items = await fetch(`${this.apiBase}/items`).then(r => r.json());
      
      if (items.success) {
        for (const item of items.items) {
          await fetch(`${this.apiBase}/assess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heritageId: item.id })
          });
        }
        
        this.showToast('✅ All items assessed!', 'success');
        this.loadItems();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error assessing all:', error);
      this.showToast('❌ Error assessing all items', 'error');
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
  const preservationUI = new PreservationUI({
    container: '#preservation-container'
  });
  window.preservationUI = preservationUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .preservation-interface { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .preservation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .preservation-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .items-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin: 15px 0; }
  .item-card:hover { transform: translateY(-3px); }
  .insights-content { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .insights-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 10px 0; }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.3s; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-primary:hover { background: #388E3C; }
  .btn-secondary { background: #FF9800; color: white; }
  .btn-secondary:hover { background: #F57C00; }
  .btn-info { background: #2196F3; color: white; }
  .btn-info:hover { background: #1976D2; }
  .btn-danger { background: #f44336; color: white; }
  .btn-danger:hover { background: #d32f2f; }
  .loading { text-align: center; padding: 40px; color: #666; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @media (max-width: 768px) {
    .preservation-header { flex-direction: column; align-items: stretch; }
    .preservation-actions { justify-content: stretch; }
    .preservation-actions .btn { flex: 1; }
    .items-grid-layout { grid-template-columns: 1fr; }
    .insights-grid { grid-template-columns: 1fr; }
  }
`;
document.head.appendChild(style);