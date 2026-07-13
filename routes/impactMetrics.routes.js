// routes/impactMetrics.routes.js
const express = require('express');
const router = express.Router();
const ImpactMetricsService = require('../services/impactMetricsService');

let metricsService = null;

const getService = () => {
  if (!metricsService) {
    metricsService = new ImpactMetricsService();
  }
  return metricsService;
};

/**
 * GET /api/impact/metrics
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
 * PUT /api/impact/metrics
 * Update metrics
 */
router.put('/metrics', (req, res, next) => {
  try {
    const metricData = req.body;
    const service = getService();
    const metrics = service.updateMetrics(metricData);

    res.json({
      success: true,
      metrics,
      message: 'Metrics updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/impact/calculate
 * Calculate impact
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { data } = req.body;
    const service = getService();
    const impact = await service.calculateImpact(data);

    res.json({
      success: true,
      impact,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/impact/history
 * Get impact history
 */
router.get('/history', (req, res, next) => {
  try {
    const { limit } = req.query;
    const service = getService();
    const history = service.getImpactHistory(limit ? parseInt(limit) : 10);

    res.json({
      success: true,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/impact/report/generate
 * Generate report
 */
router.post('/report/generate', async (req, res, next) => {
  try {
    const { type, filters } = req.body;
    const service = getService();
    const report = await service.generateReport(type || 'full', filters);

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
 * GET /api/impact/reports
 * Get reports
 */
router.get('/reports', (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const service = getService();
    const reports = service.getReports(filters);

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
 * GET /api/impact/report/:reportId
 * Get report by ID
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
 * GET /api/impact/indicators
 * Get indicators
 */
router.get('/indicators', (req, res, next) => {
  try {
    const service = getService();
    const indicators = service.getIndicators();

    res.json({
      success: true,
      indicators,
      count: indicators.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/impact/benchmarks
 * Get benchmarks
 */
router.get('/benchmarks', (req, res, next) => {
  try {
    const service = getService();
    const benchmarks = service.getBenchmarks();

    res.json({
      success: true,
      benchmarks,
      count: benchmarks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/impact/goals
 * Get goals
 */
router.get('/goals', (req, res, next) => {
  try {
    const { status } = req.query;
    const service = getService();
    const goals = service.getGoals(status);

    res.json({
      success: true,
      goals,
      count: goals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/impact/goal
 * Create goal
 */
router.post('/goal', (req, res, next) => {
  try {
    const goalData = req.body;
    const service = getService();
    const goal = service.createGoal(goalData);

    res.json({
      success: true,
      goal,
      message: 'Goal created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/impact/goal/:goalId
 * Update goal
 */
router.put('/goal/:goalId', (req, res, next) => {
  try {
    const { goalId } = req.params;
    const updates = req.body;
    const service = getService();
    const goal = service.updateGoal(goalId, updates);

    res.json({
      success: true,
      goal,
      message: 'Goal updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/impact/export
 * Export data
 */
router.get('/export', (req, res, next) => {
  try {
    const { format } = req.query;
    const service = getService();
    const data = service.exportData(format || 'json');

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=impact_data.csv');
      return res.send(data);
    }

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/impact/stats
 * Get statistics
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