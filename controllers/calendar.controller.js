const store = require('../data/store');

// Helper to find event by ID
const findEvent = (id) => store.calendarEvents.find((e) => e.id === id);

/**
 * GET /api/calendar
 * Returns list of events based on filters, search queries, sorting, and pagination
 */
const getAllEvents = (req, res, next) => {
  try {
    let results = [...(store.calendarEvents || [])];
    const {
      q,
      month,
      season,
      state,
      district,
      community,
      category,
      craft,
      recipe,
      trail,
      sortBy,
      page,
      limit,
    } = req.query;

    // Search query keyword filter (case-insensitive)
    if (q) {
      const query = q.toLowerCase().trim();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.state.toLowerCase().includes(query) ||
          e.district.toLowerCase().includes(query) ||
          e.village.toLowerCase().includes(query) ||
          e.community.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.season.toLowerCase().includes(query) ||
          e.month.toLowerCase().includes(query) ||
          (e.rituals &&
            e.rituals.some((r) => r.toLowerCase().includes(query))) ||
          (e.associatedCrafts &&
            e.associatedCrafts.some((c) => c.toLowerCase().includes(query))) ||
          (e.associatedRecipes &&
            e.associatedRecipes.some((r) => r.toLowerCase().includes(query))) ||
          (e.associatedStories &&
            e.associatedStories.some((s) => s.toLowerCase().includes(query)))
      );
    }

    // Individual parameter filters (case-insensitive exact or partial match)
    if (month) {
      results = results.filter(
        (e) => e.month.toLowerCase() === month.toLowerCase().trim()
      );
    }

    if (season) {
      results = results.filter(
        (e) => e.season.toLowerCase() === season.toLowerCase().trim()
      );
    }

    if (state) {
      results = results.filter(
        (e) => e.state.toLowerCase() === state.toLowerCase().trim()
      );
    }

    if (district) {
      results = results.filter((e) =>
        e.district.toLowerCase().includes(district.toLowerCase().trim())
      );
    }

    if (community) {
      results = results.filter((e) =>
        e.community.toLowerCase().includes(community.toLowerCase().trim())
      );
    }

    if (category) {
      results = results.filter(
        (e) => e.category.toLowerCase() === category.toLowerCase().trim()
      );
    }

    if (craft) {
      results = results.filter(
        (e) =>
          e.associatedCrafts &&
          e.associatedCrafts.some((c) =>
            c.toLowerCase().includes(craft.toLowerCase().trim())
          )
      );
    }

    if (recipe) {
      results = results.filter(
        (e) =>
          e.associatedRecipes &&
          e.associatedRecipes.some((r) =>
            r.toLowerCase().includes(recipe.toLowerCase().trim())
          )
      );
    }

    if (trail) {
      results = results.filter(
        (e) =>
          e.relatedHeritageTrails &&
          e.relatedHeritageTrails.some((t) =>
            t.toLowerCase().includes(trail.toLowerCase().trim())
          )
      );
    }

    // Validate date query parameters if provided
    if (req.query.startDate) {
      const startLimit = new Date(req.query.startDate);
      if (isNaN(startLimit.getTime())) {
        return res
          .status(400)
          .json({ error: 'Invalid startDate format. Use YYYY-MM-DD.' });
      }
      results = results.filter((e) => new Date(e.startDate) >= startLimit);
    }

    // Sorting
    if (sortBy) {
      const sortOption = sortBy.toLowerCase().trim();
      if (sortOption === 'alphabetical') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortOption === 'newest' || sortOption === 'recently_added') {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortOption === 'oldest') {
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortOption === 'region' || sortOption === 'state') {
        results.sort((a, b) => a.state.localeCompare(b.state));
      } else if (sortOption === 'season') {
        results.sort((a, b) => a.season.localeCompare(b.season));
      } else if (sortOption === 'upcoming') {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const getWeight = (e) => {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          if (now >= start && now <= end) {
            return 0; // Happening now
          } else if (start > now) {
            return start.getTime() - now.getTime(); // Starts in future
          } else {
            // Past event, penalty so it goes to the bottom
            return 1e15 + (now.getTime() - start.getTime());
          }
        };

        results.sort((a, b) => getWeight(a) - getWeight(b));
      } else if (sortOption === 'popularity') {
        // Mock sorting based on string length of description to represent 'detail completeness'
        results.sort((a, b) => b.description.length - a.description.length);
      }
    } else {
      // Default sort by upcoming
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
      results.sort((a, b) => getWeight(a) - getWeight(b));
    }

    // Pagination
    const totalCount = results.length;
    let pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);

    if (page && (isNaN(pageNum) || pageNum <= 0)) {
      return res
        .status(400)
        .json({ error: 'Page parameter must be a positive integer.' });
    }
    if (limit && (isNaN(limitNum) || limitNum <= 0)) {
      return res
        .status(400)
        .json({ error: 'Limit parameter must be a positive integer.' });
    }

    if (pageNum && limitNum) {
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      const paginatedResults = results.slice(startIndex, endIndex);

      return res.json({
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
        events: paginatedResults,
      });
    }

    // If no pagination parameters, return all matching items
    res.json(results);
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
    const event = findEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(event);
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
  req.query.month = req.params.month;
  return getAllEvents(req, res, next);
};

/**
 * GET /api/calendar/season/:season
 * Route parameter filter shortcut for season
 */
const getEventsBySeason = (req, res, next) => {
  req.query.season = req.params.season;
  return getAllEvents(req, res, next);
};

/**
 * GET /api/calendar/state/:state
 * Route parameter filter shortcut for state
 */
const getEventsByState = (req, res, next) => {
  req.query.state = req.params.state;
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
