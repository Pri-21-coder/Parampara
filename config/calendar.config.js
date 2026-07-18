/**
 * Calendar Module Configuration
 * Centralized configuration for calendar-related functionality
 */

module.exports = {
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // Search constraints
  SEARCH: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  
  // Allowed filter values
  ALLOWED: {
    MONTHS: [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ],
    SEASONS: ['spring', 'summer', 'autumn', 'winter', 'monsoon'],
    STATES: [
      'andhra pradesh', 'assam', 'bihar', 'gujarat', 'karnataka',
      'kerala', 'maharashtra', 'rajasthan', 'tamil nadu', 'uttar pradesh',
      'west bengal', 'himachal pradesh', 'punjab', 'odisha', 'telangana'
    ],
    CATEGORIES: ['festival', 'ritual', 'celebration', 'cultural', 'religious'],
    SORT_OPTIONS: [
      'alphabetical', 'newest', 'oldest', 'region', 'season', 'upcoming'
    ]
  }
};