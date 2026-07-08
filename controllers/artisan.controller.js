const store = require('../data/store');

// Get all artisans
exports.getAllArtisans = (req, res, next) => {
  try {
    const artisans = store.artisans || [];
    res.json(artisans);
  } catch (err) {
    next(err);
  }
};

// Get artisan by ID
exports.getArtisanById = (req, res, next) => {
  try {
    const { id } = req.params;
    const artisan = (store.artisans || []).find((a) => a.id === id);

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' });
    }

    res.json(artisan);
  } catch (err) {
    next(err);
  }
};