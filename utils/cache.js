/**
 * Cache Utility Module
 * Centralized cache management for the application
 */

// ============================================
// CACHE CONFIGURATION
// ============================================

const cacheConfig = {
  DEFAULT_TTL: 300, // 5 minutes in seconds
  MAX_SIZE: 1000, // Maximum number of items in cache
  CLEANUP_INTERVAL: 60000, // 1 minute
  DEFAULT_CACHE_KEY_PREFIX: 'app:cache:'
};

// ============================================
// CACHE STORE
// ============================================

class CacheStore {
  constructor(options = {}) {
    this.store = new Map();
    this.ttl = options.ttl || cacheConfig.DEFAULT_TTL;
    this.maxSize = options.maxSize || cacheConfig.MAX_SIZE;
    this.prefix = options.prefix || cacheConfig.DEFAULT_CACHE_KEY_PREFIX;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    
    // Setup automatic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, options.cleanupInterval || cacheConfig.CLEANUP_INTERVAL);
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(params) {
    if (typeof params === 'string') {
      return `${this.prefix}${params}`;
    }
    
    if (typeof params === 'object') {
      const sorted = Object.keys(params)
        .sort()
        .reduce((obj, key) => {
          obj[key] = params[key];
          return obj;
        }, {});
      const keyString = JSON.stringify(sorted);
      return `${this.prefix}${Buffer.from(keyString).toString('base64')}`;
    }
    
    return `${this.prefix}${String(params)}`;
  }

  /**
   * Get value from cache
   */
  get(key) {
    const fullKey = key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
    const entry = this.store.get(fullKey);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check if expired
    if (entry.expires && entry.expires < Date.now()) {
      this.store.delete(fullKey);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return entry.value;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key, value, ttl = null) {
    const fullKey = key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
    
    // Check max size and evict if needed
    if (this.store.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const entry = {
      value: value,
      timestamp: Date.now(),
      expires: ttl ? Date.now() + (ttl * 1000) : (this.ttl ? Date.now() + (this.ttl * 1000) : null)
    };
    
    this.store.set(fullKey, entry);
    return true;
  }

  /**
   * Delete key from cache
   */
  delete(key) {
    const fullKey = key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
    return this.store.delete(fullKey);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Clear cache by pattern
   */
  clearByPattern(pattern) {
    const keysToDelete = [];
    const regex = new RegExp(pattern);
    
    for (const [key] of this.store) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.store.delete(key));
    return keysToDelete.length;
  }

  /**
   * Get cache stats
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      evictions: this.evictions,
      keys: Array.from(this.store.keys())
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.store) {
      if (entry.expires && entry.expires < now) {
        this.store.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Evict oldest entry when cache is full
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.store) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.store.delete(oldestKey);
      this.evictions++;
      return true;
    }
    
    return false;
  }

  /**
   * Destroy cache (cleanup interval)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

const defaultCache = new CacheStore();

// ============================================
// EXPORTS
// ============================================

module.exports = {
  CacheStore,
  cacheConfig,
  cache: defaultCache,
  
  // Convenience functions
  generateKey: (params) => defaultCache.generateKey(params),
  get: (key) => defaultCache.get(key),
  set: (key, value, ttl) => defaultCache.set(key, value, ttl),
  delete: (key) => defaultCache.delete(key),
  clear: () => defaultCache.clear(),
  clearByPattern: (pattern) => defaultCache.clearByPattern(pattern),
  getStats: () => defaultCache.getStats(),
  cleanup: () => defaultCache.cleanup()
};