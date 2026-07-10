const express = require('express');
const router = express.Router();
const integrityController = require('../controllers/integrity.controller');

// GET /api/integrity/report - Get the full integrity report
router.get('/report', integrityController.getReport);

// GET /api/integrity/issues - Get only the list of issues (optional ?severity=HIGH filter)
router.get('/issues', integrityController.getIssues);

// GET /api/integrity/summary - Get summary statistics of the last scan
router.get('/summary', integrityController.getSummary);

// GET /api/integrity/history - Get the historical summaries of past scans
router.get('/history', integrityController.getHistory);

// GET /api/integrity/analytics - Get scan trend analytics
router.get('/analytics', integrityController.getAnalytics);

// POST /api/integrity/scan - Trigger a new integrity scan (optional ?type=incremental)
router.post('/scan', integrityController.runScan);

module.exports = router;
