const store = require('../data/store');
const { roleHierarchy } = require('./auth');

// This middleware requires authenticateToken to have run first
const verifyOwnership = (resourceType) => {
  return (req, res, next) => {
    const resourceId = req.params.id;
    if (!resourceId) return next(); // Not a specific resource request

    // If user has global edit/delete permissions, allow immediately
    const userPermissions = roleHierarchy[req.user.role] || [];
    if (userPermissions.includes('edit:items') || userPermissions.includes('delete:items')) {
      return next();
    }

    // Otherwise they must have edit:own_items and be the author
    if (!userPermissions.includes('edit:own_items')) {
      return res.status(403).json({ error: 'You do not have permission to modify this item' });
    }

    let resource = null;
    if (resourceType === 'culturalItems') {
      const items = store.culturalItems.toArray ? store.culturalItems.toArray() : Array.from(store.culturalItems.cache ? store.culturalItems.cache.values() : store.culturalItems);
      resource = items.find(i => i.id === resourceId);
    } else if (resourceType === 'heritagePaths') {
      resource = store.heritagePaths.find(p => p.id === resourceId);
    } else if (resourceType === 'villagePosts') {
      const posts = store.villagePosts.toArray ? store.villagePosts.toArray() : Array.from(store.villagePosts.cache ? store.villagePosts.cache.values() : store.villagePosts);
      resource = posts.find(p => p.id === resourceId);
    }

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.authorId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this resource' });
    }

    next();
  };
};

module.exports = {
  verifyOwnership
};
