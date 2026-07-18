// routes/job.routes.js
const express = require('express');
const router = express.Router();
const JobProcessorService = require('../services/jobProcessorService');

let jobService = null;

const getService = () => {
  if (!jobService) {
    jobService = new JobProcessorService();
  }
  return jobService;
};

/**
 * POST /api/jobs
 * Create a new job
 */
router.post('/', (req, res, next) => {
  try {
    const { type, data, options } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, data'
      });
    }

    const service = getService();
    const job = service.addJob(type, data, options);

    res.json({
      success: true,
      job,
      message: 'Job added to queue',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/jobs
 * Get all jobs with filters
 */
router.get('/', (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      priority: req.query.priority,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const service = getService();
    const jobs = service.getJobs(filters);

    res.json({
      success: true,
      jobs,
      count: jobs.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/jobs/:jobId
 * Get job by ID
 */
router.get('/:jobId', (req, res, next) => {
  try {
    const { jobId } = req.params;
    const service = getService();
    const job = service.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/jobs/:jobId/cancel
 * Cancel a job
 */
router.post('/:jobId/cancel', (req, res, next) => {
  try {
    const { jobId } = req.params;
    const service = getService();
    const job = service.cancelJob(jobId);

    res.json({
      success: true,
      job,
      message: 'Job cancelled successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/jobs/:jobId/retry
 * Retry a failed job
 */
router.post('/:jobId/retry', (req, res, next) => {
  try {
    const { jobId } = req.params;
    const service = getService();
    const job = service.retryJob(jobId);

    res.json({
      success: true,
      job,
      message: 'Job retried successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/jobs/stats
 * Get job statistics
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