// controllers/nature.controller.js
const store = require('../data/store');

const CACHE_TTL = 300000; // 5 minutes
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_AUTHOR_LENGTH = 100;
const MAX_CONTENT_LENGTH = 5000;

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

const sanitizeInput = (text) => {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

const validatePagination = (page, limit) => {
  let validPage = parseInt(page, 10) || 1;
  let validLimit = parseInt(limit, 10) || DEFAULT_LIMIT;

  if (validPage < 1) validPage = 1;
  if (validLimit < 1) validLimit = DEFAULT_LIMIT;
  if (validLimit > MAX_LIMIT) validLimit = MAX_LIMIT;

  return { page: validPage, limit: validLimit };
};

// GET all sacred natural heritage sites
const getNatureSites = (req, res) => {
  try {
    const { category, q, page, limit } = req.query;

    if (category && typeof category !== 'string') {
      return res.status(400).json({ error: 'Category must be a string' });
    }

    const { page: validPage, limit: validLimit } = validatePagination(page, limit);

    const cacheKey = getCacheKey({ category, q, validPage, validLimit });
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      return res.json({
        ...cachedData,
        cached: true
      });
    }

    let sites = store.naturalHeritageSites || [];

    if (category) {
      const categoryLower = category.toLowerCase();
      sites = sites.filter(site => {
        const siteCategory = (site.category || '').toLowerCase();
        return siteCategory === categoryLower;
      });
    }

    if (q) {
      const searchStr = q.toLowerCase();
      sites = sites.filter(site => {
        const matchesName = Object.values(site.name || {}).some(val => 
          String(val).toLowerCase().includes(searchStr)
        );
        const matchesLocation = Object.values(site.location || {}).some(val => 
          String(val).toLowerCase().includes(searchStr)
        );
        const matchesDesc = Object.values(site.description || {}).some(val => 
          String(val).toLowerCase().includes(searchStr)
        );
        const matchesCategory = (site.category || '').toLowerCase().includes(searchStr);
        return matchesName || matchesLocation || matchesDesc || matchesCategory;
      });
    }

    const total = sites.length;
    const totalPages = Math.ceil(total / validLimit);
    const offset = (validPage - 1) * validLimit;
    const pagedSites = sites.slice(offset, offset + validLimit);

    const response = {
      success: true,
      data: pagedSites,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages
      },
      message: pagedSites.length === 0 ? 'No natural heritage sites found' : undefined
    };

    setCache(cacheKey, response);

    res.json({
      ...response,
      cached: false
    });
  } catch (error) {
    console.error('Failed to fetch natural heritage sites:', error);
    res.status(500).json({ error: 'Error fetching natural heritage sites' });
  }
};

// GET a single sacred natural heritage site by ID
const getNatureSiteById = (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    const site = (store.naturalHeritageSites || []).find(s => s.id === id);

    if (!site) {
      return res.status(404).json({ error: 'Sacred natural heritage site not found' });
    }

    res.json({
      success: true,
      data: site
    });
  } catch (error) {
    console.error(`Failed to fetch site with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error fetching site details' });
  }
};

// POST folklore submission for a specific site
const submitFolklore = (req, res) => {
  try {
    const { id } = req.params;
    let { author, content } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Folklore content is required' });
    }

    const sanitizedContent = sanitizeInput(content);
    if (sanitizedContent.length < 10) {
      return res.status(400).json({ error: 'Folklore content must be at least 10 characters' });
    }

    if (sanitizedContent.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ 
        error: `Folklore content cannot exceed ${MAX_CONTENT_LENGTH} characters` 
      });
    }

    let sanitizedAuthor = 'Anonymous';
    if (author && author.trim() !== '') {
      sanitizedAuthor = sanitizeInput(author.trim());
      if (sanitizedAuthor.length > MAX_AUTHOR_LENGTH) {
        return res.status(400).json({ 
          error: `Author name cannot exceed ${MAX_AUTHOR_LENGTH} characters` 
        });
      }
    }

    const site = (store.naturalHeritageSites || []).find(s => s.id === id);

    if (!site) {
      return res.status(404).json({ error: 'Sacred natural heritage site not found' });
    }

    if (!site.userFolklore) {
      site.userFolklore = [];
    }

    const newFolklore = {
      id: Date.now().toString(),
      author: sanitizedAuthor,
      content: sanitizedContent,
      timestamp: new Date().toISOString()
    };

    site.userFolklore.push(newFolklore);

    // Clear cache after submission
    cache.clear();

    res.status(201).json({
      success: true,
      message: 'Folklore submitted successfully',
      data: {
        folklore: newFolklore,
        allFolklore: site.userFolklore
      }
    });
  } catch (error) {
    console.error(`Failed to submit folklore for site ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error submitting folklore' });
  }
};

module.exports = {
  getNatureSites,
  getNatureSiteById,
  submitFolklore
};