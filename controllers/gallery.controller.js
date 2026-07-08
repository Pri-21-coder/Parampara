const store = require('../data/store');

/**
 * GET /api/gallery
 * Retrieves a list of cultural items for the gallery with pagination, search, filtering, and sorting support.
 */
const getGallery = (req, res, next) => {
  try {
    const { search, craft, state, tag, type, year, sort } = req.query;
    let culturalAssets;

    // 1. Use search engine if query is provided
    if (search && search.trim() !== '') {
      culturalAssets = store.searchEngine.search(search, 'culturalItem');
    } else {
      culturalAssets = store.culturalItems ? store.culturalItems.values() : [];
    }

    // Create a copy of the array before sorting and filtering to avoid in-place mutation of store database
    culturalAssets = [...culturalAssets];

    // 2. Apply filtering (AND condition)

    // filter by craft
    if (craft) {
      const cLower = craft.toLowerCase();
      culturalAssets = culturalAssets.filter((item) => {
        const craftVal = (item.craft || '').toLowerCase();
        const titleVal = (item.title || '').toLowerCase();
        const descVal = (item.description || '').toLowerCase();
        return (
          craftVal === cLower ||
          titleVal.includes(cLower) ||
          descVal.includes(cLower)
        );
      });
    }

    // filter by state
    if (state) {
      const sLower = state.toLowerCase();
      culturalAssets = culturalAssets.filter((item) => {
        const stateVal = (item.state || '').toLowerCase();
        const locVal = (item.location || '').toLowerCase();
        return stateVal === sLower || locVal.includes(sLower);
      });
    }

    // filter by tag
    if (tag) {
      const tLower = tag.toLowerCase();
      culturalAssets = culturalAssets.filter((item) => {
        return (
          Array.isArray(item.tags) &&
          item.tags.some((t) => t.toLowerCase() === tLower)
        );
      });
    }

    // filter by type
    if (type && type !== 'all') {
      culturalAssets = culturalAssets.filter((item) => item.type === type);
    }

    // filter by year
    if (year && year !== 'All') {
      culturalAssets = culturalAssets.filter((item) => {
        return item.year && item.year.toString() === year.toString();
      });
    }

    // 3. Apply sorting
    if (sort) {
      if (sort === 'latest') {
        culturalAssets.sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );
      } else if (sort === 'oldest') {
        culturalAssets.sort(
          (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
        );
      } else if (sort === 'name') {
        culturalAssets.sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
      } else if (sort === 'name_desc') {
        culturalAssets.sort((a, b) =>
          (b.title || '').localeCompare(a.title || '')
        );
      }
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    const totalItems = culturalAssets.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Slice active assets for the requested page
    const pagedAssets = culturalAssets.slice(offset, offset + limit);

    res.json({
      success: true,
      data: pagedAssets,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGallery,
};
