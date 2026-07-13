// controllers/calendar.controller.js
const store = require('../data/store');

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 100;

// Allowed values for filters
const ALLOWED_MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const ALLOWED_SEASONS = ['spring', 'summer', 'autumn', 'winter', 'monsoon'];

const ALLOWED_STATES = [
  'andhra pradesh', 'assam', 'bihar', 'gujarat', 'karnataka',
  'kerala', 'maharashtra', 'rajasthan', 'tamil nadu', 'uttar pradesh',
  'west bengal', 'himachal pradesh', 'punjab', 'odisha', 'telangana'
];

const ALLOWED_CATEGORIES = ['festival', 'ritual', 'celebration', 'cultural', 'religious'];

const ALLOWED_SORT_OPTIONS = [
  'alphabetical', 'newest', 'oldest', 'region', 'season', 'upcoming'
];

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
  let parsedPage = parseInt(page, 10);
  let parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = DEFAULT_PAGE;
  }

  if (isNaN(parsedLimit) || parsedLimit < 1) {
    parsedLimit = DEFAULT_LIMIT;
  }

  if (parsedLimit > MAX_LIMIT) {
    parsedLimit = MAX_LIMIT;
  }

  return { page: parsedPage, limit: parsedLimit };
}

/**
 * Validate month parameter
 */
function validateMonth(month) {
  if (!month) return null;
  const trimmed = month.trim().toLowerCase();
  if (ALLOWED_MONTHS.includes(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Validate season parameter
 */
function validateSeason(season) {
  if (!season) return null;
  const trimmed = season.trim().toLowerCase();
  if (ALLOWED_SEASONS.includes(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Validate state parameter
 */
function validateState(state) {
  if (!state) return null;
  const trimmed = state.trim().toLowerCase();
  if (ALLOWED_STATES.includes(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Validate category parameter
 */
function validateCategory(category) {
  if (!category) return null;
  const trimmed = category.trim().toLowerCase();
  if (ALLOWED_CATEGORIES.includes(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Validate and sanitize search query
 */
function sanitizeSearch(query) {
  if (!query || typeof query !== 'string') return '';
  const trimmed = query.trim();
  if (trimmed.length < MIN_SEARCH_LENGTH) return '';
  if (trimmed.length > MAX_SEARCH_LENGTH) return trimmed.slice(0, MAX_SEARCH_LENGTH);
  // Remove dangerous characters (XSS protection)
  return trimmed.replace(/[<>{}]/g, '');
}

/**
 * Validate sort option
 */
function validateSort(sortBy) {
  if (!sortBy) return 'upcoming';
  const trimmed = sortBy.trim().toLowerCase();
  if (ALLOWED_SORT_OPTIONS.includes(trimmed)) {
    return trimmed;
  }
  return 'upcoming';
}

/**
 * Validate date range
 */
function validateDateRange(startDate, endDate) {
  const result = { valid: true, start: null, end: null, errors: [] };

  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      result.valid = false;
      result.errors.push('Invalid startDate format. Use YYYY-MM-DD.');
    } else {
      result.start = start;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      result.valid = false;
      result.errors.push('Invalid endDate format. Use YYYY-MM-DD.');
    } else {
      result.end = end;
    }
  }

  if (result.start && result.end && result.start > result.end) {
    result.valid = false;
    result.errors.push('startDate must be before endDate.');
  }

  return result;
}

/**
 * Helper to find event by ID
 */
const findEvent = (id) => store.calendarEvents.find((e) => e.id === id);

// ============================================
// FILTER FUNCTIONS
// ============================================

/**
 * Filter events by search query
 */
function filterBySearch(events, query) {
  if (!query) return events;
  const searchTerm = query.toLowerCase();
  return events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm) ||
    e.description.toLowerCase().includes(searchTerm) ||
    e.state.toLowerCase().includes(searchTerm) ||
    e.district.toLowerCase().includes(searchTerm) ||
    e.village.toLowerCase().includes(searchTerm) ||
    e.community.toLowerCase().includes(searchTerm) ||
    e.category.toLowerCase().includes(searchTerm) ||
    e.season.toLowerCase().includes(searchTerm) ||
    e.month.toLowerCase().includes(searchTerm) ||
    (e.rituals && e.rituals.some((r) => r.toLowerCase().includes(searchTerm))) ||
    (e.associatedCrafts && e.associatedCrafts.some((c) => c.toLowerCase().includes(searchTerm))) ||
    (e.associatedRecipes && e.associatedRecipes.some((r) => r.toLowerCase().includes(searchTerm))) ||
    (e.associatedStories && e.associatedStories.some((s) => s.toLowerCase().includes(searchTerm)))
  );
}

/**
 * Filter events by month
 */
function filterByMonth(events, month) {
  if (!month) return events;
  return events.filter((e) => e.month.toLowerCase() === month);
}

/**
 * Filter events by season
 */
function filterBySeason(events, season) {
  if (!season) return events;
  return events.filter((e) => e.season.toLowerCase() === season);
}

/**
 * Filter events by state
 */
function filterByState(events, state) {
  if (!state) return events;
  return events.filter((e) => e.state.toLowerCase() === state);
}

/**
 * Filter events by district
 */
function filterByDistrict(events, district) {
  if (!district) return events;
  const searchTerm = district.toLowerCase().trim();
  return events.filter((e) => e.district.toLowerCase().includes(searchTerm));
}

/**
 * Filter events by community
 */
function filterByCommunity(events, community) {
  if (!community) return events;
  const searchTerm = community.toLowerCase().trim();
  return events.filter((e) => e.community.toLowerCase().includes(searchTerm));
}

/**
 * Filter events by category
 */
function filterByCategory(events, category) {
  if (!category) return events;
  return events.filter((e) => e.category.toLowerCase() === category);
}

/**
 * Filter events by craft
 */
function filterByCraft(events, craft) {
  if (!craft) return events;
  const searchTerm = craft.toLowerCase().trim();
  return events.filter((e) =>
    e.associatedCrafts &&
    e.associatedCrafts.some((c) => c.toLowerCase().includes(searchTerm))
  );
}

/**
 * Filter events by recipe
 */
function filterByRecipe(events, recipe) {
  if (!recipe) return events;
  const searchTerm = recipe.toLowerCase().trim();
  return events.filter((e) =>
    e.associatedRecipes &&
    e.associatedRecipes.some((r) => r.toLowerCase().includes(searchTerm))
  );
}

/**
 * Filter events by trail
 */
function filterByTrail(events, trail) {
  if (!trail) return events;
  const searchTerm = trail.toLowerCase().trim();
  return events.filter((e) =>
    e.relatedHeritageTrails &&
    e.relatedHeritageTrails.some((t) => t.toLowerCase().includes(searchTerm))
  );
}

/**
 * Filter events by date range
 */
function filterByDateRange(events, startDate, endDate) {
  let result = [...events];
  if (startDate) {
    result = result.filter((e) => new Date(e.startDate) >= startDate);
  }
  if (endDate) {
    result = result.filter((e) => new Date(e.endDate) <= endDate);
  }
  return result;
}

/**
 * Apply all filters
 */
function applyFilters(events, filters) {
  let results = [...events];

  results = filterBySearch(results, filters.search);
  results = filterByMonth(results, filters.month);
  results = filterBySeason(results, filters.season);
  results = filterByState(results, filters.state);
  results = filterByDistrict(results, filters.district);
  results = filterByCommunity(results, filters.community);
  results = filterByCategory(results, filters.category);
  results = filterByCraft(results, filters.craft);
  results = filterByRecipe(results, filters.recipe);
  results = filterByTrail(results, filters.trail);
  results = filterByDateRange(results, filters.startDate, filters.endDate);

  return results;
}

// ============================================
// SORT FUNCTIONS
// ============================================

/**
 * Sort events alphabetically by title
 */
function sortAlphabetical(events) {
  return [...events].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Sort events by newest first
 */
function sortNewest(events) {
  return [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Sort events by oldest first
 */
function sortOldest(events) {
  return [...events].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Sort events by region/state
 */
function sortByRegion(events) {
  return [...events].sort((a, b) => a.state.localeCompare(b.state));
}

/**
 * Sort events by season
 */
function sortBySeason(events) {
  return [...events].sort((a, b) => a.season.localeCompare(b.season));
}

/**
 * Sort events by upcoming
 */
function sortUpcoming(events) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getWeight = (e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now >= start && now <= end) return 0;
    if (start > now) return start.getTime() - now.getTime();
    return 1e15 + (now.getTime() - start.getTime());
  };

  return [...events].sort((a, b) => getWeight(a) - getWeight(b));
}

/**
 * Main sort function
 */
function sortEvents(events, sortBy) {
  const sortOption = sortBy || 'upcoming';

  switch (sortOption) {
    case 'alphabetical':
      return sortAlphabetical(events);
    case 'newest':
    case 'recently_added':
      return sortNewest(events);
    case 'oldest':
      return sortOldest(events);
    case 'region':
    case 'state':
      return sortByRegion(events);
    case 'season':
      return sortBySeason(events);
    case 'upcoming':
    default:
      return sortUpcoming(events);
  }
}

// ============================================
// MAIN CONTROLLER FUNCTIONS
// ============================================

/**
 * GET /api/calendar
 * Returns list of events based on filters, search queries, sorting, and pagination
 */
const getAllEvents = (req, res, next) => {
  try {
    // 1. Validate pagination
    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    // 2. Validate filters
    const month = validateMonth(req.query.month);
    const season = validateSeason(req.query.season);
    const state = validateState(req.query.state);
    const category = validateCategory(req.query.category);

    // 3. Sanitize search
    const search = sanitizeSearch(req.query.q);

    // 4. Validate sort
    const sortBy = validateSort(req.query.sortBy);

    // 5. Validate date range
    const dateValidation = validateDateRange(req.query.startDate, req.query.endDate);
    if (!dateValidation.valid) {
      return res.status(400).json({
        error: 'Invalid date parameters',
        details: dateValidation.errors
      });
    }

    // 6. Build filters object
    const filters = {
      search,
      month,
      season,
      state,
      district: req.query.district ? req.query.district.trim() : null,
      community: req.query.community ? req.query.community.trim() : null,
      category,
      craft: req.query.craft ? req.query.craft.trim() : null,
      recipe: req.query.recipe ? req.query.recipe.trim() : null,
      trail: req.query.trail ? req.query.trail.trim() : null,
      startDate: dateValidation.start,
      endDate: dateValidation.end
    };

    // 7. Get events from store
    let results = [...(store.calendarEvents || [])];

    // 8. Apply filters
    results = applyFilters(results, filters);

    // 9. Apply sorting
    results = sortEvents(results, sortBy);

    // 10. Pagination
    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalCount);
    const paginatedResults = results.slice(startIndex, endIndex);

    // 11. Build response
    const response = {
      success: true,
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        month: month || 'all',
        season: season || 'all',
        state: state || 'all',
        category: category || 'all',
        search: search || null
      },
      sort: sortBy
    };

    // 12. Add warnings if defaults were used
    const warnings = [];
    if (req.query.limit && parseInt(req.query.limit, 10) > MAX_LIMIT) {
      warnings.push(`Limit was adjusted to ${MAX_LIMIT}. Maximum allowed: ${MAX_LIMIT}`);
    }
    if (req.query.page && parseInt(req.query.page, 10) < 1) {
      warnings.push('Page was adjusted to 1. Minimum page: 1');
    }
    if (req.query.sortBy && !ALLOWED_SORT_OPTIONS.includes(req.query.sortBy.toLowerCase())) {
      warnings.push(`Sort was adjusted to 'upcoming'. Allowed: ${ALLOWED_SORT_OPTIONS.join(', ')}`);
    }
    if (req.query.month && !validateMonth(req.query.month)) {
      warnings.push(`Invalid month '${req.query.month}'. Allowed: ${ALLOWED_MONTHS.join(', ')}`);
    }
    if (req.query.season && !validateSeason(req.query.season)) {
      warnings.push(`Invalid season '${req.query.season}'. Allowed: ${ALLOWED_SEASONS.join(', ')}`);
    }
    if (req.query.state && !validateState(req.query.state)) {
      warnings.push(`Invalid state '${req.query.state}'. Allowed: ${ALLOWED_STATES.join(', ')}`);
    }
    if (req.query.category && !validateCategory(req.query.category)) {
      warnings.push(`Invalid category '${req.query.category}'. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
    }
    if (warnings.length > 0) {
      response.warnings = warnings;
    }

    res.json(response);

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/calendar/:id
 * Returns a single event by ID
 */
const getEventById = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Event ID is required'
      });
    }

    const event = findEvent(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/calendar/upcoming
 * Helper endpoint returning upcoming events sorted by start date
 */
const getUpcomingEvents = (req, res, next) => {
  req.query.sortBy = 'upcoming';
  return getAllEvents(req, res, next);
};

/**
 * GET /api/calendar/month/:month
 * Route parameter filter shortcut for month
 */
const getEventsByMonth = (req, res, next) => {
  const month = validateMonth(req.params.month);
  if (!month) {
    return res.status(400).json({
      error: `Invalid month. Allowed: ${ALLOWED_MONTHS.join(', ')}`
    });
  }
  req.query.month = month;
  return getAllEvents(req, res, next);
};

/**
 * GET /api/calendar/season/:season
 * Route parameter filter shortcut for season
 */
const getEventsBySeason = (req, res, next) => {
  const season = validateSeason(req.params.season);
  if (!season) {
    return res.status(400).json({
      error: `Invalid season. Allowed: ${ALLOWED_SEASONS.join(', ')}`
    });
  }
  req.query.season = season;
  return getAllEvents(req, res, next);
};

/**
 * GET /api/calendar/state/:state
 * Route parameter filter shortcut for state
 */
const getEventsByState = (req, res, next) => {
  const state = validateState(req.params.state);
  if (!state) {
    return res.status(400).json({
      error: `Invalid state. Allowed: ${ALLOWED_STATES.join(', ')}`
    });
  }
  req.query.state = state;
  return getAllEvents(req, res, next);
};

module.exports = {
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  getEventsByMonth,
  getEventsBySeason,
  getEventsByState,
};