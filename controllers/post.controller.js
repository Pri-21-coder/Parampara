const store = require('../data/store');
const sseManager = require('../utils/sseManager');
const { apiCache } = require('../middleware/lruCache');
const { BoundingBox } = require('../utils/QuadTree');
const notificationService = require('../server/services/notificationService');

const getPosts = (req, res) => {
  let posts =
    typeof store.villagePosts.values === 'function'
      ? Array.from(store.villagePosts.values())
      : Array.isArray(store.villagePosts)
        ? store.villagePosts
        : Array.from(store.villagePosts || []);

  if (req.query.bounds) {
    const parts = req.query.bounds.split(',').map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      const range = new BoundingBox(parts[1], parts[0], parts[3], parts[2]);
      posts = store.villagePostsQuadTree.search(range);
    }
  }

  posts = posts.filter(post => !post.isHidden);
  res.json(posts);
};

const streamPosts = (req, res) => {
  sseManager.addClient(req, res);
};

const createPost = (req, res) => {
  if (!req.body.title || !req.body.village) {
    return res.status(400).json({
      error: 'Village and title are required',
    });
  }

  const newPost = {
    id: Date.now().toString(),
    village: req.body.village,
    title: req.body.title,
    content: req.body.content,
    type: req.body.type,
    date: req.body.date,
    coordinates: req.body.coordinates || null,
    timestamp: new Date().toISOString(),
  };

  if (typeof store.villagePosts.push === 'function') {
    store.villagePosts.push(newPost);
  }

  store.villagePostsQuadTree.insert(newPost);

  // Broadcast to all connected SSE clients
  sseManager.broadcast('NEW_POST', newPost);

  // Invalidate caches
  apiCache.invalidateByPrefix('/api/posts');
  apiCache.invalidateByPrefix('/api/search');

  res.status(201).json(newPost);
};

module.exports = {
  getPosts,
  streamPosts,
  createPost,
};