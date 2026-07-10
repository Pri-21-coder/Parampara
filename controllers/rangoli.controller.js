const store = require('../data/store');
const { v4: uuidv4 } = require('uuid');

const getDesigns = (req, res, next) => {
  try {
    let designs = [];
    if (store.rangoliDesigns && typeof store.rangoliDesigns.values === 'function') {
      designs = store.rangoliDesigns.values();
    } else if (store.rangoliDesigns && Array.isArray(store.rangoliDesigns)) {
      designs = store.rangoliDesigns;
    }
    res.json({ success: true, designs });
  } catch (err) {
    console.error('getDesigns error:', err);
    next(err);
  }
};

const saveDesign = (req, res, next) => {
  try {
    let { title, author, style, config, svgData } = req.body;
    
    // Type validation
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return res.status(400).json({ success: false, error: 'Valid config object is required' });
    }
    
    // Length validation (prevent massive payloads)
    if (title && (typeof title !== 'string' || title.length > 100)) {
       return res.status(400).json({ success: false, error: 'Title is invalid or too long' });
    }
    if (author && (typeof author !== 'string' || author.length > 100)) {
       return res.status(400).json({ success: false, error: 'Author is invalid or too long' });
    }
    if (svgData && (typeof svgData !== 'string' || svgData.length > 500000)) { // 500kb max
       return res.status(400).json({ success: false, error: 'SVG data is invalid or too large' });
    }

    // XSS Sanitization for SVG
    if (svgData) {
      // Basic block against script tags and common XSS vectors in SVG
      if (/<script/i.test(svgData) || /onload=/i.test(svgData) || /onerror=/i.test(svgData) || /javascript:/i.test(svgData)) {
        return res.status(400).json({ success: false, error: 'Unsafe SVG content detected' });
      }
    }

    const designId = uuidv4();
    const newDesign = {
      id: designId,
      title: title || 'Untitled Design',
      author: author || 'Anonymous',
      style: style || 'Traditional',
      config,
      svgData,
      createdAt: new Date().toISOString()
    };

    store.rangoliDesigns.set(designId, newDesign);

    res.status(201).json({ success: true, design: newDesign });
  } catch (err) {
    next(err);
  }
};

const getDesignById = (req, res, next) => {
  try {
    const { id } = req.params;
    const design = store.rangoliDesigns.get(id);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }
    res.json({ success: true, design });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDesigns,
  saveDesign,
  getDesignById
};
