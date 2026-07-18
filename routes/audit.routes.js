// routes/audit.routes.js
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');

// ==================== GET ROUTES ====================

/**
 * GET /api/audit/
 * GET /api/audit/logs
 * Get audit logs with filters
 */
router.get('/', auditController.getAuditLogs);
router.get('/logs', auditController.getAuditLogs);

/**
 * GET /api/audit/log/:logId
 * Get log by ID
 */
router.get('/log/:logId', auditController.getLogById);

/**
 * GET /api/audit/user/:userId
 * Get logs by user
 */
router.get('/user/:userId', auditController.getLogsByUser);

/**
 * GET /api/audit/resource/:resource
 * Get logs by resource
 */
router.get('/resource/:resource', auditController.getLogsByResource);

/**
 * GET /api/audit/stats
 * Get audit statistics
 */
router.get('/stats', auditController.getAuditStats);

/**
 * GET /api/audit/dashboard
 * Get audit dashboard data
 */
router.get('/dashboard', auditController.getAuditDashboard);

/**
 * GET /api/audit/recent
 * Get recent logs
 */
router.get('/recent', auditController.getRecentLogs);

/**
 * GET /api/audit/errors
 * Get error logs
 */
router.get('/errors', auditController.getErrorLogs);

/**
 * GET /api/audit/export
 * Export logs (JSON or CSV)
 */
router.get('/export', auditController.exportLogs);

/**
 * GET /api/audit/config
 * Get audit configuration
 */
router.get('/config', auditController.getAuditConfig);

// ==================== POST ROUTES ====================

/**
 * POST /api/audit/clear
 * Clear old logs
 */
router.post('/clear', auditController.clearOldLogs);

/**
 * POST /api/audit/log
 * Log custom event
 */
router.post('/log', auditController.logCustomEvent);

// ==================== PUT ROUTES ====================

/**
 * PUT /api/audit/config
 * Update audit configuration
 */
router.put('/config', auditController.updateAuditConfig);

module.exports = router;