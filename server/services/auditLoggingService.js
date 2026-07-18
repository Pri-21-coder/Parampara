// services/auditLoggingService.js
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

class AuditLoggingService {
  constructor() {
    this.logs = [];
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      FATAL: 4
    };
    this.currentLevel = this.logLevels.INFO;
    this.maxLogs = 10000;
    this.logRetentionDays = 30;
    this.auditConfig = {
      logCRUD: true,
      logAuth: true,
      logImports: true,
      logExports: true,
      logModeration: true,
      logAdmin: true
    };
    
    this.init();
  }

  init() {
    this.loadSampleLogs();
    this.startCleanupJob();
    console.log('✅ Audit Logging Service initialized');
  }

  loadSampleLogs() {
    // Add sample logs for demonstration
    const sampleEvents = [
      { action: 'user.login', user: 'admin', resource: 'user', resourceId: 'user_1', status: 'success' },
      { action: 'item.create', user: 'admin', resource: 'cultural_item', resourceId: 'item_1', status: 'success' },
      { action: 'item.update', user: 'user_1', resource: 'cultural_item', resourceId: 'item_2', status: 'success' },
      { action: 'item.delete', user: 'moderator', resource: 'cultural_item', resourceId: 'item_3', status: 'failed' },
      { action: 'export.data', user: 'admin', resource: 'export', resourceId: 'export_1', status: 'success' }
    ];

    sampleEvents.forEach((event, index) => {
      const logEntry = this.createLogEntry({
        action: event.action,
        userId: event.user,
        resource: event.resource,
        resourceId: event.resourceId,
        status: event.status,
        metadata: { sample: true, index }
      });
      this.logs.push(logEntry);
    });
  }

  /**
   * Create a log entry
   */
  createLogEntry(data) {
    return {
      id: `log_${Date.now()}_${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      level: data.level || 'INFO',
      action: data.action,
      userId: data.userId || 'system',
      userRole: data.userRole || 'user',
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      resource: data.resource,
      resourceId: data.resourceId || null,
      status: data.status || 'success',
      message: data.message || null,
      metadata: data.metadata || {},
      requestId: data.requestId || uuidv4(),
      sessionId: data.sessionId || null,
      duration: data.duration || null,
      error: data.error || null,
      stackTrace: data.stackTrace || null
    };
  }

  /**
   * Log an event
   */
  log(data) {
    const logEntry = this.createLogEntry(data);
    this.logs.push(logEntry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Store in persistent storage
    this.persistLog(logEntry);
    
    // Console output for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${logEntry.level}] ${logEntry.action} - ${logEntry.userId} - ${logEntry.resource}`);
    }
    
    return logEntry;
  }

  /**
   * Persist log to storage
   */
  persistLog(logEntry) {
    if (!store.auditLogs) {
      store.auditLogs = [];
    }
    store.auditLogs.push(logEntry);
    
    // Keep store logs trimmed
    if (store.auditLogs.length > this.maxLogs * 2) {
      store.auditLogs = store.auditLogs.slice(-this.maxLogs);
    }
  }

  /**
   * Get logs with filters
   */
  getLogs(filters = {}) {
    let filtered = [...this.logs];

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level.toUpperCase());
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action.includes(filters.action));
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.resource) {
      filtered = filtered.filter(log => log.resource === filters.resource);
    }

    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.message?.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.userId.toLowerCase().includes(search) ||
        log.resource.toLowerCase().includes(search)
      );
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
  }

  /**
   * Get log by ID
   */
  getLog(logId) {
    return this.logs.find(log => log.id === logId);
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId, limit = 100) {
    return this.getLogs({ userId, limit });
  }

  /**
   * Get logs by resource
   */
  getLogsByResource(resource, resourceId = null, limit = 100) {
    const filters = { resource };
    if (resourceId) {
      filters.resourceId = resourceId;
    }
    return this.getLogs(filters).slice(0, limit);
  }

  /**
   * Get logs by action
   */
  getLogsByAction(action, limit = 100) {
    return this.getLogs({ action }).slice(0, limit);
  }

  /**
   * Get logs by status
   */
  getLogsByStatus(status, limit = 100) {
    return this.getLogs({ status }).slice(0, limit);
  }

  /**
   * Get audit statistics
   */
  getAuditStats(filters = {}) {
    const logs = this.getLogs(filters);
    const total = logs.length;

    // Count by action
    const actionCounts = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    // Count by level
    const levelCounts = {};
    logs.forEach(log => {
      levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
    });

    // Count by status
    const statusCounts = {};
    logs.forEach(log => {
      statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
    });

    // Count by resource
    const resourceCounts = {};
    logs.forEach(log => {
      resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
    });

    // Count by user
    const userCounts = {};
    logs.forEach(log => {
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    // Get time range
    const timestamps = logs.map(log => new Date(log.timestamp).getTime());
    const minTime = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const maxTime = timestamps.length > 0 ? Math.max(...timestamps) : null;

    // Success rate
    const successCount = logs.filter(log => log.status === 'success').length;
    const failureCount = logs.filter(log => log.status === 'failed' || log.status === 'error').length;

    return {
      totalLogs: total,
      timeRange: {
        start: minTime ? new Date(minTime).toISOString() : null,
        end: maxTime ? new Date(maxTime).toISOString() : null
      },
      actionCounts: Object.entries(actionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([action, count]) => ({ action, count })),
      levelCounts,
      statusCounts: {
        ...statusCounts,
        successRate: total > 0 ? (successCount / total) * 100 : 0,
        failureRate: total > 0 ? (failureCount / total) * 100 : 0
      },
      resourceCounts: Object.entries(resourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([resource, count]) => ({ resource, count })),
      userCounts: Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([user, count]) => ({ user, count })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 50) {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level, limit = 100) {
    return this.getLogs({ level }).slice(0, limit);
  }

  /**
   * Get error logs
   */
  getErrorLogs(limit = 100) {
    return this.getLogsByLevel('ERROR', limit);
  }

  /**
   * Get warning logs
   */
  getWarningLogs(limit = 100) {
    return this.getLogsByLevel('WARN', limit);
  }

  /**
   * Clear old logs
   */
  clearOldLogs(days = this.logRetentionDays) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const beforeCount = this.logs.length;
    
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoff);
    
    if (store.auditLogs) {
      store.auditLogs = store.auditLogs.filter(log => new Date(log.timestamp) >= cutoff);
    }
    
    const removed = beforeCount - this.logs.length;
    console.log(`🧹 Removed ${removed} old logs (older than ${days} days)`);
    
    return { removed, remaining: this.logs.length };
  }

  /**
   * Start automatic cleanup job
   */
  startCleanupJob() {
    // Run cleanup daily
    setInterval(() => {
      this.clearOldLogs(this.logRetentionDays);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Set log level
   */
  setLogLevel(level) {
    const upperLevel = level.toUpperCase();
    if (this.logLevels[upperLevel] !== undefined) {
      this.currentLevel = this.logLevels[upperLevel];
      console.log(`📊 Log level set to: ${upperLevel}`);
      return true;
    }
    return false;
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    const levelValue = this.logLevels[level.toUpperCase()];
    return levelValue !== undefined && levelValue >= this.currentLevel;
  }

  /**
   * Export logs
   */
  exportLogs(filters = {}, format = 'json') {
    const logs = this.getLogs(filters);
    
    if (format === 'csv') {
      return this.convertToCSV(logs);
    }
    
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Convert logs to CSV
   */
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['id', 'timestamp', 'level', 'action', 'userId', 'resource', 'resourceId', 'status', 'message'];
    let csv = headers.join(',') + '\n';
    
    logs.forEach(log => {
      const row = headers.map(header => {
        let value = log[header] || '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      });
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Get audit dashboard data
   */
  getAuditDashboard() {
    const stats = this.getAuditStats();
    const recent = this.getRecentLogs(20);
    const errors = this.getErrorLogs(10);
    const warnings = this.getWarningLogs(10);

    return {
      stats,
      recent,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AuditLoggingService;