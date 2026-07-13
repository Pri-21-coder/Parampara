// controllers/checkin.controller.js
const store = require('../data/store');

// ============================================
// CONSTANTS
// ============================================

const MAX_VILLAGE_LENGTH = 100;
const MIN_VILLAGE_LENGTH = 2;
const COORDINATE_PRECISION = 6;

const BADGE_NAMES = {
  FIRST_EXPLORER: 'First Explorer',
  VILLAGE_EXPLORER: 'Village Explorer',
  MASTER_EXPLORER: 'Master Explorer',
  STREAK_MASTER: 'Streak Master',
  DEDICATED_EXPLORER: 'Dedicated Explorer'
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate userId
 */
function validateUserId(userId) {
  const errors = [];

  if (!userId || typeof userId !== 'string') {
    errors.push('userId is required and must be a string.');
    return { valid: false, errors };
  }

  const trimmed = userId.trim();
  if (trimmed.length === 0) {
    errors.push('userId cannot be empty or only whitespace.');
  }

  // Check for dangerous characters (XSS protection)
  if (/[<>{}]/.test(trimmed)) {
    errors.push('userId contains invalid characters.');
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors
  };
}

/**
 * Validate village name
 */
function validateVillage(village) {
  const errors = [];

  if (!village || typeof village !== 'string') {
    errors.push('village is required and must be a string.');
    return { valid: false, errors };
  }

  const trimmed = village.trim();
  if (trimmed.length === 0) {
    errors.push('village cannot be empty or only whitespace.');
  }

  if (trimmed.length < MIN_VILLAGE_LENGTH) {
    errors.push(`village name must be at least ${MIN_VILLAGE_LENGTH} characters.`);
  }

  if (trimmed.length > MAX_VILLAGE_LENGTH) {
    errors.push(`village name cannot exceed ${MAX_VILLAGE_LENGTH} characters.`);
  }

  // Check for dangerous characters (XSS protection)
  if (/[<>{}]/.test(trimmed)) {
    errors.push('village name contains invalid characters.');
  }

  return {
    valid: errors.length === 0,
    value: trimmed,
    errors
  };
}

/**
 * Validate coordinates
 */
function validateCoordinates(coordinates) {
  const errors = [];

  if (!coordinates || typeof coordinates !== 'object' || Array.isArray(coordinates)) {
    errors.push('coordinates are required and must be an object.');
    return { valid: false, errors };
  }

  const { lat, lng } = coordinates;

  // Validate latitude
  if (lat === undefined || lat === null) {
    errors.push('latitude is required.');
  } else if (typeof lat !== 'number') {
    errors.push('latitude must be a number.');
  } else if (isNaN(lat)) {
    errors.push('latitude must be a valid number.');
  } else if (lat < -90 || lat > 90) {
    errors.push('latitude must be between -90 and 90.');
  }

  // Validate longitude
  if (lng === undefined || lng === null) {
    errors.push('longitude is required.');
  } else if (typeof lng !== 'number') {
    errors.push('longitude must be a number.');
  } else if (isNaN(lng)) {
    errors.push('longitude must be a valid number.');
  } else if (lng < -180 || lng > 180) {
    errors.push('longitude must be between -180 and 180.');
  }

  return {
    valid: errors.length === 0,
    value: { lat, lng },
    errors
  };
}

/**
 * Check if user already checked in this village in last 24 hours
 */
function isDuplicateCheckIn(userId, village) {
  const userData = store.userProgress[userId];
  if (!userData || !userData.checkIns || userData.checkIns.length === 0) {
    return false;
  }

  const now = new Date();
  const lastCheckIn = userData.checkIns[userData.checkIns.length - 1];

  if (!lastCheckIn || !lastCheckIn.timestamp) {
    return false;
  }

  const lastTime = new Date(lastCheckIn.timestamp);
  const hoursDiff = (now - lastTime) / (1000 * 60 * 60);

  return hoursDiff < 24 && lastCheckIn.village === village;
}

/**
 * Calculate check-in streak
 */
function calculateStreak(checkIns) {
  if (!checkIns || checkIns.length === 0) return 0;

  const sorted = [...checkIns].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].timestamp);
    const curr = new Date(sorted[i].timestamp);
    const diffDays = (prev - curr) / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get unique villages count
 */
function getUniqueVillagesCount(checkIns) {
  if (!checkIns || checkIns.length === 0) return 0;
  const villages = new Set(checkIns.map(c => c.village));
  return villages.size;
}

/**
 * Check if user has a specific badge
 */
function hasBadge(userData, badgeName) {
  if (!userData || !userData.badges) return false;
  return userData.badges.some(b => b.name === badgeName);
}

/**
 * Award badge to user
 */
function awardBadge(userData, badgeName, description) {
  if (!userData || hasBadge(userData, badgeName)) return null;

  const badge = {
    name: badgeName,
    description: description,
    date: new Date().toISOString(),
    type: 'achievement'
  };

  userData.badges.push(badge);
  return badge;
}

// ============================================
// MAIN CONTROLLER
// ============================================

const checkIn = (req, res) => {
  try {
    const { userId, village, coordinates } = req.body;

    // 1. Validate userId
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: userIdValidation.errors
      });
    }
    const validUserId = userIdValidation.value;

    // 2. Validate village
    const villageValidation = validateVillage(village);
    if (!villageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: villageValidation.errors
      });
    }
    const validVillage = villageValidation.value;

    // 3. Validate coordinates
    const coordinatesValidation = validateCoordinates(coordinates);
    if (!coordinatesValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: coordinatesValidation.errors
      });
    }
    const validCoordinates = coordinatesValidation.value;

    // 4. Initialize user progress if not exists
    if (!store.userProgress[validUserId]) {
      store.userProgress[validUserId] = {
        badges: [],
        quests: [],
        checkIns: [],
        totalCheckIns: 0,
        createdAt: new Date().toISOString()
      };
    }

    const userData = store.userProgress[validUserId];

    // 5. Check for duplicate check-in (same village within 24 hours)
    if (isDuplicateCheckIn(validUserId, validVillage)) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate check-in',
        message: 'You have already checked in to this village within the last 24 hours.'
      });
    }

    // 6. Create check-in record
    const checkInRecord = {
      id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      village: validVillage,
      coordinates: validCoordinates,
      timestamp: new Date().toISOString()
    };

    userData.checkIns.push(checkInRecord);
    userData.totalCheckIns = (userData.totalCheckIns || 0) + 1;

    // 7. Award badges
    const awardedBadges = [];
    const checkIns = userData.checkIns;
    const uniqueVillages = getUniqueVillagesCount(checkIns);
    const streak = calculateStreak(checkIns);

    // First check-in badge
    if (checkIns.length === 1) {
      const badge = awardBadge(
        userData,
        BADGE_NAMES.FIRST_EXPLORER,
        'Visited your first village'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Village Explorer badge (5 unique villages)
    if (uniqueVillages === 5) {
      const badge = awardBadge(
        userData,
        BADGE_NAMES.VILLAGE_EXPLORER,
        'Visited 5 unique villages'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Master Explorer badge (10 unique villages)
    if (uniqueVillages === 10) {
      const badge = awardBadge(
        userData,
        BADGE_NAMES.MASTER_EXPLORER,
        'Visited 10 unique villages'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Streak Master badge (5 consecutive days)
    if (streak === 5) {
      const badge = awardBadge(
        userData,
        BADGE_NAMES.STREAK_MASTER,
        'Checked in for 5 consecutive days'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Dedicated Explorer badge (10 consecutive days)
    if (streak === 10) {
      const badge = awardBadge(
        userData,
        BADGE_NAMES.DEDICATED_EXPLORER,
        'Checked in for 10 consecutive days'
      );
      if (badge) awardedBadges.push(badge);
    }

    // 8. Build response
    const response = {
      success: true,
      message: 'Check-in successful',
      checkIn: checkInRecord,
      badges: userData.badges,
      newBadges: awardedBadges,
      stats: {
        totalCheckIns: userData.totalCheckIns,
        uniqueVillages: uniqueVillages,
        currentStreak: streak
      }
    };

    // Add warnings if any
    const warnings = [];
    if (!req.body.userId || typeof req.body.userId !== 'string') {
      warnings.push('userId was trimmed or sanitized.');
    }
    if (!req.body.village || typeof req.body.village !== 'string') {
      warnings.push('village was trimmed or sanitized.');
    }
    if (warnings.length > 0) {
      response.warnings = warnings;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('[CheckIn] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/checkin/history/:userId
 * Get check-in history with pagination
 */
const getCheckInHistory = (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: userIdValidation.errors
      });
    }
    const validUserId = userIdValidation.value;

    // Validate pagination
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        error: 'Page must be a positive integer'
      });
    }

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    const userData = store.userProgress[validUserId];
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No check-in history found for this user'
      });
    }

    const checkIns = userData.checkIns || [];
    const totalCount = checkIns.length;
    const totalPages = Math.ceil(totalCount / parsedLimit);
    const startIndex = (parsedPage - 1) * parsedLimit;
    const endIndex = Math.min(startIndex + parsedLimit, totalCount);
    const paginatedCheckIns = checkIns.slice(startIndex, endIndex);

    // Calculate stats
    const uniqueVillages = getUniqueVillagesCount(checkIns);
    const streak = calculateStreak(checkIns);

    res.json({
      success: true,
      data: {
        checkIns: paginatedCheckIns,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total: totalCount,
          totalPages,
          hasNext: parsedPage < totalPages,
          hasPrev: parsedPage > 1
        },
        stats: {
          totalCheckIns: userData.totalCheckIns || 0,
          uniqueVillages: uniqueVillages,
          currentStreak: streak,
          totalBadges: userData.badges ? userData.badges.length : 0
        }
      }
    });

  } catch (error) {
    console.error('[CheckIn] History error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/checkin/stats/:userId
 * Get check-in statistics for a user
 */
const getCheckInStats = (req, res) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: userIdValidation.errors
      });
    }
    const validUserId = userIdValidation.value;

    const userData = store.userProgress[validUserId];
    if (!userData) {
      return res.json({
        success: true,
        data: {
          totalCheckIns: 0,
          uniqueVillages: 0,
          currentStreak: 0,
          totalBadges: 0,
          badges: []
        }
      });
    }

    const checkIns = userData.checkIns || [];
    const uniqueVillages = getUniqueVillagesCount(checkIns);
    const streak = calculateStreak(checkIns);

    res.json({
      success: true,
      data: {
        totalCheckIns: userData.totalCheckIns || 0,
        uniqueVillages: uniqueVillages,
        currentStreak: streak,
        totalBadges: userData.badges ? userData.badges.length : 0,
        badges: userData.badges || []
      }
    });

  } catch (error) {
    console.error('[CheckIn] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  checkIn,
  getCheckInHistory,
  getCheckInStats
};