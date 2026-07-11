const store = require('../data/store');

const CACHE_TTL = 300000; // 5 minutes
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const VALID_SORT_FIELDS = ['latest', 'oldest', 'name', 'name_desc'];
const VALID_TYPES = ['all', 'painting', 'sculpture', 'textile', 'pottery', 'jewellery'];

const cache = new Map();

const getCacheKey = (params) => {
  return JSON.stringify(params);
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
};

const clearCache = () => {
  cache.clear();
};

const validatePagination = (page, limit) => {
  let validPage = parseInt(page, 10) || 1;
  let validLimit = parseInt(limit, 10) || DEFAULT_LIMIT;

  if (validPage < 1) validPage = 1;
  if (validLimit < 1) validLimit = DEFAULT_LIMIT;
  if (validLimit > MAX_LIMIT) validLimit = MAX_LIMIT;

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

const getGallery = (req, res, next) => {
  try {
    const { search, craft, state, tag, type, year, sort } = req.query;

    if (type && type !== 'all' && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Allowed: ${VALID_TYPES.join(', ')}`
      });
    }

    if (sort && !VALID_SORT_FIELDS.includes(sort)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sort. Allowed: ${VALID_SORT_FIELDS.join(', ')}`
      });
    }

    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    const cacheKey = getCacheKey({ search, craft, state, tag, type, year, sort, page, limit });
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData.data,
        pagination: cachedData.pagination,
        cached: true
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

    setCache(cacheKey, response);

    res.json({
      success: true,
      ...response,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGallery,
  clearCache
};