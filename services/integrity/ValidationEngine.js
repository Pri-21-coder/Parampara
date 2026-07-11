const crypto = require('crypto');
const DependencyGraph = require('./DependencyGraph');

class ValidationEngine {
  constructor(store) {
    this.store = store;
    this.rules = new Map(); // entityType -> Array of rule functions
    this.postProcessRules = []; // rules that run after the graph is fully built
    this.graph = new DependencyGraph();
    this.state = {
      titleToIdMap: new Map() // Helper for title-based lookups
    };
    
    // Incremental Scan Cache
    this.entityHashes = new Map(); // id -> hash
    this.issues = [];
    
    // Historical Reports
    this.history = []; // Array of { timestamp, summary }
  }

  registerRule(entityType, ruleFn) {
    if (!this.rules.has(entityType)) {
      this.rules.set(entityType, []);
    }
    this.rules.get(entityType).push(ruleFn);
  }

  registerPostProcessRule(ruleFn) {
    this.postProcessRules.push(ruleFn);
  }

  addIssue(type, severity, resourceId, resourceType, message, recommendation = null) {
    this.issues.push({
      type,
      severity,
      resourceId,
      resourceType,
      message,
      recommendation,
      timestamp: new Date().toISOString()
    });
  }

  _hashEntity(entity) {
    const data = JSON.stringify(entity);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  // Pre-process step: Build graph and helpers
  _buildGraph() {
    this.graph.clear();
    this.state.titleToIdMap.clear();

    const culturalItems = this.store.culturalItems || [];
    culturalItems.forEach(item => {
      const idStr = item.id ? item.id.toString() : 'unknown';
      this.graph.addNode(`culturalItem:${idStr}`, 'culturalItem', item);
      if (item.title && typeof item.title === 'string') {
        this.state.titleToIdMap.set(item.title.toLowerCase(), idStr);
      }
    });

    const heritagePaths = this.store.heritagePaths || [];
    heritagePaths.forEach(path => {
      const idStr = path.id ? path.id.toString() : 'unknown';
      this.graph.addNode(`heritagePath:${idStr}`, 'heritagePath', path);
      if (path.items && Array.isArray(path.items)) {
        path.items.forEach(itemId => {
          this.graph.addEdge(`heritagePath:${idStr}`, `culturalItem:${itemId}`);
        });
      }
    });

    const timelineEvents = this.store.timelineEvents || [];
    timelineEvents.forEach(event => {
      const idStr = event.id ? event.id.toString() : 'unknown';
      this.graph.addNode(`timelineEvent:${idStr}`, 'timelineEvent', event);
      if (event.item && typeof event.item === 'string') {
        const targetId = this.state.titleToIdMap.get(event.item.toLowerCase());
        if (targetId) {
          this.graph.addEdge(`timelineEvent:${idStr}`, `culturalItem:${targetId}`);
        }
      }
    });
  }

  runScan(incremental = false) {
    this.issues = [];
    const scanTimestamp = new Date().toISOString();
    
    const summary = {
      totalItemsChecked: 0,
      totalPathsChecked: 0,
      totalTimelineEventsChecked: 0,
      totalArtisansChecked: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      type: incremental ? 'incremental' : 'full',
      timestamp: scanTimestamp
    };

    // Build the dependency graph fresh every scan for accurate orphans and relationships
    this._buildGraph();

    // Helper to process an array of entities
    const processEntities = (entities, type, countKey) => {
      if (!entities) return;
      summary[countKey] = entities.length;
      
      entities.forEach(entity => {
        const idStr = entity.id ? entity.id.toString() : 'unknown';
        const fullId = `${type}:${idStr}`;
        const currentHash = this._hashEntity(entity);
        
        // If incremental, skip unchanged
        if (incremental && this.entityHashes.get(fullId) === currentHash) {
          return; // skip execution of rules
        }
        
        // Update hash
        this.entityHashes.set(fullId, currentHash);
        
        // Execute registered rules for this type
        const typeRules = this.rules.get(type) || [];
        typeRules.forEach(rule => {
          try {
            rule(entity);
          } catch (err) {
            this.addIssue('RULE_EXECUTION_ERROR', 'HIGH', idStr, type, `Error executing rule: ${err.message}`);
          }
        });
      });
    };

    processEntities(this.store.culturalItems, 'culturalItem', 'totalItemsChecked');
    processEntities(this.store.heritagePaths, 'heritagePath', 'totalPathsChecked');
    processEntities(this.store.timelineEvents, 'timelineEvent', 'totalTimelineEventsChecked');
    processEntities(this.store.artisans, 'artisan', 'totalArtisansChecked');
    processEntities(this.store.storySourceData, 'storySourceData', 'totalStoriesChecked');

    // Run post-process rules (like Graph-based Orphan Detection)
    // Post process rules are run every time (not skipped by incremental cache)
    this.postProcessRules.forEach(rule => rule());

    // Compute severity counts
    this.issues.forEach(issue => {
      if (issue.severity === 'HIGH') summary.highSeverity++;
      else if (issue.severity === 'MEDIUM') summary.mediumSeverity++;
      else if (issue.severity === 'LOW') summary.lowSeverity++;
    });

    const report = { summary, issues: this.issues };

    // Maintain history (last 10)
    this.history.unshift(report);
    if (this.history.length > 10) {
      this.history.pop();
    }

    return report;
  }
}

module.exports = ValidationEngine;
