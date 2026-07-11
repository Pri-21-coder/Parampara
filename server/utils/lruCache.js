class LRUCache {
  constructor(capacity = 1000) {
    if (capacity <= 0) throw new Error("Capacity must be greater than 0");
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Refresh priority
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  values() {
    return Array.from(this.cache.values());
  }

  get size() {
    return this.cache.size;
  }

  // --- Array Compatibility Methods ---

  push(item) {
    // Attempt to extract an ID, otherwise generate one
    const key = item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
    this.set(key, item);
    return this.cache.size;
  }

  filter(callback) {
    return this.values().filter(callback);
  }

  map(callback) {
    return this.values().map(callback);
  }

  find(callback) {
    for (const [key, value] of this.cache.entries()) {
      if (callback(value)) {
        // Accessing updates LRU priority
        return this.get(key);
      }
    }
    return undefined;
  }

  findIndex(callback) {
    const vals = this.values();
    return vals.findIndex(callback);
  }

  forEach(callback) {
    this.values().forEach(callback);
  }

  reduce(callback, initialValue) {
    return this.values().reduce(callback, initialValue);
  }

  sort(callback) {
    return this.values().sort(callback);
  }

  slice(start, end) {
    return this.values().slice(start, end);
  }

  some(callback) {
    return this.values().some(callback);
  }

  every(callback) {
    return this.values().every(callback);
  }

  get length() {
    return this.cache.size;
  }

  /**
   * Return an iterator of [key, value] pairs for every entry in the cache.
   * @returns {IterableIterator<[any, any]>}
   */
  entries() {
    return this.cache.entries();
  }

  /**
   * Return an iterator of keys in the cache.
   * @returns {IterableIterator<any>}
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Default iterator for the cache, allowing for...of loops directly on the cache instance.
   * @returns {IterableIterator<[any, any]>}
   */
  [Symbol.iterator]() {
    return this.cache.entries();
  }
}

module.exports = LRUCache;
