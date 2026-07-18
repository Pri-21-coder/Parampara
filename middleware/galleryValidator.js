/**
 * Middleware to validate query parameters for the gallery API.
 */
const galleryConfig = require('../config/gallery.config');

// ============================================
// DESTRUCTURE CONFIGURATION
// ============================================

const { PAGINATION, GALLERY } = galleryConfig;

/**
 * Middleware to validate gallery query parameters
 */
const validateGalleryQuery = (req, res, next) => {
  const { page, limit, search, craft, state, tag, sort, type, year } =
    req.query;

  // 1. Page validation
  if (page !== undefined) {
    const pageNum = Number(page);
    if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Page must be greater than 0',
      });
    }
  }

  // 2. Limit validation using config
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (
      isNaN(limitNum) ||
      !Number.isInteger(limitNum) ||
      limitNum <= 0 ||
      limitNum > PAGINATION.MAX_LIMIT
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid limit. Must be between 1 and ${PAGINATION.MAX_LIMIT}`,
      });
    }
  }

  // 3. Sort validation using config
  if (sort !== undefined) {
    const allowedSorts = GALLERY.ALLOWED_SORT_OPTIONS;
    if (!allowedSorts.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort parameter. Allowed values: ${allowedSorts.join(', ')}`,
      });
    }
  }

  // 4. Type validation using config
  if (type !== undefined) {
    const allowedTypes = GALLERY.ALLOWED_FILTERS.TYPES;
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type parameter. Allowed values: ${allowedTypes.join(', ')}`,
      });
    }
  }

  // 5. Search, craft, state, tag, year validation (must be strings if present)
  const stringParams = { search, craft, state, tag, year };
  for (const [name, val] of Object.entries(stringParams)) {
    if (val !== undefined && typeof val !== 'string') {
      return res.status(400).json({
        success: false,
        message: `${name} must be a string`,
      });
    }
  }

  // 6. Sanitize search to prevent XSS
  if (search !== undefined && typeof search === 'string') {
    const sanitized = search.trim().replace(/[<>{}]/g, '');
    if (sanitized !== search) {
      // Optionally add warning or modify query
      req.sanitizedSearch = sanitized;
    }
  }

  // 7. Validate year (must be 4 digits and within reasonable range)
  if (year !== undefined) {
    const yearNum = Number(year);
    if (isNaN(yearNum) || !Number.isInteger(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      return res.status(400).json({
        success: false,
        message: `Invalid year. Must be between 1900 and ${new Date().getFullYear()}`,
      });
    }
  }

  // 8. Add validation metadata to request for downstream use
  req.galleryQuery = {
    page: page ? Number(page) : PAGINATION.DEFAULT_PAGE,
    limit: limit ? Number(limit) : PAGINATION.DEFAULT_LIMIT,
    sort: sort || 'latest',
    search: search ? search.trim() : null,
    craft: craft || null,
    state: state || null,
    tag: tag || null,
    type: type || null,
    year: year || null
  };

  next();
};

module.exports = validateGalleryQuery;