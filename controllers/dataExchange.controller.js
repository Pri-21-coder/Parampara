// controllers/dataExchange.controller.js
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const store = require('../data/store');
const { apiCache } = require('../middleware/lruCache');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ============================================
// CONSTANTS
// ============================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_RECORDS = 10000;
const BATCH_SIZE = 100;
const ALLOWED_EXTENSIONS = ['.json', '.csv'];
const ALLOWED_MIME_TYPES = ['application/json', 'text/csv', 'text/plain'];

const REQUIRED_FIELDS = ['title', 'type', 'location'];
const ALLOWED_TYPES = ['story', 'visual', 'audio', 'documentary'];
const MAX_TITLE_LENGTH = 255;
const MAX_LOCATION_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

// ============================================
// LOGGER
// ============================================

const logOperation = (operation, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    details,
    pid: process.pid
  };
  console.log(JSON.stringify(logEntry));
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate file
 */
function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file uploaded');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`File extension must be one of: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push(`File type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate record schema
 */
function validateRecord(record, index) {
  const errors = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!record[field] || typeof record[field] !== 'string' || record[field].trim().length === 0) {
      errors.push(`Row ${index + 1}: Missing required field '${field}'`);
    }
  }

  // Validate title length
  if (record.title && record.title.length > MAX_TITLE_LENGTH) {
    errors.push(`Row ${index + 1}: Title exceeds ${MAX_TITLE_LENGTH} characters`);
  }

  // Validate type
  if (record.type && !ALLOWED_TYPES.includes(record.type)) {
    errors.push(`Row ${index + 1}: Invalid type '${record.type}'. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Validate location length
  if (record.location && record.location.length > MAX_LOCATION_LENGTH) {
    errors.push(`Row ${index + 1}: Location exceeds ${MAX_LOCATION_LENGTH} characters`);
  }

  // Validate description length
  if (record.description && record.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Row ${index + 1}: Description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  // Validate tags
  if (record.tags) {
    if (Array.isArray(record.tags)) {
      for (const tag of record.tags) {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push(`Row ${index + 1}: Invalid tag format`);
          break;
        }
      }
    } else if (typeof record.tags !== 'string') {
      errors.push(`Row ${index + 1}: Tags must be a string or array`);
    }
  }

  // Validate coordinates
  if (record.coordinates) {
    if (!Array.isArray(record.coordinates) || record.coordinates.length !== 2) {
      errors.push(`Row ${index + 1}: Coordinates must be an array of [lat, lng]`);
    } else {
      const lat = parseFloat(record.coordinates[0]);
      const lng = parseFloat(record.coordinates[1]);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push(`Row ${index + 1}: Invalid latitude (must be -90 to 90)`);
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push(`Row ${index + 1}: Invalid longitude (must be -180 to 180)`);
      }
    }
  }

  // Validate date
  if (record.timestamp) {
    const date = new Date(record.timestamp);
    if (isNaN(date.getTime())) {
      errors.push(`Row ${index + 1}: Invalid timestamp format (use ISO date)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check for duplicates
 */
function findDuplicate(record) {
  return store.culturalItems.find(
    (item) =>
      item.title === record.title &&
      item.location === record.location
  );
}

/**
 * Sanitize record
 */
function sanitizeRecord(record) {
  const sanitized = {};

  for (const field of REQUIRED_FIELDS) {
    if (record[field]) {
      sanitized[field] = record[field].trim().replace(/[<>{}]/g, '');
    }
  }

  if (record.description) {
    sanitized.description = record.description.trim().replace(/[<>{}]/g, '');
  }

  if (record.timestamp) {
    sanitized.timestamp = record.timestamp;
  }

  if (record.tags) {
    if (Array.isArray(record.tags)) {
      sanitized.tags = record.tags.map(t => String(t).trim()).filter(t => t.length > 0);
    } else if (typeof record.tags === 'string') {
      sanitized.tags = record.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
  }

  if (record.coordinates && Array.isArray(record.coordinates) && record.coordinates.length === 2) {
    sanitized.coordinates = [
      parseFloat(record.coordinates[0]),
      parseFloat(record.coordinates[1])
    ];
  } else if (record.lat && record.lng) {
    sanitized.coordinates = [
      parseFloat(record.lat),
      parseFloat(record.lng)
    ];
  }

  if (record.type && ALLOWED_TYPES.includes(record.type)) {
    sanitized.type = record.type;
  }

  return sanitized;
}

// ============================================
// MAIN CONTROLLER FUNCTIONS
// ============================================

/**
 * GET /api/data/export
 * Export data in JSON or CSV format
 */
const exportData = (req, res, next) => {
  try {
    const { format, type, category, location, startDate, endDate, limit } = req.query;

    // Validate format
    if (format && !['json', 'csv'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format',
        message: 'Format must be json or csv'
      });
    }

    // Get data
    let data = [];
    if (store.culturalItems) {
      if (typeof store.culturalItems.values === 'function') {
        data = store.culturalItems.values();
      } else if (Array.isArray(store.culturalItems)) {
        data = [...store.culturalItems];
      } else {
        data = Object.values(store.culturalItems);
      }
    }

    // Apply filters
    if (type) {
      data = data.filter((item) => item.type === type);
    }

    if (category) {
      data = data.filter((item) => item.tags && item.tags.includes(category));
    }

    if (location) {
      data = data.filter(
        (item) =>
          item.location &&
          item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startDate format'
        });
      }
      data = data.filter(
        (item) => new Date(item.timestamp) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid endDate format'
        });
      }
      data = data.filter(
        (item) => new Date(item.timestamp) <= end
      );
    }

    // Apply limit
    if (limit && !isNaN(parseInt(limit))) {
      data = data.slice(0, parseInt(limit));
    }

    // Check if data exists
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found matching the specified criteria'
      });
    }

    logOperation('EXPORT', {
      format: format || 'json',
      records: data.length,
      filters: req.query,
      ip: req.ip
    });

    const exportFileName = `parampara-export-${Date.now()}`;

    if (format === 'csv') {
      const csvData = stringify(data, {
        header: true,
        columns: ['id', 'title', 'type', 'location', 'description', 'timestamp', 'tags', 'coordinates']
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${exportFileName}.csv"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvData));
      return res.send(csvData);
    }

    // Default: JSON
    const jsonExport = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: data.length,
        filtersApplied: { format, type, category, location, startDate, endDate, limit },
        version: '1.0',
        exportedBy: req.user ? req.user.id : 'anonymous'
      },
      data: data
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${exportFileName}.json"`);
    return res.send(JSON.stringify(jsonExport, null, 2));

  } catch (error) {
    console.error('[DataExchange] Export error:', error);
    next(error);
  }
};

/**
 * POST /api/data/import
 * Import data from JSON or CSV file
 */
const importData = (req, res, next) => {
  try {
    // 1. Validate file
    const fileValidation = validateFile(req.file);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file',
        details: fileValidation.errors
      });
    }

    // 2. Parse file
    const fileContent = req.file.buffer.toString('utf8');
    const isJson = req.file.originalname.endsWith('.json') || req.file.mimetype === 'application/json';
    let records = [];

    try {
      if (isJson) {
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          records = parsed;
        } else if (parsed && Array.isArray(parsed.data)) {
          records = parsed.data;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON format',
            message: 'JSON must be an array or contain a "data" array'
          });
        }
      } else {
        records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          escape: '"'
        });
      }
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        error: 'Parse error',
        message: parseErr.message,
        type: isJson ? 'JSON' : 'CSV'
      });
    }

    // 3. Check record count
    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No records found',
        message: 'The imported file contains no valid records'
      });
    }

    if (records.length > MAX_RECORDS) {
      return res.status(400).json({
        success: false,
        error: 'Too many records',
        message: `Maximum ${MAX_RECORDS} records allowed, received ${records.length}`
      });
    }

    // 4. Validate records
    const validationResults = {
      valid: [],
      invalid: [],
      duplicates: [],
      total: records.length
    };

    const seen = new Set();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // Validate schema
      const schemaValidation = validateRecord(record, i);
      if (!schemaValidation.valid) {
        validationResults.invalid.push({
          row: i + 1,
          record,
          errors: schemaValidation.errors
        });
        continue;
      }

      // Check duplicate within import
      const key = `${record.title}|${record.location}`;
      if (seen.has(key)) {
        validationResults.duplicates.push({
          row: i + 1,
          record,
          message: 'Duplicate within import file'
        });
        continue;
      }
      seen.add(key);

      // Check duplicate in database
      const existing = findDuplicate(record);
      if (existing) {
        validationResults.duplicates.push({
          row: i + 1,
          record,
          message: 'Duplicate exists in database',
          existingId: existing.id
        });
        continue;
      }

      validationResults.valid.push(record);
    }

    // 5. Import valid records
    let imported = 0;
    const importErrors = [];

    for (const record of validationResults.valid) {
      try {
        const sanitized = sanitizeRecord(record);
        const newItem = {
          id: sanitized.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: sanitized.title,
          type: sanitized.type,
          location: sanitized.location,
          description: sanitized.description || '',
          timestamp: sanitized.timestamp || new Date().toISOString(),
          tags: sanitized.tags || [],
          coordinates: sanitized.coordinates || null,
          createdAt: new Date().toISOString()
        };

        store.culturalItems.push(newItem);

        if (store.culturalItemsQuadTree && typeof store.culturalItemsQuadTree.insert === 'function' && newItem.coordinates) {
          store.culturalItemsQuadTree.insert(newItem);
        }

        imported++;
      } catch (error) {
        importErrors.push({
          record: record.title || 'unknown',
          error: error.message
        });
      }
    }

    // 6. Log import
    logOperation('IMPORT', {
      total: records.length,
      valid: validationResults.valid.length,
      invalid: validationResults.invalid.length,
      duplicates: validationResults.duplicates.length,
      imported,
      errors: importErrors.length,
      ip: req.ip
    });

    // 7. Invalidate cache
    if (imported > 0) {
      if (apiCache && typeof apiCache.invalidateByPrefix === 'function') {
        apiCache.invalidateByPrefix('/api/items');
        apiCache.invalidateByPrefix('/api/search');
      }
    }

    // 8. Build response
    const response = {
      success: true,
      message: 'Import processed',
      summary: {
        total: records.length,
        valid: validationResults.valid.length,
        invalid: validationResults.invalid.length,
        duplicates: validationResults.duplicates.length,
        imported: imported
      }
    };

    if (validationResults.invalid.length > 0) {
      response.details = {
        invalidRecords: validationResults.invalid.slice(0, 10),
        duplicateRecords: validationResults.duplicates.slice(0, 10),
        importErrors: importErrors.slice(0, 10)
      };
      response.message = 'Import completed with some errors';
    }

    if (importErrors.length > 0) {
      response.warnings = importErrors;
    }

    res.json(response);

  } catch (error) {
    console.error('[DataExchange] Import error:', error);
    next(error);
  }
};

module.exports = {
  exportData,
  importData
};