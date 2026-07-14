// controllers/checkin.controller.js
const store = require('../data/store');
const checkinConfig = require('../config/checkin.config');
const validators = require('../utils/validators');

// ============================================
// DESTRUCTURE CONFIGURATION
// ============================================

const { VILLAGE, COORDINATE, BADGES, CHECKIN } = checkinConfig;

// ============================================
// HELPER FUNCTIONS (Business Logic)
// ============================================

/**
 * Format coordinates with precision from config
 */
function formatCoordinates(lat, lng) {
  return {
    lat: parseFloat(lat.toFixed(COORDINATE.PRECISION)),
    lng: parseFloat(lng.toFixed(COORDINATE.PRECISION))
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

    // 1. Validate userId using imported validator
    const userIdValidation = validators.validateUserId(userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: userIdValidation.errors
      });
    }
    const validUserId = userIdValidation.value;

    // 2. Validate village using imported validator with config
    const villageValidation = validators.validateVillage(village, { VILLAGE });
    if (!villageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: villageValidation.errors
      });
    }
    const validVillage = villageValidation.value;

    // 3. Validate coordinates using imported validator
    const coordinatesValidation = validators.validateCoordinates(coordinates);
    if (!coordinatesValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: coordinatesValidation.errors
      });
    }
    const validCoordinates = coordinatesValidation.value;

    // Format coordinates with precision
    const formattedCoordinates = formatCoordinates(
      validCoordinates.lat,
      validCoordinates.lng
    );

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
      coordinates: formattedCoordinates,
      timestamp: new Date().toISOString()
    };

    userData.checkIns.push(checkInRecord);
    userData.totalCheckIns = (userData.totalCheckIns || 0) + 1;

    // 7. Award badges using config
    const awardedBadges = [];
    const checkIns = userData.checkIns;
    const uniqueVillages = getUniqueVillagesCount(checkIns);
    const streak = calculateStreak(checkIns);

    const {
      FIRST_EXPLORER,
      VILLAGE_EXPLORER,
      MASTER_EXPLORER,
      STREAK_MASTER,
      DEDICATED_EXPLORER
    } = BADGES.NAMES;

    // First check-in badge
    if (checkIns.length === 1) {
      const badge = awardBadge(
        userData,
        FIRST_EXPLORER,
        'Visited your first village'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Village Explorer badge (5 unique villages)
    if (uniqueVillages === 5) {
      const badge = awardBadge(
        userData,
        VILLAGE_EXPLORER,
        'Visited 5 unique villages'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Master Explorer badge (10 unique villages)
    if (uniqueVillages === 10) {
      const badge = awardBadge(
        userData,
        MASTER_EXPLORER,
        'Visited 10 unique villages'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Streak Master badge (5 consecutive days)
    if (streak === 5) {
      const badge = awardBadge(
        userData,
        STREAK_MASTER,
        'Checked in for 5 consecutive days'
      );
      if (badge) awardedBadges.push(badge);
    }

    // Dedicated Explorer badge (10 consecutive days)
    if (streak === 10) {
      const badge = awardBadge(
        userData,
        DEDICATED_EXPLORER,
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

    // Validate userId using imported validator
    const userIdValidation = validators.validateUserId(userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: userIdValidation.errors
      });
    }
    const validUserId = userIdValidation.value;

    // Validate pagination using imported validator
    const paginationValidation = validators.validatePagination(page, limit, 100);
    if (!paginationValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: paginationValidation.errors
      });
    }
    const { page: parsedPage, limit: parsedLimit } = paginationValidation;

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

    const userIdValidation = validators.validateUserId(userId);
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