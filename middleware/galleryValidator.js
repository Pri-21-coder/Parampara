/**
 * Middleware to validate query parameters for the gallery API.
 */
const validateGalleryQuery = (req, res, next) => {
  const { page, limit, search, craft, state, tag, sort, type, year } =
    req.query;

  // page validation
  if (page !== undefined) {
    const pageNum = Number(page);
    if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Page must be greater than 0',
      });
    }
  }

  // limit validation
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (
      isNaN(limitNum) ||
      !Number.isInteger(limitNum) ||
      limitNum <= 0 ||
      limitNum > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit',
      });
    }
  }

  // sort validation
  const allowedSorts = ['latest', 'oldest', 'name', 'name_desc'];
  if (sort !== undefined && !allowedSorts.includes(sort)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sort parameter',
    });
  }

  // search, craft, state, tag, type, year validation (must be strings if present)
  const stringParams = { search, craft, state, tag, type, year };
  for (const [name, val] of Object.entries(stringParams)) {
    if (val !== undefined && typeof val !== 'string') {
      return res.status(400).json({
        success: false,
        message: `${name} must be a string`,
      });
    }
  }

  next();
};

module.exports = validateGalleryQuery;
