/**
 * Middleware to validate query parameters for the artifact explorer API.
 */
const validateArtifactQuery = (req, res, next) => {
  const { page, limit, search, q, category, state, community, material, preservationStatus, sort } = req.query;

  // Validate page
  if (page !== undefined) {
    const pageNum = Number(page);
    if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Page must be an integer greater than 0',
      });
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer between 1 and 100',
      });
    }
  }

  // Validate sort
  const allowedSorts = ['name', 'name_desc', 'newest', 'oldest', 'recently_updated', 'most_viewed'];
  if (sort !== undefined && !allowedSorts.includes(sort)) {
    return res.status(400).json({
      success: false,
      message: `Invalid sort parameter. Allowed values: ${allowedSorts.join(', ')}`,
    });
  }

  // Validate filter strings if present
  const stringParams = { search, q, category, state, community, material, preservationStatus };
  for (const [name, val] of Object.entries(stringParams)) {
    if (val !== undefined && typeof val !== 'string') {
      return res.status(400).json({
        success: false,
        message: `${name} parameter must be a string`,
      });
    }
  }

  next();
};

/**
 * Middleware to validate parameters for artifact by ID.
 */
const validateArtifactId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing artifact ID',
    });
  }
  next();
};

module.exports = {
  validateArtifactQuery,
  validateArtifactId,
};
