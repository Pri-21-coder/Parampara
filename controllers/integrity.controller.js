const store = require('../data/store');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
const VALID_TYPES = ['security', 'performance', 'data', 'system', 'compliance'];
const VALID_STATUSES = ['open', 'in_progress', 'fixed', 'ignored', 'closed'];

const MAX_REPORTS = 50;
const MAX_ISSUES_PER_REPORT = 200;
const MAX_ISSUES_PER_SCAN = 100;
const MAX_REPORT_HISTORY = 100;

function validateSeverity(severity) {
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    throw new Error(`Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`);
  }
  return severity || 'medium';
}

function validateType(type) {
  if (type && !VALID_TYPES.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }
  return type || 'system';
}

function validateStatus(status) {
  if (status && !VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return status || 'open';
}

function validatePagination(page, limit) {
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

function validateDateRange(startDate, endDate) {
  if (startDate && isNaN(new Date(startDate).getTime())) {
    throw new Error('Invalid start date format');
  }
  if (endDate && isNaN(new Date(endDate).getTime())) {
    throw new Error('Invalid end date format');
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date must be before end date');
  }
  return { startDate: startDate || null, endDate: endDate || null };
}

function validateUserId(userId) {
  if (userId && typeof userId !== 'string') {
    throw new Error('User ID must be a string');
  }
  return userId || null;
}

function sanitizeString(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '');
}

function createDefaultIntegrityData() {
  return {
    issues: [],
    reports: [],
    scans: [],
    settings: {
      autoScanEnabled: true,
      scanInterval: 'daily',
      notifyOnCritical: true,
      maxIssuesPerReport: MAX_ISSUES_PER_REPORT
    },
    lastUpdated: new Date().toISOString()
  };
}

function generateIssueId() {
  return `ISS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function generateReportId() {
  return `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

const integrityController = {
  getIssues: (req, res) => {
    try {
      const { page, limit, offset } = validatePagination(req.query.page, req.query.limit);
      const severity = req.query.severity;
      const type = req.query.type;
      const status = req.query.status;
      const search = req.query.search;

      if (severity) validateSeverity(severity);
      if (type) validateType(type);
      if (status) validateStatus(status);

      let issues = store.integrityIssues || [];

      if (severity) {
        issues = issues.filter(i => i.severity === severity);
      }
      if (type) {
        issues = issues.filter(i => i.type === type);
      }
      if (status) {
        issues = issues.filter(i => i.status === status);
      }
      if (search) {
        const searchTerm = search.toLowerCase();
        issues = issues.filter(i =>
          i.title.toLowerCase().includes(searchTerm) ||
          i.description.toLowerCase().includes(searchTerm)
        );
      }

      const total = issues.length;
      const paginated = issues.slice(offset, offset + limit);

      res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting issues:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get issues'
      });
    }
  },

  getIssue: (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Issue ID is required'
        });
      }

      const issues = store.integrityIssues || [];
      const issue = issues.find(i => i.id === id);

      if (!issue) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }

      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      logger.error('Error getting issue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get issue'
      });
    }
  },

  createIssue: (req, res) => {
    try {
      const { title, description, severity, type, source } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      if (title.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'Title must be less than 200 characters'
        });
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Description is required'
        });
      }

      const validSeverity = validateSeverity(severity);
      const validType = validateType(type);

      const newIssue = {
        id: generateIssueId(),
        title: sanitizeString(title),
        description: sanitizeString(description),
        severity: validSeverity,
        type: validType,
        status: 'open',
        source: source || 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        resolution: null,
        assignedTo: null,
        comments: []
      };

      if (!store.integrityIssues) {
        store.integrityIssues = [];
      }

      store.integrityIssues.push(newIssue);

      logger.info(`Integrity issue created: ${newIssue.id}`);

      res.status(201).json({
        success: true,
        message: 'Issue created successfully',
        data: newIssue
      });
    } catch (error) {
      logger.error('Error creating issue:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create issue'
      });
    }
  },

  updateIssue: (req, res) => {
    try {
      const { id } = req.params;
      const { status, resolution, assignedTo, comments } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Issue ID is required'
        });
      }

      const issues = store.integrityIssues || [];
      const index = issues.findIndex(i => i.id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }

      const issue = issues[index];

      if (status) {
        validateStatus(status);
        issue.status = status;
        if (status === 'fixed' || status === 'closed') {
          issue.resolvedAt = new Date().toISOString();
        }
      }

      if (resolution) {
        issue.resolution = sanitizeString(resolution);
      }

      if (assignedTo) {
        issue.assignedTo = sanitizeString(assignedTo);
      }

      if (comments) {
        issue.comments.push({
          id: uuidv4(),
          text: sanitizeString(comments),
          createdAt: new Date().toISOString()
        });
      }

      issue.updatedAt = new Date().toISOString();
      store.integrityIssues[index] = issue;

      logger.info(`Integrity issue updated: ${issue.id}`);

      res.json({
        success: true,
        message: 'Issue updated successfully',
        data: issue
      });
    } catch (error) {
      logger.error('Error updating issue:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update issue'
      });
    }
  },

  deleteIssue: (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Issue ID is required'
        });
      }

      const issues = store.integrityIssues || [];
      const index = issues.findIndex(i => i.id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }

      issues.splice(index, 1);
      store.integrityIssues = issues;

      logger.info(`Integrity issue deleted: ${id}`);

      res.json({
        success: true,
        message: 'Issue deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting issue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete issue'
      });
    }
  },

  fixIssue: (req, res) => {
    try {
      const { id } = req.params;
      const { resolution } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Issue ID is required'
        });
      }

      const issues = store.integrityIssues || [];
      const index = issues.findIndex(i => i.id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }

      const issue = issues[index];
      issue.status = 'fixed';
      issue.resolvedAt = new Date().toISOString();
      if (resolution) {
        issue.resolution = sanitizeString(resolution);
      }
      issue.updatedAt = new Date().toISOString();
      store.integrityIssues[index] = issue;

      logger.info(`Integrity issue fixed: ${issue.id}`);

      res.json({
        success: true,
        message: 'Issue marked as fixed',
        data: issue
      });
    } catch (error) {
      logger.error('Error fixing issue:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fix issue'
      });
    }
  },

  ignoreIssue: (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Issue ID is required'
        });
      }

      const issues = store.integrityIssues || [];
      const index = issues.findIndex(i => i.id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
      }

      const issue = issues[index];
      issue.status = 'ignored';
      issue.ignoredReason = reason ? sanitizeString(reason) : 'No reason provided';
      issue.ignoredAt = new Date().toISOString();
      issue.updatedAt = new Date().toISOString();
      store.integrityIssues[index] = issue;

      logger.info(`Integrity issue ignored: ${issue.id}`);

      res.json({
        success: true,
        message: 'Issue ignored',
        data: issue
      });
    } catch (error) {
      logger.error('Error ignoring issue:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to ignore issue'
      });
    }
  },

  getStats: (req, res) => {
    try {
      const issues = store.integrityIssues || [];

      const stats = {
        total: issues.length,
        bySeverity: {
          critical: issues.filter(i => i.severity === 'critical').length,
          high: issues.filter(i => i.severity === 'high').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          low: issues.filter(i => i.severity === 'low').length,
          info: issues.filter(i => i.severity === 'info').length
        },
        byStatus: {
          open: issues.filter(i => i.status === 'open').length,
          in_progress: issues.filter(i => i.status === 'in_progress').length,
          fixed: issues.filter(i => i.status === 'fixed').length,
          ignored: issues.filter(i => i.status === 'ignored').length,
          closed: issues.filter(i => i.status === 'closed').length
        },
        byType: {
          security: issues.filter(i => i.type === 'security').length,
          performance: issues.filter(i => i.type === 'performance').length,
          data: issues.filter(i => i.type === 'data').length,
          system: issues.filter(i => i.type === 'system').length,
          compliance: issues.filter(i => i.type === 'compliance').length
        },
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics'
      });
    }
  },

  runScan: (req, res) => {
    try {
      const { type, target } = req.body;
      const validType = validateType(type);

      const scanId = uuidv4();
      const scan = {
        id: scanId,
        type: validType,
        target: target || 'system',
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        issuesFound: 0,
        issues: []
      };

      const mockIssues = [
        {
          id: generateIssueId(),
          title: 'Unpatched security vulnerability detected',
          description: 'A known security vulnerability was detected in the system. Please update the affected components.',
          severity: 'high',
          type: 'security',
          status: 'open',
          source: 'scan',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: generateIssueId(),
          title: 'Database performance degradation detected',
          description: 'Slow query performance detected. Consider optimizing indexes.',
          severity: 'medium',
          type: 'performance',
          status: 'open',
          source: 'scan',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      scan.issues = mockIssues;
      scan.issuesFound = mockIssues.length;

      if (!store.integrityIssues) {
        store.integrityIssues = [];
      }
      store.integrityIssues.push(...mockIssues);

      if (!store.integrityScans) {
        store.integrityScans = [];
      }
      store.integrityScans.push(scan);

      logger.info(`Integrity scan completed: ${scanId}, found ${scan.issuesFound} issues`);

      res.status(201).json({
        success: true,
        message: 'Scan completed successfully',
        data: scan
      });
    } catch (error) {
      logger.error('Error running scan:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to run scan'
      });
    }
  },

  getScans: (req, res) => {
    try {
      const { page, limit, offset } = validatePagination(req.query.page, req.query.limit);

      const scans = store.integrityScans || [];
      const total = scans.length;
      const paginated = scans.slice(offset, offset + limit);

      res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting scans:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scans'
      });
    }
  },

  getScan: (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Scan ID is required'
        });
      }

      const scans = store.integrityScans || [];
      const scan = scans.find(s => s.id === id);

      if (!scan) {
        return res.status(404).json({
          success: false,
          error: 'Scan not found'
        });
      }

      res.json({
        success: true,
        data: scan
      });
    } catch (error) {
      logger.error('Error getting scan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scan'
      });
    }
  },

  getReports: (req, res) => {
    try {
      const { page, limit, offset } = validatePagination(req.query.page, req.query.limit);

      const reports = store.integrityReports || [];
      const total = reports.length;
      const paginated = reports.slice(offset, offset + limit);

      res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting reports:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reports'
      });
    }
  },

  generateReport: (req, res) => {
    try {
      const { format = 'json', includeResolved = false } = req.body;

      const issues = store.integrityIssues || [];
      const filteredIssues = includeResolved ? issues : issues.filter(i => i.status !== 'fixed' && i.status !== 'closed');

      const report = {
        id: generateReportId(),
        generatedAt: new Date().toISOString(),
        format,
        summary: {
          totalIssues: issues.length,
          openIssues: issues.filter(i => i.status === 'open').length,
          inProgress: issues.filter(i => i.status === 'in_progress').length,
          fixed: issues.filter(i => i.status === 'fixed').length,
          ignored: issues.filter(i => i.status === 'ignored').length,
          closed: issues.filter(i => i.status === 'closed').length,
          bySeverity: {
            critical: issues.filter(i => i.severity === 'critical').length,
            high: issues.filter(i => i.severity === 'high').length,
            medium: issues.filter(i => i.severity === 'medium').length,
            low: issues.filter(i => i.severity === 'low').length,
            info: issues.filter(i => i.severity === 'info').length
          }
        },
        issues: filteredIssues
      };

      if (!store.integrityReports) {
        store.integrityReports = [];
      }
      store.integrityReports.push(report);

      if (store.integrityReports.length > MAX_REPORTS) {
        store.integrityReports = store.integrityReports.slice(-MAX_REPORTS);
      }

      logger.info(`Integrity report generated: ${report.id}`);

      res.status(201).json({
        success: true,
        message: 'Report generated successfully',
        data: report
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate report'
      });
    }
  },

  getReport: (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Report ID is required'
        });
      }

      const reports = store.integrityReports || [];
      const report = reports.find(r => r.id === id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error getting report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get report'
      });
    }
  },

  exportReport: (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;

      const reports = store.integrityReports || [];
      const report = reports.find(r => r.id === id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      let contentType = 'application/json';
      let content = JSON.stringify(report, null, 2);

      if (format === 'csv') {
        contentType = 'text/csv';
        const headers = 'ID,Title,Severity,Type,Status,Created At\n';
        const rows = (report.issues || []).map(i =>
          `${i.id},${i.title},${i.severity},${i.type},${i.status},${i.createdAt}`
        ).join('\n');
        content = headers + rows;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=integrity-report-${id}.${format}`);

      res.send(content);
    } catch (error) {
      logger.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export report'
      });
    }
  },

  clearAll: (req, res) => {
    try {
      store.integrityIssues = [];
      store.integrityScans = [];
      store.integrityReports = [];

      logger.info('All integrity data cleared');

      res.json({
        success: true,
        message: 'All integrity data cleared successfully'
      });
    } catch (error) {
      logger.error('Error clearing integrity data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear integrity data'
      });
    }
  }
};

module.exports = integrityController;