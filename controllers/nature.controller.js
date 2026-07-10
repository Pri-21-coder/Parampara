// controllers/nature.controller.js
const store = require('../data/store');

// GET all sacred natural heritage sites
const getNatureSites = (req, res) => {
  try {
    let sites = store.naturalHeritageSites || [];
    const { category, q } = req.query;

    // Filter by category
    if (category) {
      sites = sites.filter(site => site.category.toLowerCase() === category.toLowerCase());
    }

    // Search query filter (search in English, Hindi, Marathi titles, locations, and descriptions)
    if (q) {
      const searchStr = q.toLowerCase();
      sites = sites.filter(site => {
        const matchesName = Object.values(site.name).some(val => val.toLowerCase().includes(searchStr));
        const matchesLocation = Object.values(site.location).some(val => val.toLowerCase().includes(searchStr));
        const matchesDesc = Object.values(site.description).some(val => val.toLowerCase().includes(searchStr));
        const matchesCategory = site.category.toLowerCase().includes(searchStr);
        return matchesName || matchesLocation || matchesDesc || matchesCategory;
      });
    }

    res.json(sites);
  } catch (error) {
    console.error('Failed to fetch natural heritage sites:', error);
    res.status(500).json({ error: 'Error fetching natural heritage sites' });
  }
};

// GET a single sacred natural heritage site by ID
const getNatureSiteById = (req, res) => {
  try {
    const { id } = req.params;
    const site = (store.naturalHeritageSites || []).find(s => s.id === id);

    if (!site) {
      return res.status(404).json({ error: 'Sacred natural heritage site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error(`Failed to fetch site with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error fetching site details' });
  }
};

// POST folklore submission for a specific site
const submitFolklore = (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Folklore content is required' });
    }

    const site = (store.naturalHeritageSites || []).find(s => s.id === id);

    if (!site) {
      return res.status(404).json({ error: 'Sacred natural heritage site not found' });
    }

    // Initialize userFolklore array if not present
    if (!site.userFolklore) {
      site.userFolklore = [];
    }

    const newFolklore = {
      id: Date.now().toString(),
      author: author && author.trim() !== '' ? author.trim() : 'Anonymous',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    site.userFolklore.push(newFolklore);

    res.status(201).json({
      message: 'Folklore submitted successfully',
      folklore: newFolklore,
      allFolklore: site.userFolklore
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
