// public/scripts/audit.js

class AuditUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/audit';
    this.container = options.container || '#audit-container';
    this.filters = {};
    this.currentPage = 1;
    this.pageSize = 50;
    
    this.init();
  }

  init() {
    this.renderInterface();
    this.loadLogs();
    this.loadStats();
    this.loadDashboard();
    this.setupEventListeners();
    console.log('✅ Audit UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="audit-interface">
        <div class="audit-header">
          <h2>📋 Audit Logs</h2>
          <div class="audit-actions">
            <button id="btn-refresh" class="btn btn-primary">🔄 Refresh</button>
            <button id="btn-export" class="btn btn-secondary">📥 Export</button>
            <button id="btn-clear" class="btn btn-danger">🧹 Clear Old Logs</button>
          </div>
        </div>

        <!-- Stats -->
        <div id="audit-stats" class="audit-stats">
          <div class="loading">Loading stats...</div>
        </div>

        <!-- Filters -->
        <div class="audit-filters">
          <input type="text" id="filter-search" placeholder="🔍 Search logs..." />
          <select id="filter-level">
            <option value="">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="FATAL">FATAL</option>
          </select>
          <select id="filter-status">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <input type="text" id="filter-user" placeholder="User ID..." />
          <button id="btn-apply-filters" class="btn btn-primary">Apply</button>
        </div>

        <!-- Logs Table -->
        <div class="audit-logs">
          <div id="logs-table" class="logs-table">
            <div class="loading">Loading logs...</div>
          </div>
        </div>

        <!-- Dashboard -->
        <div class="audit-dashboard" id="audit-dashboard">
          <h4>📊 Audit Dashboard</h4>
          <div id="dashboard-content" class="dashboard-content">
            <div class="loading">Loading dashboard...</div>
          </div>
        </div>
      </div>
    `;
  }

  async loadLogs() {
    const container = document.getElementById('logs-table');
    if (!container) return;

    this.setLoading(container, true);

    try {
      const params = new URLSearchParams({
        ...this.filters,
        limit: this.pageSize,
        skip: (this.currentPage - 1) * this.pageSize
      });

      const response = await fetch(`${this.apiBase}/logs?${params}`);
      const data = await response.json();

      if (data.success) {
        this.renderLogs(container, data.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      container.innerHTML = '<p class="error">❌ Failed to load logs</p>';
    } finally {
      this.setLoading(container, false);
    }
  }

  renderLogs(container, logs) {
    if (!logs || logs.length === 0) {
      container.innerHTML = '<p class="empty">No logs found</p>';
      return;
    }

    const levelColors = {
      INFO: '#4CAF50',
      WARN: '#FF9800',
      ERROR: '#f44336',
      FATAL: '#d32f2f',
      DEBUG: '#2196F3'
    };

    container.innerHTML = `
      <table class="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Level</th>
            <th>Action</th>
            <th>User</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr onclick="window.auditUI.viewLog('${log.id}')" style="cursor: pointer;">
              <td style="font-size: 12px;">${new Date(log.timestamp).toLocaleString()}</td>
              <td><span style="
                background: ${levelColors[log.level] || '#999'};
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
              ">${log.level}</span></td>
              <td style="font-size: 13px;">${log.action}</td>
              <td style="font-size: 13px;">${log.userId}</td>
              <td style="font-size: 13px;">${log.resource}</td>
              <td><span style="
                background: ${log.status === 'success' ? '#4CAF50' : log.status === 'failed' ? '#f44336' : '#FF9800'};
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
              ">${log.status}</span></td>
              <td style="font-size: 12px; color: #666;">${log.message || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
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
    const container = document.getElementById('audit-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalLogs || 0}</div>
          <div class="stat-label">Total Logs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.statusCounts?.success || 0}</div>
          <div class="stat-label">Success</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.statusCounts?.failed || 0}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(stats.statusCounts?.successRate || 0)}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Object.keys(stats.actionCounts || {}).length}</div>
          <div class="stat-label">Unique Actions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Object.keys(stats.userCounts || {}).length}</div>
          <div class="stat-label">Unique Users</div>
        </div>
      </div>
    `;
  }

  async loadDashboard() {
    try {
      const response = await fetch(`${this.apiBase}/dashboard`);
      const data = await response.json();

      if (data.success) {
        this.renderDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  renderDashboard(dashboard) {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    const recentLogs = dashboard.recent || [];
    const errorLogs = dashboard.errors || [];

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          <h5>🕐 Recent Activity</h5>
          ${recentLogs.slice(0, 5).map(log => `
            <div style="
              padding: 8px;
              border-bottom: 1px solid #eee;
              font-size: 13px;
              display: flex;
              justify-content: space-between;
            ">
              <span>${log.action}</span>
              <span style="color: #888; font-size: 11px;">${new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          `).join('') || '<p style="color: #999;">No recent activity</p>'}
        </div>
        <div style="background: #fff3f3; padding: 15px; border-radius: 8px;">
          <h5>❌ Recent Errors</h5>
          ${errorLogs.slice(0, 5).map(log => `
            <div style="
              padding: 8px;
              border-bottom: 1px solid #ffcdd2;
              font-size: 13px;
            ">
              <div><strong>${log.action}</strong></div>
              <div style="color: #666; font-size: 11px;">${log.message || 'No message'}</div>
              <div style="color: #888; font-size: 11px;">${new Date(log.timestamp).toLocaleString()}</div>
            </div>
          `).join('') || '<p style="color: #999;">No errors</p>'}
        </div>
      </div>
    `;
  }

  async viewLog(logId) {
    try {
      const response = await fetch(`${this.apiBase}/log/${logId}`);
      const data = await response.json();

      if (data.success) {
        this.showLogModal(data.log);
      }
    } catch (error) {
      console.error('Error viewing log:', error);
    }
  }

  showLogModal(log) {
    const modal = document.createElement('div');
    modal.className = 'log-modal';
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
        <h3 style="margin-top: 0;">📋 Log Details</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>ID:</strong> ${log.id}</div>
          <div><strong>Level:</strong> ${log.level}</div>
          <div><strong>Action:</strong> ${log.action}</div>
          <div><strong>User:</strong> ${log.userId}</div>
          <div><strong>Resource:</strong> ${log.resource}</div>
          <div><strong>Status:</strong> ${log.status}</div>
          <div><strong>Timestamp:</strong> ${new Date(log.timestamp).toLocaleString()}</div>
          ${log.duration ? `<div><strong>Duration:</strong> ${log.duration}ms</div>` : ''}
        </div>
        ${log.message ? `<p><strong>Message:</strong> ${log.message}</p>` : ''}
        ${log.metadata ? `
          <div style="margin-top: 10px;">
            <strong>Metadata:</strong>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 12px;">${JSON.stringify(log.metadata, null, 2)}</pre>
          </div>
        ` : ''}
        ${log.error ? `
          <div style="margin-top: 10px; background: #ffebee; padding: 10px; border-radius: 5px;">
            <strong>Error:</strong> ${log.error}
            ${log.stackTrace ? `<pre style="font-size: 11px; overflow-x: auto;">${log.stackTrace}</pre>` : ''}
          </div>
        ` : ''}
        <button onclick="this.closest('.log-modal').remove()" style="
          margin-top: 15px;
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

  async exportLogs() {
    const format = prompt('Export format (json or csv):', 'json');
    if (!format) return;

    try {
      const params = new URLSearchParams({
        ...this.filters,
        format
      });

      if (format === 'csv') {
        window.open(`${this.apiBase}/export?${params}`, '_blank');
        this.showToast('📥 Logs exported as CSV!', 'success');
      } else {
        const response = await fetch(`${this.apiBase}/export?${params}`);
        const data = await response.json();
        
        if (data.success) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit_logs_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast('📥 Logs exported as JSON!', 'success');
        }
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      this.showToast('❌ Error exporting logs', 'error');
    }
  }

  async clearOldLogs() {
    if (!confirm('Are you sure you want to clear old logs?')) return;

    try {
      const response = await fetch(`${this.apiBase}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast(`🧹 Removed ${data.removed} old logs`, 'success');
        this.loadLogs();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      this.showToast('❌ Error clearing logs', 'error');
    }
  }

  setupEventListeners() {
    // Refresh
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-refresh' || e.target.closest('#btn-refresh')) {
        this.loadLogs();
        this.loadStats();
        this.loadDashboard();
        this.showToast('🔄 Refreshed!', 'info');
      }
    });

    // Export
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-export' || e.target.closest('#btn-export')) {
        this.exportLogs();
      }
    });

    // Clear
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-clear' || e.target.closest('#btn-clear')) {
        this.clearOldLogs();
      }
    });

    // Apply filters
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-apply-filters' || e.target.closest('#btn-apply-filters')) {
        this.filters = {
          search: document.getElementById('filter-search').value,
          level: document.getElementById('filter-level').value,
          status: document.getElementById('filter-status').value,
          userId: document.getElementById('filter-user').value
        };
        // Remove empty filters
        Object.keys(this.filters).forEach(key => {
          if (!this.filters[key]) delete this.filters[key];
        });
        this.currentPage = 1;
        this.loadLogs();
        this.loadStats();
        this.showToast('📊 Filters applied!', 'info');
      }
    });

    // Enter key for search
    document.addEventListener('keypress', (e) => {
      if (e.target.id === 'filter-search' && e.key === 'Enter') {
        document.getElementById('btn-apply-filters').click();
      }
    });
  }

  setLoading(container, isLoading) {
    if (isLoading) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 10px;">Loading logs...</p>
        </div>
      `;
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
  const auditUI = new AuditUI({
    container: '#audit-container'
  });
  window.auditUI = auditUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .audit-interface { max-width: 1400px; margin: 0 auto; padding: 20px; }
  .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .audit-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .audit-filters { display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0; }
  .audit-filters input, .audit-filters select { padding: 10px 15px; border: 1px solid #ddd; border-radius: 8px; flex: 1; min-width: 150px; }
  .logs-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .logs-table table { width: 100%; border-collapse: collapse; }
  .logs-table th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
  .logs-table td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
  .logs-table tr:hover { background: #f9f9f9; }
  .audit-dashboard { margin-top: 20px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.3s; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-primary:hover { background: #388E3C; }
  .btn-secondary { background: #FF9800; color: white; }
  .btn-secondary:hover { background: #F57C00; }
  .btn-danger { background: #f44336; color: white; }
  .btn-danger:hover { background: #d32f2f; }
  .loading { text-align: center; padding: 40px; color: #666; }
  .empty { text-align: center; padding: 40px; color: #666; }
  .error { text-align: center; padding: 40px; color: #f44336; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @media (max-width: 768px) {
    .audit-header { flex-direction: column; align-items: stretch; }
    .audit-actions { justify-content: stretch; }
    .audit-actions .btn { flex: 1; }
    .audit-filters { flex-direction: column; }
    .logs-table { overflow-x: auto; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;
document.head.appendChild(style);