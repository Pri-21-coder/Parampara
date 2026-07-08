const store = require('../data/store');
const ValidationEngine = require('./integrity/ValidationEngine');
const mediaRules = require('./integrity/rules/mediaRules');
const relationshipRules = require('./integrity/rules/relationshipRules');
const orphanRules = require('./integrity/rules/orphanRules');

class IntegrityServiceFacade {
  constructor() {
    this.engine = new ValidationEngine(store);
    
    // Register Rules
    mediaRules(this.engine);
    relationshipRules(this.engine);
    orphanRules(this.engine);
  }

  scanAll(incremental = false) {
    return this.engine.runScan(incremental);
  }

  getReport() {
    if (this.engine.history.length === 0) {
      return this.scanAll(false);
    }
    return this.engine.history[0]; // Latest report
  }

  getIssues(severityFilter = null) {
    const report = this.getReport();
    if (severityFilter) {
      return report.issues.filter(issue => issue.severity === severityFilter.toUpperCase());
    }
    return report.issues;
  }

  getSummary() {
    return this.getReport().summary;
  }

  getHistory() {
    return this.engine.history.map(report => report.summary);
  }

  getAnalytics() {
    const history = this.getHistory();
    if (history.length < 2) return { trend: 'Not enough data for analytics' };
    
    const latest = history[0];
    const previous = history[1];
    
    const totalLatest = latest.highSeverity + latest.mediumSeverity + latest.lowSeverity;
    const totalPrev = previous.highSeverity + previous.mediumSeverity + previous.lowSeverity;
    
    const difference = totalLatest - totalPrev;
    let trend = 'No change in total issues.';
    if (difference > 0) trend = `Issues increased by ${difference}.`;
    if (difference < 0) trend = `Issues decreased by ${Math.abs(difference)}.`;

    return {
      trend,
      latestMetrics: {
        totalIssues: totalLatest,
        highSeverity: latest.highSeverity
      },
      previousMetrics: {
        totalIssues: totalPrev,
        highSeverity: previous.highSeverity
      }
    };
  }
}

module.exports = new IntegrityServiceFacade();
