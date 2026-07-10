const crypto = require('crypto');

/**
 * Normalizes an object for deterministic hashing
 */
function normalizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') return obj.trim();
    return obj;
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  for (const key of sortedKeys) {
    if (key !== 'hash' && key !== '_verified') {
      result[key] = normalizeObject(obj[key]);
    }
  }
  return result;
}

/**
 * Generates a SHA-256 hash of the normalized object
 */
function hashObject(obj) {
  const normalized = normalizeObject(obj);
  const jsonStr = JSON.stringify(normalized) || '';
  return crypto.createHash('sha256').update(jsonStr, 'utf8').digest('hex');
}

module.exports = {
  normalizeObject,
  hashObject
};
