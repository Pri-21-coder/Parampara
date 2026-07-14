/**
 * Check-In Module Configuration
 * Centralized configuration for check-in and badge functionality
 */

module.exports = {
  // Village name validation
  VILLAGE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  
  // Coordinate precision
  COORDINATE: {
    PRECISION: 6
  },
  
  // Badge definitions
  BADGES: {
    NAMES: {
      FIRST_EXPLORER: 'First Explorer',
      VILLAGE_EXPLORER: 'Village Explorer',
      MASTER_EXPLORER: 'Master Explorer',
      STREAK_MASTER: 'Streak Master',
      DEDICATED_EXPLORER: 'Dedicated Explorer'
    },
    // Optional: Badge criteria for future use
    CRITERIA: {
      FIRST_EXPLORER: {
        description: 'First check-in at any village',
        icon: '🌟',
        requirement: '1 check-in'
      },
      VILLAGE_EXPLORER: {
        description: 'Explored 5 different villages',
        icon: '🏘️',
        requirement: '5 unique villages'
      },
      MASTER_EXPLORER: {
        description: 'Explored 10 different villages',
        icon: '👑',
        requirement: '10 unique villages'
      },
      STREAK_MASTER: {
        description: 'Check-in streak of 5 days',
        icon: '🔥',
        requirement: '5 day streak'
      },
      DEDICATED_EXPLORER: {
        description: 'Check-in streak of 10 days',
        icon: '💪',
        requirement: '10 day streak'
      }
    }
  },
  
  // Additional check-in settings
  CHECKIN: {
    MAX_DAILY_LIMIT: 10,
    STREAK_RESET_DAYS: 1,
    COOLDOWN_HOURS: 24,
    DUPLICATE_CHECKIN_HOURS: 24
  }
};