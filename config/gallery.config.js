/**
 * Gallery Module Configuration
 * Centralized configuration for gallery functionality
 */

module.exports = {
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100
  },
  
  // Gallery specific settings
  GALLERY: {
    ALLOWED_SORT_OPTIONS: [
      'latest',
      'oldest',
      'name',
      'name_desc'
    ],
    ALLOWED_FILTERS: {
      TYPES: ['all', 'painting', 'sculpture', 'textile', 'pottery', 'jewellery'],
      CATEGORIES: ['all', 'festival', 'ritual', 'cultural', 'religious', 'nature', 'heritage', 'craft']
    },
    MAX_TAGS: 10,
    MIN_TAG_LENGTH: 2,
    MAX_TAG_LENGTH: 30,
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'pdf']
  }
};