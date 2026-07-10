const store = require('../data/store');

/**
 * Helper to retrieve all artifacts from store
 */
const getAllArtifactsFromStore = () => {
  return store.artifacts ? store.artifacts.values() : [];
};

/**
 * GET /api/artifacts
 * List all artifacts with filtering, sorting, and pagination
 */
exports.getArtifacts = (req, res, next) => {
  try {
    let artifacts = getAllArtifactsFromStore();

    // 1. Search Query (if search or q is provided)
    const searchQuery = req.query.search || req.query.q;
    if (searchQuery && searchQuery.trim() !== '') {
      artifacts = store.searchEngine.search(searchQuery.trim(), 'artifact');
    }

    // 2. Filters
    const { category, state, community, material, preservationStatus } = req.query;

    if (category) {
      artifacts = artifacts.filter(art => art.category.toLowerCase() === category.toLowerCase());
    }

    if (state) {
      artifacts = artifacts.filter(art => art.state.toLowerCase() === state.toLowerCase());
    }

    if (community) {
      artifacts = artifacts.filter(art => art.community.toLowerCase() === community.toLowerCase());
    }

    if (material) {
      artifacts = artifacts.filter(art => 
        art.materials && 
        art.materials.some(m => m.toLowerCase().includes(material.toLowerCase()))
      );
    }

    if (preservationStatus) {
      artifacts = artifacts.filter(art => art.preservationStatus.toLowerCase().includes(preservationStatus.toLowerCase()));
    }

    // 3. Sorting
    const sort = req.query.sort || 'name';
    switch (sort) {
      case 'name_desc':
        artifacts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        artifacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        artifacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'recently_updated':
        artifacts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case 'most_viewed':
        artifacts.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'name':
      default:
        artifacts.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    // 4. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const totalItems = artifacts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    
    const pagedData = artifacts.slice(offset, offset + limit);

    res.json({
      success: true,
      data: pagedData,
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages,
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/artifacts/search
 * Search endpoint wrapping SearchEngine
 */
exports.searchArtifacts = (req, res, next) => {
  try {
    const q = req.query.q || req.query.search;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query (q or search) is required' });
    }

    let results = store.searchEngine.search(q, 'artifact');

    // Reuse filter logic if filters are provided alongside search
    const { category, state, community, material, preservationStatus } = req.query;
    if (category) results = results.filter(art => art.category.toLowerCase() === category.toLowerCase());
    if (state) results = results.filter(art => art.state.toLowerCase() === state.toLowerCase());
    if (community) results = results.filter(art => art.community.toLowerCase() === community.toLowerCase());
    if (material) {
      results = results.filter(art => 
        art.materials && art.materials.some(m => m.toLowerCase().includes(material.toLowerCase()))
      );
    }
    if (preservationStatus) {
      results = results.filter(art => art.preservationStatus.toLowerCase().includes(preservationStatus.toLowerCase()));
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    const pagedData = results.slice(offset, offset + limit);

    res.json({
      success: true,
      data: pagedData,
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages,
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/artifacts/categories
 * Retrieve all unique categories
 */
exports.getCategories = (req, res, next) => {
  try {
    const artifacts = getAllArtifactsFromStore();
    const categories = [...new Set(artifacts.map(art => art.category))].filter(Boolean);
    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/artifacts/regions
 * Retrieve all unique states, districts, and villages
 */
exports.getRegions = (req, res, next) => {
  try {
    const artifacts = getAllArtifactsFromStore();
    const states = [...new Set(artifacts.map(art => art.state))].filter(Boolean);
    const districts = [...new Set(artifacts.map(art => art.district))].filter(Boolean);
    const villages = [...new Set(artifacts.map(art => art.village))].filter(Boolean);

    res.json({
      success: true,
      data: {
        states,
        districts,
        villages,
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/artifacts/:id
 * Retrieve detail of a single artifact, incrementing view count
 */
exports.getArtifactById = (req, res, next) => {
  try {
    const { id } = req.params;
    const artifacts = getAllArtifactsFromStore();
    const artifact = artifacts.find(art => art.id === id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    // Increment views count on access
    artifact.views = (artifact.views || 0) + 1;

    res.json({
      success: true,
      data: artifact,
    });
  } catch (err) {
    next(err);
  }
};
