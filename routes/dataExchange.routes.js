const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  exportData,
  importData,
} = require('../controllers/dataExchange.controller');

/**
 * Configure Multer memory storage with file type filtering and limits.
 * Restricts uploads to valid CSV (.csv) or JSON (.json) files, with a 2MB max size.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB Limit
  },
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    const isJson = file.mimetype === 'application/json' || file.originalname.endsWith('.json');
    
    if (isCsv || isJson) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Only CSV (.csv) and JSON (.json) files are permitted.'));
    }
  }
});

/**
 * Custom middleware to handle Multer upload errors gracefully.
 * Prevents raw unhandled multer exceptions from crashing the request stack.
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size limit exceeded',
        details: 'The uploaded file exceeds the maximum permitted size of 2MB.'
      });
    }
    return res.status(400).json({ error: 'Upload process error', details: err.message });
  } else if (err) {
    return res.status(400).json({ error: 'File validation error', details: err.message });
  }
  next();
};

/**
 * @openapi
 * /api/data-exchange/export:
 *   get:
 *     summary: Export cultural archive data
 *     description: Retrieve records in CSV or JSON format with optional query filters.
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         description: Format of the exported data file.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter records by cultural item type.
 *     responses:
 *       200:
 *         description: File export stream.
 */
router.get('/export', exportData);

/**
 * @openapi
 * /api/data-exchange/import:
 *   post:
 *     summary: Import cultural archive data
 *     description: Bulk import records using a CSV or JSON file.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import completion summary.
 */
router.post(
  '/import',
  upload.single('file'),
  handleUploadError,
  importData
);

module.exports = router;
