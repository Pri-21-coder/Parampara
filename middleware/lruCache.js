class LRUCache {
  constructor(capacity = 100, ttlMs = 300000) {
    this.capacity = capacity;
    this.ttl = ttlMs;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const entry = this.cache.get(key);
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    // Refresh position to make it most recently used
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.data;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      // If it exists, remove it first so we can add it at the end
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict the least recently used (first item in the Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  invalidateByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }
  }

  invalidateByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.match(pattern)) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      capacity: this.capacity,
      ttlMs: this.ttl,
      ...this.stats
    };
  }
}

// Global cache instance with default capacity 100 and TTL 5 minutes
const apiCache = new LRUCache(100, 5 * 60 * 1000); 

const cacheMiddleware = (req, res, next) => {
  // Only cache successful GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const cachedData = apiCache.get(key);

  if (cachedData) {
    return res.json(cachedData);
  }

  // Intercept res.json to cache the response before sending
  const originalJson = res.json;
  res.json = (body) => {
    // Only cache 200 OK responses
    if (res.statusCode === 200) {
      apiCache.set(key, body);
    }
    originalJson.call(res, body);
  };

  next();
};

module.exports = {
  LRUCache,
  apiCache,
  cacheMiddleware
};
