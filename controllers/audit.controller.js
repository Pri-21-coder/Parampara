const store = require('../data/store');

const getAuditLogs = (req, res) => {
  try {
    let logs = Array.from(store.auditLog.values());

    const { type, resource, limit = 50, page = 1 } = req.query;

    if (type) {
      logs = logs.filter((log) => log.eventType === type.toUpperCase());
    }

    if (resource) {
      logs = logs.filter((log) => log.resource === resource);
    }

    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const totalItems = logs.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;

    const paginatedLogs = logs.slice(startIndex, startIndex + limitNum);

    res.json({
      data: paginatedLogs,
      meta: {
        currentPage: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Error fetching audit logs' });
  }
};

module.exports = {
  getAuditLogs,
};