// public/scripts/jobs.js

class JobUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/jobs';
    this.container = options.container || '#jobs-container';
    this.filters = {};
    this.autoRefresh = true;
    
    this.init();
  }

  init() {
    this.renderInterface();
    this.loadJobs();
    this.loadStats();
    this.setupEventListeners();
    this.startAutoRefresh();
    console.log('✅ Job UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="jobs-interface">
        <div class="jobs-header">
          <h2>⚡ Background Jobs</h2>
          <div class="jobs-actions">
            <button id="btn-refresh" class="btn btn-primary">🔄 Refresh</button>
            <button id="btn-create" class="btn btn-success">➕ Create Job</button>
            <button id="btn-stats" class="btn btn-info">📊 Stats</button>
          </div>
        </div>

        <!-- Stats -->
        <div id="jobs-stats" class="jobs-stats">
          <div class="loading">Loading stats...</div>
        </div>

        <!-- Filters -->
        <div class="jobs-filters">
          <select id="filter-status">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select id="filter-type">
            <option value="">All Types</option>
            <option value="csv_import">CSV Import</option>
            <option value="json_export">JSON Export</option>
            <option value="image_optimization">Image Optimization</option>
            <option value="report_generation">Report Generation</option>
            <option value="cache_rebuild">Cache Rebuild</option>
            <option value="email_send">Email Send</option>
            <option value="data_sync">Data Sync</option>
          </select>
          <button id="btn-apply-filters" class="btn btn-primary">Apply</button>
        </div>

        <!-- Jobs List -->
        <div id="jobs-list" class="jobs-list">
          <div class="loading">Loading jobs...</div>
        </div>
      </div>
    `;
  }

  async loadJobs() {
    const container = document.getElementById('jobs-list');
    if (!container) return;

    this.setLoading(container, true);

    try {
      const params = new URLSearchParams(this.filters);
      const response = await fetch(`${this.apiBase}?${params}`);
      const data = await response.json();

      if (data.success) {
        this.renderJobs(container, data.jobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      container.innerHTML = '<p class="error">❌ Failed to load jobs</p>';
    } finally {
      this.setLoading(container, false);
    }
  }

  renderJobs(container, jobs) {
    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<p class="empty">No jobs found</p>';
      return;
    }

    const statusColors = {
      pending: '#FFC107',
      processing: '#2196F3',
      completed: '#4CAF50',
      failed: '#f44336',
      cancelled: '#9E9E9E'
    };

    container.innerHTML = `
      <div class="jobs-list-table">
        ${jobs.map(job => `
          <div class="job-item" style="
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-left: 4px solid ${statusColors[job.status] || '#999'};
          ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <strong>${job.type}</strong>
                <span style="font-size: 12px; color: #888; margin-left: 10px;">
                  ID: ${job.id.slice(0, 12)}...
                </span>
              </div>
              <span style="
                background: ${statusColors[job.status] || '#999'};
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
              ">${job.status}</span>
            </div>
            <div style="margin: 10px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span>Progress</span>
                <span>${job.progress || 0}%</span>
              </div>
              <div style="
                width: 100%;
                height: 8px;
                background: #eee;
                border-radius: 4px;
                overflow: hidden;
              ">
                <div style="
                  height: 100%;
                  background: ${statusColors[job.status] || '#4CAF50'};
                  width: ${job.progress || 0}%;
                  transition: width 0.5s ease;
                "></div>
              </div>
            </div>
            <div style="display: flex; gap: 15px; font-size: 12px; color: #888;">
              <span>📅 ${new Date(job.createdAt).toLocaleString()}</span>
              <span>🔄 Attempts: ${job.attempts || 0}/${job.maxRetries || 3}</span>
              <span>⚡ ${job.priority || 'normal'}</span>
              ${job.duration ? `<span>⏱️ ${job.duration}ms</span>` : ''}
            </div>
            ${job.error ? `
              <div style="margin-top: 8px; background: #ffebee; padding: 8px; border-radius: 4px; font-size: 12px; color: #c62828;">
                ❌ ${job.error}
              </div>
            ` : ''}
            ${job.result ? `
              <div style="margin-top: 8px; font-size: 12px; color: #4CAF50;">
                ✅ ${job.result.message || 'Completed'}
              </div>
            ` : ''}
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              ${job.status === 'pending' ? `
                <button onclick="window.jobUI.cancelJob('${job.id}')" style="
                  padding: 4px 12px;
                  background: #f44336;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                ">Cancel</button>
              ` : ''}
              ${job.status === 'failed' ? `
                <button onclick="window.jobUI.retryJob('${job.id}')" style="
                  padding: 4px 12px;
                  background: #FF9800;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                ">Retry</button>
              ` : ''}
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
    const container = document.getElementById('jobs-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.total || 0}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.pending || 0}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.processing || 0}</div>
          <div class="stat-label">Processing</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.completed || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.failed || 0}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.queueLength || 0}</div>
          <div class="stat-label">Queue Length</div>
        </div>
      </div>
    `;
  }

  async createJob() {
    const type = prompt('Job type (csv_import, json_export, image_optimization, report_generation, cache_rebuild, email_send, data_sync):', 'csv_import');
    if (!type) return;

    const data = prompt('Job data (JSON):', '{"rows": 100}');
    if (!data) return;

    try {
      const response = await fetch(`${this.apiBase}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: JSON.parse(data),
          options: { priority: 'normal' }
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showToast('✅ Job created!', 'success');
        this.loadJobs();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error creating job:', error);
      this.showToast('❌ Error creating job', 'error');
    }
  }

  async cancelJob(jobId) {
    if (!confirm('Are you sure you want to cancel this job?')) return;

    try {
      const response = await fetch(`${this.apiBase}/${jobId}/cancel`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Job cancelled!', 'success');
        this.loadJobs();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      this.showToast('❌ Error cancelling job', 'error');
    }
  }

  async retryJob(jobId) {
    try {
      const response = await fetch(`${this.apiBase}/${jobId}/retry`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Job retried!', 'success');
        this.loadJobs();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error retrying job:', error);
      this.showToast('❌ Error retrying job', 'error');
    }
  }

  setupEventListeners() {
    // Refresh
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-refresh' || e.target.closest('#btn-refresh')) {
        this.loadJobs();
        this.loadStats();
        this.showToast('🔄 Refreshed!', 'info');
      }
    });

    // Create job
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-create' || e.target.closest('#btn-create')) {
        this.createJob();
      }
    });

    // Stats
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-stats' || e.target.closest('#btn-stats')) {
        this.loadStats();
        this.showToast('📊 Stats loaded!', 'info');
      }
    });

    // Apply filters
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-apply-filters' || e.target.closest('#btn-apply-filters')) {
        this.filters = {
          status: document.getElementById('filter-status').value,
          type: document.getElementById('filter-type').value
        };
        // Remove empty filters
        Object.keys(this.filters).forEach(key => {
          if (!this.filters[key]) delete this.filters[key];
        });
        this.loadJobs();
      }
    });
  }

  startAutoRefresh() {
    setInterval(() => {
      if (this.autoRefresh) {
        this.loadJobs();
        this.loadStats();
      }
    }, 5000);
  }

  setLoading(container, isLoading) {
    if (isLoading) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 10px;">Loading jobs...</p>
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
  const jobUI = new JobUI({
    container: '#jobs-container'
  });
  window.jobUI = jobUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .jobs-interface { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .jobs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .jobs-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .jobs-filters { display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0; }
  .jobs-filters select { padding: 10px 15px; border: 1px solid #ddd; border-radius: 8px; }
  .job-item { transition: transform 0.3s; }
  .job-item:hover { transform: translateX(5px); }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.3s; }
  .btn-primary { background: #4CAF50; color: white; }
  .btn-primary:hover { background: #388E3C; }
  .btn-success { background: #4CAF50; color: white; }
  .btn-success:hover { background: #388E3C; }
  .btn-info { background: #2196F3; color: white; }
  .btn-info:hover { background: #1976D2; }
  .btn-danger { background: #f44336; color: white; }
  .btn-danger:hover { background: #d32f2f; }
  .loading { text-align: center; padding: 40px; color: #666; }
  .empty { text-align: center; padding: 40px; color: #666; }
  .error { text-align: center; padding: 40px; color: #f44336; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @media (max-width: 768px) {
    .jobs-header { flex-direction: column; align-items: stretch; }
    .jobs-actions { justify-content: stretch; }
    .jobs-actions .btn { flex: 1; }
    .jobs-filters { flex-direction: column; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;
document.head.appendChild(style);