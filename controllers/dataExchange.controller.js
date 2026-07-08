const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const store = require('../data/store');
const { apiCache } = require('../middleware/lruCache');
const fs = require('fs');

// Simple logger for auditing
const logOperation = (operation, details) => {
  const logEntry = `[${new Date().toISOString()}] ${operation}: ${JSON.stringify(details)}\n`;
  console.log(logEntry.trim());
  // In a real app we might write this to a file or db
};

const exportData = (req, res, next) => {
  try {
    const { format, type, category, location, startDate, endDate } = req.query;

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

    // Filter by type if provided (e.g. 'story', 'visual', 'audio')
    if (type) {
      data = data.filter((item) => item.type === type);
    }

    // Filter by category (using tags or similar logic, assumed to be tags array)
    if (category) {
      data = data.filter((item) => item.tags && item.tags.includes(category));
    }

    // Filter by location
    if (location) {
      data = data.filter(
        (item) =>
          item.location &&
          item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by date range (timestamp)
    if (startDate) {
      data = data.filter(
        (item) => new Date(item.timestamp) >= new Date(startDate)
      );
    }
    if (endDate) {
      data = data.filter(
        (item) => new Date(item.timestamp) <= new Date(endDate)
      );
    }

    logOperation('EXPORT', {
      format,
      records: data.length,
      filters: req.query,
    });

    if (format === 'csv') {
      const csvData = stringify(data, {
        header: true,
        columns: ['id', 'title', 'type', 'location', 'description', 'timestamp']
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="parampara-export.csv"');
      return res.send(csvData);
    } else {
      const jsonExport = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalRecords: data.length,
          filtersApplied: { format, type, category, location, startDate, endDate }
        },
        data: data
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="parampara-export.json"');
      return res.send(JSON.stringify(jsonExport, null, 2));
    }
  } catch (error) {
    next(error);
  }
};

const importData = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf8');
    let records;
    try {
      records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
      });
    } catch (parseErr) {
      return res
        .status(400)
        .json({ error: 'Invalid CSV format', details: parseErr.message });
    }

    const summary = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    records.forEach((record, index) => {
      const rowNum = index + 1;
      // Validation
      if (!record.title || !record.type || !record.location) {
        summary.failed++;
        summary.errors.push({
          row: rowNum,
          message: 'Missing required fields (title, type, location)',
        });
        return;
      }

      // Check for duplicates based on title and location
      const duplicate = store.culturalItems.find(
        (item) =>
          item.title === record.title && item.location === record.location
      );

      if (duplicate) {
        summary.failed++;
        summary.errors.push({
          row: rowNum,
          message: 'Duplicate record exists',
        });
        return;
      }

      const newItem = {
        id:
          record.id ||
          `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: record.title,
        type: record.type,
        location: record.location,
        description: record.description || '',
        timestamp: record.timestamp || new Date().toISOString(),
        tags: record.tags ? record.tags.split(',').map((t) => t.trim()) : [],
        coordinates:
          record.lat && record.lng
            ? [parseFloat(record.lat), parseFloat(record.lng)]
            : null,
      };

      store.culturalItems.push(newItem);
      if (store.culturalItemsQuadTree && typeof store.culturalItemsQuadTree.insert === 'function' && newItem.coordinates) {
        store.culturalItemsQuadTree.insert(newItem);
      }
      summary.successful++;
    });

    logOperation('IMPORT', { summary });

    // Invalidate caches after bulk import
    if (summary.successful > 0) {
      if (apiCache && typeof apiCache.invalidateByPrefix === 'function') {
        apiCache.invalidateByPrefix('/api/items');
        apiCache.invalidateByPrefix('/api/search');
      }
    }

    res.json({
      message: 'Import processed',
      summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportData,
  importData,
};
