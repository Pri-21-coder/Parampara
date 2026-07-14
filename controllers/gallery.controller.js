const store = require('../data/store');
const { cache, generateKey, clearByPattern, getStats } = require('../utils/cache');
const galleryConfig = require('../config/gallery.config');

// ============================================
// DESTRUCTURE CONFIGURATION
// ============================================

const { PAGINATION, GALLERY } = galleryConfig;

// ============================================
// HELPER FUNCTIONS
// ============================================

const validatePagination = (page, limit) => {
  let validPage = parseInt(page, 10) || PAGINATION.DEFAULT_PAGE;
  let validLimit = parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT;

  if (validPage < 1) validPage = PAGINATION.DEFAULT_PAGE;
  if (validLimit < 1) validLimit = PAGINATION.DEFAULT_LIMIT;
  if (validLimit > PAGINATION.MAX_LIMIT) validLimit = PAGINATION.MAX_LIMIT;

  return { page: validPage, limit: validLimit };
};

const applyFilters = (items, filters) => {
  let filtered = [...items];

  const { search, craft, state, tag, type, year } = filters;

  if (search && search.trim() !== '') {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return title.includes(searchLower) || desc.includes(searchLower);
    });
  }

  if (craft) {
    const cLower = craft.toLowerCase();
    filtered = filtered.filter((item) => {
      const craftVal = (item.craft || '').toLowerCase();
      const titleVal = (item.title || '').toLowerCase();
      const descVal = (item.description || '').toLowerCase();
      return craftVal === cLower || titleVal.includes(cLower) || descVal.includes(cLower);
    });
  }

  if (state) {
    const sLower = state.toLowerCase();
    filtered = filtered.filter((item) => {
      const stateVal = (item.state || '').toLowerCase();
      const locVal = (item.location || '').toLowerCase();
      return stateVal === sLower || locVal.includes(sLower);
    });
  }

  if (tag) {
    const tLower = tag.toLowerCase();
    filtered = filtered.filter((item) => {
      return Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase() === tLower);
    });
  }

  if (type && type !== 'all') {
    filtered = filtered.filter((item) => item.type === type);
  }

  if (year && year !== 'All') {
    filtered = filtered.filter((item) => {
      return item.year && item.year.toString() === year.toString();
    });
  }

  return filtered;
};

const applySorting = (items, sort) => {
  const sorted = [...items];

  if (!sort) {
    sorted.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return sorted;
  }

  switch (sort) {
    case 'latest':
      sorted.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      break;
    case 'name':
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'name_desc':
      sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      break;
    default:
      sorted.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }

  return sorted;
};

// ============================================
// MAIN CONTROLLER
// ============================================

const getGallery = (req, res, next) => {
  try {
    const { search, craft, state, tag, type, year, sort } = req.query;

    // Validate type using config
    if (type && type !== 'all' && !GALLERY.ALLOWED_FILTERS.TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Allowed: ${GALLERY.ALLOWED_FILTERS.TYPES.join(', ')}`
      });
    }

    // Validate sort using config
    if (sort && !GALLERY.ALLOWED_SORT_OPTIONS.includes(sort)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sort. Allowed: ${GALLERY.ALLOWED_SORT_OPTIONS.join(', ')}`
      });
    }

    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    // Generate cache key using cache utility
    const cacheKey = generateKey({ 
      search, craft, state, tag, type, year, sort, page, limit 
    });
    
    // Get from cache using cache utility
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData.data,
        pagination: cachedData.pagination,
        cached: true,
        cacheStats: getStats()
      });
    }

    let culturalAssets;
    if (search && search.trim() !== '') {
      culturalAssets = store.searchEngine ? store.searchEngine.search(search, 'culturalItem') : [];
    } else {
      culturalAssets = store.culturalItems ? [...store.culturalItems.values()] : [];
    }

    if (!culturalAssets || culturalAssets.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0
        },
        message: 'No cultural items found'
      });
    }

    const filteredAssets = applyFilters(culturalAssets, { search, craft, state, tag, type, year });
    const sortedAssets = applySorting(filteredAssets, sort);

    const totalItems = sortedAssets.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const pagedAssets = sortedAssets.slice(offset, offset + limit);

    const response = {
      data: pagedAssets,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    };

    // Set cache using cache utility
    cache.set(cacheKey, response);

    res.json({
      success: true,
      ...response,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear gallery cache
 */
const clearGalleryCache = (req, res) => {
  try {
    clearByPattern('gallery:');
    res.json({
      success: true,
      message: 'Gallery cache cleared successfully',
      stats: getStats()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = (req, res) => {
  try {
    res.json({
      success: true,
      stats: getStats()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats'
    });
  }
};

module.exports = {
  getGallery,
  clearGalleryCache,
  getCacheStats
};