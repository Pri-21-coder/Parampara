// middleware/moderation.js
const Trie = require('../utils/Trie');
const { profanity, spamPhrases } = require('../config/profanity');

// ============================================
// CONSTANTS
// ============================================

const CACHE_TTL = 3600000; // 1 hour
const MAX_TEXT_LENGTH = 10000;
const DEFAULT_ACTION = 'block';
const ALLOWED_ACTIONS = ['block', 'censor', 'warn'];

const ALLOWED_SENSITIVITY = ['low', 'medium', 'high'];
const DEFAULT_SENSITIVITY = 'medium';

// ============================================
// CONFIGURATION
// ============================================

const config = {
  action: process.env.MODERATION_ACTION || DEFAULT_ACTION,
  sensitivity: process.env.MODERATION_SENSITIVITY || DEFAULT_SENSITIVITY,
  maxLength: parseInt(process.env.MODERATION_MAX_LENGTH, 10) || MAX_TEXT_LENGTH,
  enableCache: process.env.MODERATION_CACHE !== 'false'
};

// ============================================
// TRIE INITIALIZATION
// ============================================

let moderationTrie = null;
let trieInitialized = false;

function initializeTrie() {
  try {
    if (!trieInitialized) {
      moderationTrie = new Trie();
      moderationTrie.build(profanity);
      moderationTrie.build(spamPhrases);
      trieInitialized = true;
      console.log('[Moderation] Trie initialized successfully');
    }
    return moderationTrie;
  } catch (error) {
    console.error('[Moderation] Trie initialization failed:', error);
    return null;
  }
}

// ============================================
// CACHE MANAGER
// ============================================

class ModerationCache {
  constructor(ttl = CACHE_TTL) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  generateKey(text, action) {
    return `${text.substring(0, 100)}_${action}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl
    };
  }
}

const moderationCache = new ModerationCache();

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate moderation options
 */
function validateOptions(options) {
  const errors = [];

  // Validate action
  if (options.action && !ALLOWED_ACTIONS.includes(options.action)) {
    errors.push(`action must be one of: ${ALLOWED_ACTIONS.join(', ')}`);
  }

  // Validate fields
  if (!options.fields || !Array.isArray(options.fields) || options.fields.length === 0) {
    errors.push('fields must be a non-empty array');
  } else {
    for (const field of options.fields) {
      if (typeof field !== 'string' || field.trim().length === 0) {
        errors.push('each field must be a non-empty string');
        break;
      }
    }
  }

  // Validate sensitivity
  if (options.sensitivity && !ALLOWED_SENSITIVITY.includes(options.sensitivity)) {
    errors.push(`sensitivity must be one of: ${ALLOWED_SENSITIVITY.join(', ')}`);
  }

  // Validate maxLength
  if (options.maxLength && (typeof options.maxLength !== 'number' || options.maxLength < 1)) {
    errors.push('maxLength must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate request body
 */
function validateRequestBody(body, fields) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('request body must be an object');
    return { valid: false, errors };
  }

  for (const field of fields) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`field '${field}' must be a string`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate text length
 */
function validateTextLength(text, maxLength) {
  if (!text) return { valid: true };
  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Text exceeds maximum length of ${maxLength} characters`
    };
  }
  return { valid: true };
}

/**
 * Check if text contains whitelisted words
 */
function hasWhitelistedWords(text, whitelist) {
  if (!whitelist || whitelist.length === 0) return false;
  const lowerText = text.toLowerCase();
  return whitelist.some(word => lowerText.includes(word.toLowerCase()));
}

// ============================================
// MODERATION FUNCTIONS
// ============================================

/**
 * Moderate a single text
 */
function moderateText(text, options) {
  const startTime = Date.now();

  try {
    // Check cache
    const cacheKey = moderationCache.generateKey(text, options.action);
    const cachedResult = moderationCache.get(cacheKey);
    if (cachedResult && config.enableCache) {
      return {
        ...cachedResult,
        fromCache: true,
        duration: Date.now() - startTime
      };
    }

    // Check whitelist
    if (hasWhitelistedWords(text, options.whitelist)) {
      const result = {
        isClean: true,
        message: null,
        censoredText: null,
        fromCache: false,
        duration: Date.now() - startTime
      };
      moderationCache.set(cacheKey, result);
      return result;
    }

    // Check if trie is initialized
    if (!moderationTrie) {
      console.warn('[Moderation] Trie not available, skipping moderation');
      return {
        isClean: true,
        message: null,
        censoredText: null,
        duration: Date.now() - startTime
      };
    }

    // Scan the text
    const result = moderationTrie.scan(text, {
      censor: options.action === 'censor',
      sensitivity: options.sensitivity || config.sensitivity
    });

    const response = {
      isClean: result.isClean,
      message: result.isClean ? null : (result.message || 'Content contains prohibited words or spam'),
      censoredText: result.isClean ? null : (result.censoredText || text),
      matchedWords: result.matchedWords || [],
      fromCache: false,
      duration: Date.now() - startTime
    };

    // Cache the result
    if (config.enableCache) {
      moderationCache.set(cacheKey, response);
    }

    return response;

  } catch (error) {
    console.error('[Moderation] moderateText error:', error);
    return {
      isClean: true,
      message: null,
      censoredText: null,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Process moderation for all fields
 */
function processFields(req, fields, options) {
  const results = {};
  let hasViolations = false;
  const violationMessages = [];

  for (const field of fields) {
    const value = req.body[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      // Validate text length
      const lengthValidation = validateTextLength(value, options.maxLength || config.maxLength);
      if (!lengthValidation.valid) {
        results[field] = { isClean: false, error: lengthValidation.error };
        hasViolations = true;
        violationMessages.push({ field, message: lengthValidation.error });
        continue;
      }

      // Moderate the text
      const result = moderateText(value, options);
      results[field] = result;

      if (!result.isClean) {
        if (options.action === 'block') {
          hasViolations = true;
          violationMessages.push({
            field,
            message: result.message || `Prohibited content found in ${field}`
          });
          break;
        } else if (options.action === 'censor' && result.censoredText) {
          req.body[field] = result.censoredText;
        } else if (options.action === 'warn') {
          req.body[`${field}_moderation_warning`] = true;
        }
      }
    }
  }

  return { hasViolations, violationMessages, results };
}

// ============================================
// MAIN MIDDLEWARE
// ============================================

/**
 * Express middleware for detecting profanity and spam
 * @param {Object} options - Moderation options
 * @param {string} options.action - 'block', 'censor', or 'warn'
 * @param {Array<string>} options.fields - req.body fields to check
 * @param {string} options.sensitivity - 'low', 'medium', or 'high'
 * @param {Array<string>} options.whitelist - Words to whitelist
 * @param {number} options.maxLength - Maximum text length
 */
const moderateContent = (options = {}) => {
  // Initialize trie
  initializeTrie();

  // Validate options
  const validation = validateOptions(options);
  if (!validation.valid) {
    console.warn('[Moderation] Invalid options:', validation.errors);
    // Return pass-through middleware if options are invalid
    return (req, res, next) => next();
  }

  // Normalize options
  const normalizedOptions = {
    action: options.action || config.action,
    fields: options.fields || [],
    sensitivity: options.sensitivity || config.sensitivity,
    whitelist: options.whitelist || [],
    maxLength: options.maxLength || config.maxLength,
    customReplacements: options.customReplacements || {}
  };

  // If no fields to check, return pass-through
  if (normalizedOptions.fields.length === 0) {
    return (req, res, next) => next();
  }

  return (req, res, next) => {
    try {
      // Validate request body
      const bodyValidation = validateRequestBody(req.body, normalizedOptions.fields);
      if (!bodyValidation.valid) {
        console.warn('[Moderation] Invalid request body:', bodyValidation.errors);
        return next();
      }

      // Check if any field has content to moderate
      const hasContent = normalizedOptions.fields.some(
        field => typeof req.body[field] === 'string' && req.body[field].trim().length > 0
      );

      if (!hasContent) {
        return next();
      }

      // Process fields
      const { hasViolations, violationMessages, results } = processFields(
        req,
        normalizedOptions.fields,
        normalizedOptions
      );

      // Add moderation metadata to request
      req.moderation = {
        results,
        action: normalizedOptions.action,
        timestamp: new Date().toISOString(),
        fieldsChecked: normalizedOptions.fields
      };

      // Handle violations
      if (hasViolations && normalizedOptions.action === 'block') {
        return res.status(422).json({
          success: false,
          error: 'Content Moderation Failed',
          message: 'Your submission contains prohibited content or spam.',
          violations: violationMessages,
          details: process.env.NODE_ENV === 'development' ? results : undefined
        });
      }

      next();

    } catch (error) {
      console.error('[Moderation] Middleware error:', error);
      // Don't block the request on error
      req.moderationError = error.message;
      next();
    }
  };
};

// ============================================
// CLEANUP
// ============================================

// Clear cache periodically
setInterval(() => {
  moderationCache.clear();
  console.log('[Moderation] Cache cleared');
}, CACHE_TTL);

// ============================================
// EXPORTS
// ============================================

module.exports = {
  moderateContent,
  initializeTrie,
  moderateText,
  validateOptions,
  ModerationCache,
  moderationCache,
  config
};