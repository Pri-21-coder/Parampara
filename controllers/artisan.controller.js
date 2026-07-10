const store = require('../data/store');

// Get all artisans
exports.getAllArtisans = (req, res, next) => {
  try {
    const artisans = store.artisans ? Array.from(store.artisans.values()) : [];
    res.json(artisans);
  } catch (err) {
    next(err);
  }
};

// Get artisan by ID
exports.getArtisanById = (req, res, next) => {
  try {
    const { id } = req.params;
    const artisans = store.artisans ? Array.from(store.artisans.values()) : [];
    const artisan = artisans.find((a) => a.id === id);

    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' });
    }

    // Fetch the portfolio (cultural items by this artisan)
    const allItems = store.culturalItems ? Array.from(store.culturalItems.values()) : [];
    const portfolio = allItems.filter(item => item.artisanId === id);

    // Fetch related artisans based on craft or region
    const relatedArtisans = artisans
      .filter(a => a.id !== id && (a.craft === artisan.craft || a.region === artisan.region))
      .map(a => ({ id: a.id, name: a.name, craft: a.craft, profileImage: a.profileImage }))
      .slice(0, 3); // top 3 related

    res.json({
      ...artisan,
      portfolio,
      relatedArtisans
    });
  } catch (err) {
    next(err);
  }
};