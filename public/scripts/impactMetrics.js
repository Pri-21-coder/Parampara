// public/scripts/impactMetrics.js

class ImpactMetricsUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/impact';
    this.container = options.container || '#impact-container';
    this.charts = {};
    this.currentReport = null;
    
    this.init();
  }

  init() {
    this.renderInterface();
    this.loadMetrics();
    this.loadGoals();
    this.loadStats();
    this.setupEventListeners();
    console.log('✅ Impact Metrics UI initialized');
  }

  renderInterface() {
    const container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = `
      <div class="impact-interface">
        <div class="impact-header">
          <h2>📊 Cultural Heritage Impact Metrics</h2>
          <div class="impact-actions">
            <button id="btn-calculate" class="btn btn-primary">📊 Calculate Impact</button>
            <button id="btn-report" class="btn btn-info">📄 Generate Report</button>
            <button id="btn-goal" class="btn btn-success">🎯 Add Goal</button>
            <button id="btn-export" class="btn btn-secondary">📥 Export Data</button>
          </div>
        </div>

        <!-- Stats -->
        <div id="impact-stats" class="impact-stats">
          <div class="loading">Loading stats...</div>
        </div>

        <!-- Impact Score -->
        <div id="impact-score" class="impact-score">
          <!-- Score will be loaded here -->
        </div>

        <!-- Indicators -->
        <div class="indicators-section">
          <h4>📈 Key Indicators</h4>
          <div id="indicators-grid" class="indicators-grid">
            <div class="loading">Loading indicators...</div>
          </div>
        </div>

        <!-- Goals -->
        <div class="goals-section">
          <h4>🎯 Goals & Progress</h4>
          <div id="goals-list" class="goals-list">
            <div class="loading">Loading goals...</div>
          </div>
        </div>

        <!-- Reports -->
        <div class="reports-section">
          <h4>📄 Recent Reports</h4>
          <div id="reports-list" class="reports-list">
            <p>No reports generated yet</p>
          </div>
        </div>
      </div>
    `;
  }

  async loadMetrics() {
    try {
      const response = await fetch(`${this.apiBase}/metrics`);
      const data = await response.json();

      if (data.success) {
        this.renderMetrics(data.metrics);
        await this.calculateImpact();
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  renderMetrics(metrics) {
    const container = document.getElementById('impact-score');
    if (!container) return;

    if (!metrics || !metrics.overall) {
      container.innerHTML = '<p>No metrics data available</p>';
      return;
    }

    const m = metrics.overall;
    const score = Math.round(
      (m.preservationScore + m.communityScore + m.educationScore + 
       m.diversityScore + m.documentationScore + m.youthScore) / 6
    );

    const statusColors = {
      'excellent': '#4CAF50',
      'good': '#8BC34A',
      'moderate': '#FFC107',
      'poor': '#FF9800',
      'critical': '#f44336'
    };

    const status = this.getStatus(score);

    container.innerHTML = `
      <div style="
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
        margin: 20px 0;
      ">
        <h4 style="margin: 0 0 10px 0;">Overall Cultural Heritage Impact Score</h4>
        <div style="font-size: 72px; font-weight: bold; color: ${statusColors[status]};">
          ${score}%
        </div>
        <div style="
          background: ${statusColors[status]}20;
          padding: 5px 20px;
          border-radius: 20px;
          display: inline-block;
          margin-top: 10px;
        ">
          <span style="color: ${statusColors[status]}; font-weight: bold;">${status.toUpperCase()}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; margin-top: 20px;">
          <div>
            <div style="font-size: 24px; font-weight: bold;">${m.preservationScore}%</div>
            <div style="font-size: 12px; color: #888;">Preservation</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">${m.communityScore}%</div>
            <div style="font-size: 12px; color: #888;">Community</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">₹${(m.economicScore/1000).toFixed(0)}K</div>
            <div style="font-size: 12px; color: #888;">Economic</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">${m.educationScore}%</div>
            <div style="font-size: 12px; color: #888;">Education</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">${m.diversityScore}%</div>
            <div style="font-size: 12px; color: #888;">Diversity</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">${m.documentationScore}%</div>
            <div style="font-size: 12px; color: #888;">Documentation</div>
          </div>
        </div>
      </div>
    `;
  }

  async calculateImpact() {
    try {
      const response = await fetch(`${this.apiBase}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        this.renderIndicators(data.impact.indicatorScores);
        this.showToast('✅ Impact calculated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error calculating impact:', error);
    }
  }

  renderIndicators(indicators) {
    const container = document.getElementById('indicators-grid');
    if (!container) return;

    if (!indicators || indicators.length === 0) {
      container.innerHTML = '<p>No indicators available</p>';
      return;
    }

    const statusColors = {
      'excellent': '#4CAF50',
      'good': '#8BC34A',
      'moderate': '#FFC107',
      'poor': '#FF9800',
      'critical': '#f44336'
    };

    container.innerHTML = `
      <div class="indicators-grid-layout">
        ${indicators.map(indicator => `
          <div class="indicator-card" style="
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-left: 4px solid ${statusColors[indicator.status]};
          ">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <h5 style="margin: 0;">${indicator.name}</h5>
              <span style="
                background: ${statusColors[indicator.status]};
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
              ">${indicator.status}</span>
            </div>
            <p style="font-size: 12px; color: #888; margin: 5px 0;">${indicator.category}</p>
            <div style="margin: 10px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 14px;">
                <span>Progress</span>
                <span>${indicator.value} / ${indicator.target}</span>
              </div>
              <div style="
                width: 100%;
                height: 8px;
                background: #eee;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 5px;
              ">
                <div style="
                  height: 100%;
                  background: ${statusColors[indicator.status]};
                  width: ${indicator.score}%;
                  transition: width 1s ease;
                "></div>
              </div>
              <div style="font-size: 12px; color: #888; margin-top: 5px;">
                Score: ${indicator.score}%
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async loadGoals() {
    try {
      const response = await fetch(`${this.apiBase}/goals`);
      const data = await response.json();

      if (data.success) {
        this.renderGoals(data.goals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }

  renderGoals(goals) {
    const container = document.getElementById('goals-list');
    if (!container) return;

    if (!goals || goals.length === 0) {
      container.innerHTML = '<p>No goals set yet</p>';
      return;
    }

    const statusColors = {
      'completed': '#4CAF50',
      'on_track': '#8BC34A',
      'in_progress': '#FFC107',
      'behind_schedule': '#FF9800',
      'overdue': '#f44336'
    };

    container.innerHTML = goals.map(goal => `
      <div class="goal-card" style="
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        border-left: 4px solid ${statusColors[goal.status] || '#999'};
      ">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h5 style="margin: 0;">${goal.name}</h5>
            <p style="font-size: 12px; color: #888; margin: 2px 0;">${goal.indicator}</p>
          </div>
          <span style="
            background: ${statusColors[goal.status] || '#999'};
            color: white;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 11px;
          ">${goal.status}</span>
        </div>
        <div style="margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span>Progress</span>
            <span>${goal.current} / ${goal.target}</span>
          </div>
          <div style="
            width: 100%;
            height: 8px;
            background: #eee;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 5px;
          ">
            <div style="
              height: 100%;
              background: ${statusColors[goal.status] || '#999'};
              width: ${goal.progress}%;
              transition: width 1s ease;
            "></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-top: 5px;">
            <span>${goal.progress}% Complete</span>
            <span>${goal.daysRemaining} days remaining</span>
          </div>
        </div>
        ${goal.remaining > 0 ? `
          <div style="font-size: 12px; color: #888;">
            Need to improve by ${goal.remaining} to reach target
          </div>
        ` : `
          <div style="font-size: 12px; color: #4CAF50;">
            ✅ Goal achieved!
          </div>
        `}
      </div>
    `).join('');
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
    const container = document.getElementById('impact-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.overallImpact || 0}%</div>
          <div class="stat-label">Overall Impact</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalGoals || 0}</div>
          <div class="stat-label">Total Goals</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.completedGoals || 0}</div>
          <div class="stat-label">Completed Goals</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.inProgressGoals || 0}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalIndicators || 0}</div>
          <div class="stat-label">Indicators</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalReports || 0}</div>
          <div class="stat-label">Reports</div>
        </div>
      </div>
    `;
  }

  async generateReport() {
    const type = prompt('Report type (summary, detailed, executive, full):', 'summary');
    if (!type) return;

    try {
      this.showToast('📄 Generating report...', 'info');

      const response = await fetch(`${this.apiBase}/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      const data = await response.json();

      if (data.success) {
        this.currentReport = data.report;
        this.showToast('✅ Report generated!', 'success');
        this.loadReports();
        this.viewReport(data.report);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      this.showToast('❌ Error generating report', 'error');
    }
  }

  async loadReports() {
    try {
      const response = await fetch(`${this.apiBase}/reports`);
      const data = await response.json();

      if (data.success) {
        this.renderReports(data.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  renderReports(reports) {
    const container = document.getElementById('reports-list');
    if (!container) return;

    if (!reports || reports.length === 0) {
      container.innerHTML = '<p>No reports generated yet</p>';
      return;
    }

    container.innerHTML = reports.slice(-5).reverse().map(report => `
      <div style="
        background: white;
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <strong>${report.type} Report</strong>
          <span style="font-size: 12px; color: #888; margin-left: 10px;">
            ${new Date(report.generatedAt).toLocaleString()}
          </span>
        </div>
        <button onclick="window.metricsUI.viewReport('${report.id}')" style="
          padding: 4px 12px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">View</button>
      </div>
    `).join('');
  }

  viewReport(report) {
    const modal = document.createElement('div');
    modal.className = 'report-modal';
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
    
    const sections = report.sections || {};
    const summary = sections.summary || {};

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
        <h3 style="margin-top: 0;">📄 ${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report</h3>
        <p style="font-size: 12px; color: #888;">
          Generated: ${new Date(report.generatedAt).toLocaleString()}
        </p>
        
        <div style="margin: 15px 0;">
          <h4>Summary</h4>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <p><strong>Overall Score:</strong> ${summary.overallScore || 0}%</p>
            <p><strong>Status:</strong> ${summary.status || 'Unknown'}</p>
            <p><strong>Indicators:</strong> ${summary.numberOfIndicators || 0}</p>
            <p><strong>On Track:</strong> ${summary.onTrack || 0}</p>
            <p><strong>Needs Improvement:</strong> ${summary.needsImprovement || 0}</p>
          </div>
        </div>

        ${sections.keyMetrics ? `
          <div style="margin: 15px 0;">
            <h4>Key Metrics</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${Object.entries(sections.keyMetrics).map(([key, value]) => `
                <div style="background: #f5f5f5; padding: 8px; border-radius: 5px;">
                  <div style="font-size: 12px; color: #888;">${key}</div>
                  <div style="font-weight: bold;">${value}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${sections.recommendations ? `
          <div style="margin: 15px 0;">
            <h4>Recommendations</h4>
            ${sections.recommendations.map(rec => `
              <div style="
                background: ${rec.priority === 'high' ? '#ffebee' : '#fff3e0'};
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 5px;
                border-left: 3px solid ${rec.priority === 'high' ? '#f44336' : '#FF9800'};
              ">
                <strong>${rec.indicator}</strong>
                <div style="font-size: 13px;">${rec.recommendation}</div>
                <div style="font-size: 11px; color: #888;">
                  Current: ${rec.current} | Target: ${rec.target}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <button onclick="window.metricsUI.downloadReport('${report.id}')" style="
          margin-top: 15px;
          padding: 8px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Download Report</button>
        <button onclick="this.closest('.report-modal').remove()" style="
          margin-top: 15px;
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

  async downloadReport(reportId) {
    try {
      const response = await fetch(`${this.apiBase}/export?format=json`);
      const data = await response.json();

      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `impact_report_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('📥 Report downloaded!', 'success');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      this.showToast('❌ Error downloading report', 'error');
    }
  }

  async addGoal() {
    const name = prompt('Goal name:');
    if (!name) return;

    const indicator = prompt('Indicator name:', 'Cultural Heritage Preservation Index');
    if (!indicator) return;

    const target = prompt('Target value:', '85');
    if (!target) return;

    const current = prompt('Current value:', '72');
    if (!current) return;

    const deadline = prompt('Deadline (YYYY-MM-DD):', '2025-12-31');
    if (!deadline) return;

    try {
      const response = await fetch(`${this.apiBase}/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          indicator,
          target: parseInt(target),
          current: parseInt(current),
          deadline
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('✅ Goal created!', 'success');
        this.loadGoals();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      this.showToast('❌ Error creating goal', 'error');
    }
  }

  async exportData() {
    const format = prompt('Export format (json or csv):', 'json');
    if (!format) return;

    try {
      const response = await fetch(`${this.apiBase}/export?format=${format}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `impact_data_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('📥 Data exported as CSV!', 'success');
      } else {
        const data = await response.json();
        if (data.success) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `impact_data_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast('📥 Data exported as JSON!', 'success');
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('❌ Error exporting data', 'error');
    }
  }

  getStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'poor';
    return 'critical';
  }

  setupEventListeners() {
    // Calculate impact
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-calculate' || e.target.closest('#btn-calculate')) {
        this.calculateImpact();
      }
    });

    // Generate report
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-report' || e.target.closest('#btn-report')) {
        this.generateReport();
      }
    });

    // Add goal
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-goal' || e.target.closest('#btn-goal')) {
        this.addGoal();
      }
    });

    // Export data
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-export' || e.target.closest('#btn-export')) {
        this.exportData();
      }
    });
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
  const metricsUI = new ImpactMetricsUI({
    container: '#impact-container'
  });
  window.metricsUI = metricsUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .impact-interface { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .impact-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .impact-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
  .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .stat-value { font-size: 2em; font-weight: bold; color: #2E7D32; }
  .indicators-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin: 15px 0; }
  .indicator-card { transition: transform 0.3s; }
  .indicator-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important; }
  .goal-card { transition: transform 0.3s; }
  .goal-card:hover { transform: translateX(5px); }
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
    .impact-header { flex-direction: column; align-items: stretch; }
    .impact-actions { justify-content: stretch; }
    .impact-actions .btn { flex: 1; }
    .indicators-grid-layout { grid-template-columns: 1fr; }
  }
`;
document.head.appendChild(style);