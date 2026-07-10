const store = require('../data/store');
const ValidationEngine = require('./integrity/ValidationEngine');
const mediaRules = require('./integrity/rules/mediaRules');
const relationshipRules = require('./integrity/rules/relationshipRules');
const orphanRules = require('./integrity/rules/orphanRules');

class IntegrityServiceFacade {
  constructor() {
    this.engine = new ValidationEngine(store);
    this.registerAllRules();
  }

  registerAllRules() {
    mediaRules(this.engine);
    relationshipRules(this.engine);
    orphanRules(this.engine);
  }

  registerRule(rule) {
    if (typeof rule === 'function') {
      rule(this.engine);
    } else if (Array.isArray(rule)) {
      rule.forEach(r => this.registerRule(r));
    }
  }

  scanAll(incremental = false) {
    try {
      return this.engine.runScan(incremental);
    } catch (error) {
      console.error('Scan failed:', error.message);
      throw new Error(`Failed to run integrity scan: ${error.message}`);
    }
  }

  getReport() {
    try {
      if (this.engine.history.length === 0) {
        return this.scanAll(false);
      }
      return this.engine.history[0];
    } catch (error) {
      console.error('Failed to get report:', error.message);
      return {
        issues: [],
        summary: {
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0,
          totalIssues: 0,
          scannedAt: new Date().toISOString()
        }
      };
    }
  }

  getIssues(severityFilter = null) {
    const report = this.getReport();
    if (!report || !report.issues) {
      return [];
    }

    if (severityFilter) {
      const filter = severityFilter.toUpperCase();
      return report.issues.filter(issue => 
        issue.severity && issue.severity.toUpperCase() === filter
      );
    }
    return report.issues;
  }

  getIssuesByType(type) {
    const report = this.getReport();
    if (!report || !report.issues || !type) {
      return [];
    }
    return report.issues.filter(issue => 
      issue.type && issue.type.toLowerCase() === type.toLowerCase()
    );
  }

  getSummary() {
    const report = this.getReport();
    if (!report || !report.summary) {
      return {
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        totalIssues: 0,
        scannedAt: new Date().toISOString()
      };
    }
    return report.summary;
  }

  getHistory() {
    try {
      return this.engine.history.map(report => report.summary);
    } catch (error) {
      console.error('Failed to get history:', error.message);
      return [];
    }
  }

  getFullHistory() {
    try {
      return this.engine.history;
    } catch (error) {
      console.error('Failed to get full history:', error.message);
      return [];
    }
  }

  getAnalytics() {
    try {
      const history = this.getHistory();
      
      if (history.length === 0) {
        return {
          trend: 'No data available for analytics',
          latestMetrics: null,
          previousMetrics: null,
          comparison: null
        };
      }

      if (history.length < 2) {
        const latest = history[0];
        const totalLatest = this.calculateTotalIssues(latest);
        return {
          trend: 'Not enough data for trend analysis. Only one scan available.',
          latestMetrics: {
            totalIssues: totalLatest,
            highSeverity: latest.highSeverity || 0,
            mediumSeverity: latest.mediumSeverity || 0,
            lowSeverity: latest.lowSeverity || 0
          },
          previousMetrics: null,
          comparison: null
        };
      }

      const latest = history[0];
      const previous = history[1];
      
      const totalLatest = this.calculateTotalIssues(latest);
      const totalPrev = this.calculateTotalIssues(previous);

      return this.calculateAnalytics(latest, previous, totalLatest, totalPrev);
    } catch (error) {
      console.error('Failed to get analytics:', error.message);
      return {
        trend: 'Failed to calculate analytics',
        error: error.message
      };
    }
  }

  calculateTotalIssues(metrics) {
    if (!metrics) return 0;
    return (metrics.highSeverity || 0) + 
           (metrics.mediumSeverity || 0) + 
           (metrics.lowSeverity || 0);
  }

  calculateAnalytics(latest, previous, totalLatest, totalPrev) {
    const difference = totalLatest - totalPrev;
    const percentageChange = totalPrev > 0 
      ? (difference / totalPrev) * 100 
      : (difference > 0 ? 100 : 0);

    let trendMessage = 'No change in total issues.';
    let direction = 'stable';
    if (difference > 0) {
      trendMessage = `Issues increased by ${difference} (${percentageChange.toFixed(1)}%)`;
      direction = 'increasing';
    } else if (difference < 0) {
      trendMessage = `Issues decreased by ${Math.abs(difference)} (${Math.abs(percentageChange).toFixed(1)}%)`;
      direction = 'decreasing';
    }

    const highDiff = (latest.highSeverity || 0) - (previous.highSeverity || 0);
    const highDir = highDiff > 0 ? 'increased' : highDiff < 0 ? 'decreased' : 'unchanged';

    return {
      trend: trendMessage,
      direction: direction,
      difference: difference,
      percentageChange: percentageChange,
      latestMetrics: {
        totalIssues: totalLatest,
        highSeverity: latest.highSeverity || 0,
        mediumSeverity: latest.mediumSeverity || 0,
        lowSeverity: latest.lowSeverity || 0
      },
      previousMetrics: {
        totalIssues: totalPrev,
        highSeverity: previous.highSeverity || 0,
        mediumSeverity: previous.mediumSeverity || 0,
        lowSeverity: previous.lowSeverity || 0
      },
      comparison: {
        highSeverityChange: highDiff,
        highSeverityDirection: highDir,
        totalChange: difference,
        totalChangePercent: percentageChange
      }
    };
  }

  getSeverityBreakdown() {
    const issues = this.getIssues();
    const breakdown = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0
    };

    issues.forEach(issue => {
      const severity = (issue.severity || '').toLowerCase();
      if (severity === 'high' || severity === 'critical') {
        breakdown.high++;
      } else if (severity === 'medium') {
        breakdown.medium++;
      } else if (severity === 'low' || severity === 'info') {
        breakdown.low++;
      } else {
        breakdown.unknown++;
      }
    });

    return breakdown;
  }

  getIssueTypes() {
    const issues = this.getIssues();
    const types = {};

    issues.forEach(issue => {
      const type = issue.type || 'unknown';
      if (!types[type]) {
        types[type] = 0;
      }
      types[type]++;
    });

    return types;
  }

  clearHistory() {
    try {
      this.engine.history = [];
      return { success: true, message: 'History cleared successfully' };
    } catch (error) {
      console.error('Failed to clear history:', error.message);
      return { success: false, message: error.message };
    }
  }

  getEngine() {
    return this.engine;
  }

  getStatus() {
    return {
      hasHistory: this.engine.history.length > 0,
      totalScans: this.engine.history.length,
      lastScan: this.engine.history.length > 0 
        ? this.engine.history[0].summary.scannedAt 
        : null,
      registeredRules: this.getRegisteredRulesCount()
    };
  }

  getRegisteredRulesCount() {
    try {
      const rules = this.engine.getRules ? this.engine.getRules() : [];
      return rules.length;
    } catch {
      return 0;
    }
  }
}

module.exports = new IntegrityServiceFacade();