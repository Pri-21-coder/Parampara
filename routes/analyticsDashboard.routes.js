// routes/analyticsDashboard.routes.js
const express = require('express');
const router = express.Router();
const AnalyticsDashboardService = require('../server/services/analyticsDashboardService');

let dashboardService = null;

const getService = () => {
  if (!dashboardService) {
    dashboardService = new AnalyticsDashboardService();
  }
  return dashboardService;
};

/**
 * GET /api/analytics/dashboard
 * Get dashboard
 */
router.get('/dashboard', (req, res, next) => {
  try {
    const { dashboardId } = req.query;
    const service = getService();
    const dashboard = service.getDashboard(dashboardId);

    res.json({
      success: true,
      dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/dashboards
 * Get all dashboards
 */
router.get('/dashboards', (req, res, next) => {
  try {
    const service = getService();
    const dashboards = service.getAllDashboards();

    res.json({
      success: true,
      dashboards,
      count: dashboards.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/dashboard
 * Create custom dashboard
 */
router.post('/dashboard', (req, res, next) => {
  try {
    const dashboardData = req.body;
    const service = getService();
    const dashboard = service.createDashboard(dashboardData);

    res.json({
      success: true,
      dashboard,
      message: 'Dashboard created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/metrics
 * Get metrics
 */
router.get('/metrics', (req, res, next) => {
  try {
    const service = getService();
    const metrics = service.getMetrics();

    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/trends
 * Get trends
 */
router.get('/trends', (req, res, next) => {
  try {
    const { period } = req.query;
    const service = getService();
    const trends = service.getTrends(period);

    res.json({
      success: true,
      trends,
      count: trends.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/data-points
 * Get data points
 */
router.get('/data-points', (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      region: req.query.region,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const service = getService();
    const dataPoints = service.getDataPoints(filters);

    res.json({
      success: true,
      dataPoints,
      count: dataPoints.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/report/generate
 * Generate report
 */
router.post('/report/generate', (req, res, next) => {
  try {
    const { reportType, filters } = req.body;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: reportType'
      });
    }

    const service = getService();
    const report = service.generateReport(reportType, filters);

    res.json({
      success: true,
      report,
      message: 'Report generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/report/:reportId
 * Get report
 */
router.get('/report/:reportId', (req, res, next) => {
  try {
    const { reportId } = req.params;
    const service = getService();
    const report = service.getReport(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/reports
 * Get all reports
 */
router.get('/reports', (req, res, next) => {
  try {
    const service = getService();
    const reports = service.getAllReports();

    res.json({
      success: true,
      reports,
      count: reports.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/report/:reportId/export
 * Export report as CSV
 */
router.get('/report/:reportId/export', (req, res, next) => {
  try {
    const { reportId } = req.params;
    const service = getService();
    const csv = service.exportReportCSV(reportId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${reportId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/stats
 * Get analytics statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
