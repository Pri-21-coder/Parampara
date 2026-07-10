const integrityService = require('../services/integrityService');

const getReport = (req, res, next) => {
  try {
    const report = integrityService.getReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
};

const getIssues = (req, res, next) => {
  try {
    const { severity } = req.query;
    const issues = integrityService.getIssues(severity);
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

const getSummary = (req, res, next) => {
  try {
    const summary = integrityService.getSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

const runScan = (req, res, next) => {
  try {
    const incremental = req.query.type === 'incremental';
    const report = integrityService.scanAll(incremental);
    res.status(200).json({
      message: 'Integrity scan completed successfully',
      summary: report.summary,
      issuesFound: report.issues.length
    });
  } catch (err) {
    next(err);
  }
};

const getHistory = (req, res, next) => {
  try {
    const history = integrityService.getHistory();
    res.json(history);
  } catch (err) {
    next(err);
  }
};

const getAnalytics = (req, res, next) => {
  try {
    const analytics = integrityService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReport,
  getIssues,
  getSummary,
  runScan,
  getHistory,
  getAnalytics
};
