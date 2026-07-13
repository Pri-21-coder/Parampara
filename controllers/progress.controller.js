const store = require('../data/store');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const ALLOWED_PROGRESS_FIELDS = new Set(['badges', 'quests', 'checkIns', 'achievements', 'stats']);
const MAX_BADGES = 100;
const MAX_QUESTS = 50;
const MAX_CHECKINS = 1000;
const MAX_BADGE_NAME_LENGTH = 100;
const MAX_BADGE_DESC_LENGTH = 500;
const MAX_QUEST_TITLE_LENGTH = 200;
const MAX_QUEST_DESC_LENGTH = 1000;
const MAX_VILLAGE_LENGTH = 200;

const ALLOWED_QUEST_STATUSES = ['pending', 'active', 'completed', 'failed'];
const ALLOWED_BADGE_TYPES = ['exploration', 'streak', 'quest', 'special'];

function validateUserId(userId) {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return { valid: false, error: 'userId is required and must be a non-empty string' };
  }
  return { valid: true, value: userId.trim() };
}

function validateBadge(badge) {
  const errors = [];

  if (!badge.name || typeof badge.name !== 'string' || badge.name.trim().length === 0) {
    errors.push('Badge name is required');
  } else if (badge.name.length > MAX_BADGE_NAME_LENGTH) {
    errors.push(`Badge name cannot exceed ${MAX_BADGE_NAME_LENGTH} characters`);
  }

  if (!badge.description || typeof badge.description !== 'string' || badge.description.trim().length === 0) {
    errors.push('Badge description is required');
  } else if (badge.description.length > MAX_BADGE_DESC_LENGTH) {
    errors.push(`Badge description cannot exceed ${MAX_BADGE_DESC_LENGTH} characters`);
  }

  if (badge.type && !ALLOWED_BADGE_TYPES.includes(badge.type)) {
    errors.push(`Badge type must be one of: ${ALLOWED_BADGE_TYPES.join(', ')}`);
  }

  if (badge.name && /[<>{}]/.test(badge.name)) {
    errors.push('Badge name contains invalid characters');
  }
  if (badge.description && /[<>{}]/.test(badge.description)) {
    errors.push('Badge description contains invalid characters');
  }

  return { valid: errors.length === 0, errors };
}

function validateQuest(quest) {
  const errors = [];

  if (!quest.title || typeof quest.title !== 'string' || quest.title.trim().length === 0) {
    errors.push('Quest title is required');
  } else if (quest.title.length > MAX_QUEST_TITLE_LENGTH) {
    errors.push(`Quest title cannot exceed ${MAX_QUEST_TITLE_LENGTH} characters`);
  }

  if (!quest.description || typeof quest.description !== 'string' || quest.description.trim().length === 0) {
    errors.push('Quest description is required');
  } else if (quest.description.length > MAX_QUEST_DESC_LENGTH) {
    errors.push(`Quest description cannot exceed ${MAX_QUEST_DESC_LENGTH} characters`);
  }

  if (quest.status && !ALLOWED_QUEST_STATUSES.includes(quest.status)) {
    errors.push(`Quest status must be one of: ${ALLOWED_QUEST_STATUSES.join(', ')}`);
  }

  if (quest.points !== undefined && (typeof quest.points !== 'number' || quest.points < 0)) {
    errors.push('Quest points must be a positive number');
  }

  if (quest.title && /[<>{}]/.test(quest.title)) {
    errors.push('Quest title contains invalid characters');
  }
  if (quest.description && /[<>{}]/.test(quest.description)) {
    errors.push('Quest description contains invalid characters');
  }

  return { valid: errors.length === 0, errors };
}

function validateCheckIn(checkIn) {
  const errors = [];

  if (!checkIn.village || typeof checkIn.village !== 'string' || checkIn.village.trim().length === 0) {
    errors.push('Village name is required');
  } else if (checkIn.village.length > MAX_VILLAGE_LENGTH) {
    errors.push(`Village name cannot exceed ${MAX_VILLAGE_LENGTH} characters`);
  }

  if (checkIn.coordinates) {
    const { lat, lng } = checkIn.coordinates;
    if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
      errors.push('Latitude must be a number between -90 and 90');
    }
    if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
      errors.push('Longitude must be a number between -180 and 180');
    }
  }

  if (checkIn.village && /[<>{}]/.test(checkIn.village)) {
    errors.push('Village name contains invalid characters');
  }

  return { valid: errors.length === 0, errors };
}

const createDefaultProgress = () => ({
  badges: [],
  quests: [],
  checkIns: [],
  achievements: [],
  stats: {
    totalCheckIns: 0,
    uniqueVillages: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalQuests: 0,
    completedQuests: 0,
    totalBadges: 0
  },
  lastUpdated: new Date().toISOString()
});

function calculateStats(progress) {
  const checkIns = progress.checkIns || [];
  const badges = progress.badges || [];
  const quests = progress.quests || [];

  const uniqueVillages = new Set(checkIns.map(c => c.village));

  let currentStreak = 0;
  let longestStreak = 0;

  if (checkIns.length > 0) {
    const sorted = [...checkIns].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1].timestamp);
      const curr = new Date(sorted[i].timestamp);
      const diffDays = (prev - curr) / (1000 * 60 * 60 * 24);

      if (diffDays <= 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        break;
      }
    }

    currentStreak = streak;
    longestStreak = maxStreak;
  }

  return {
    totalCheckIns: checkIns.length,
    uniqueVillages: uniqueVillages.size,
    currentStreak,
    longestStreak,
    totalQuests: quests.length,
    completedQuests: quests.filter(q => q.status === 'completed').length,
    totalBadges: badges.length
  };
}

const getProgress = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    if (!store.userProgress[userId]) {
      store.userProgress[userId] = createDefaultProgress();
    }

    const progress = store.userProgress[userId];
    const stats = calculateStats(progress);

    logger.info(`Progress fetched for user: ${userId}`);

    res.json({
      success: true,
      data: { ...progress, stats }
    });

  } catch (error) {
    logger.error('[Progress] Get error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateProgress = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const payload = req.body;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        error: 'Progress update payload must be an object.'
      });
    }

    const incomingKeys = Object.keys(payload);
    const unsupportedKeys = incomingKeys.filter(key => !ALLOWED_PROGRESS_FIELDS.has(key));

    if (unsupportedKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Unsupported progress fields: ${unsupportedKeys.join(', ')}`,
        supportedFields: Array.from(ALLOWED_PROGRESS_FIELDS)
      });
    }

    for (const key of incomingKeys) {
      if (!Array.isArray(payload[key])) {
        return res.status(400).json({
          success: false,
          error: `Field "${key}" must be an array.`
        });
      }

      const validationErrors = [];
      for (const item of payload[key]) {
        if (key === 'badges') {
          const result = validateBadge(item);
          if (!result.valid) {
            validationErrors.push(...result.errors.map(e => ({ field: key, error: e })));
          }
        } else if (key === 'quests') {
          const result = validateQuest(item);
          if (!result.valid) {
            validationErrors.push(...result.errors.map(e => ({ field: key, error: e })));
          }
        } else if (key === 'checkIns') {
          const result = validateCheckIn(item);
          if (!result.valid) {
            validationErrors.push(...result.errors.map(e => ({ field: key, error: e })));
          }
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed for one or more items',
          details: validationErrors
        });
      }

      if (key === 'badges' && payload[key].length > MAX_BADGES) {
        return res.status(400).json({
          success: false,
          error: `Maximum ${MAX_BADGES} badges allowed`
        });
      }
      if (key === 'quests' && payload[key].length > MAX_QUESTS) {
        return res.status(400).json({
          success: false,
          error: `Maximum ${MAX_QUESTS} quests allowed`
        });
      }
      if (key === 'checkIns' && payload[key].length > MAX_CHECKINS) {
        return res.status(400).json({
          success: false,
          error: `Maximum ${MAX_CHECKINS} check-ins allowed`
        });
      }
    }

    if (!store.userProgress[userId]) {
      store.userProgress[userId] = createDefaultProgress();
    }

    store.userProgress[userId] = {
      ...store.userProgress[userId],
      ...payload,
      lastUpdated: new Date().toISOString()
    };

    const stats = calculateStats(store.userProgress[userId]);

    logger.info(`Progress updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { ...store.userProgress[userId], stats }
    });

  } catch (error) {
    logger.error('[Progress] Update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const addBadge = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const badge = req.body;
    const validation = validateBadge(badge);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid badge data',
        details: validation.errors
      });
    }

    if (!store.userProgress[userId]) {
      store.userProgress[userId] = createDefaultProgress();
    }

    const duplicate = store.userProgress[userId].badges.find(b => b.name === badge.name);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: 'Badge already exists',
        existingBadge: duplicate
      });
    }

    if (store.userProgress[userId].badges.length >= MAX_BADGES) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${MAX_BADGES} badges allowed`
      });
    }

    const newBadge = {
      id: uuidv4(),
      name: badge.name.trim(),
      description: badge.description.trim(),
      type: badge.type || 'achievement',
      date: new Date().toISOString()
    };

    store.userProgress[userId].badges.push(newBadge);
    store.userProgress[userId].lastUpdated = new Date().toISOString();

    logger.info(`Badge added for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Badge added successfully',
      data: newBadge
    });

  } catch (error) {
    logger.error('[Progress] Add badge error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const addQuest = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const quest = req.body;
    const validation = validateQuest(quest);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quest data',
        details: validation.errors
      });
    }

    if (!store.userProgress[userId]) {
      store.userProgress[userId] = createDefaultProgress();
    }

    const duplicate = store.userProgress[userId].quests.find(q => q.title === quest.title);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: 'Quest already exists',
        existingQuest: duplicate
      });
    }

    if (store.userProgress[userId].quests.length >= MAX_QUESTS) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${MAX_QUESTS} quests allowed`
      });
    }

    const newQuest = {
      id: uuidv4(),
      title: quest.title.trim(),
      description: quest.description.trim(),
      status: quest.status || 'pending',
      points: quest.points || 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.userProgress[userId].quests.push(newQuest);
    store.userProgress[userId].lastUpdated = new Date().toISOString();

    logger.info(`Quest added for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Quest added successfully',
      data: newQuest
    });

  } catch (error) {
    logger.error('[Progress] Add quest error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const addCheckIn = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const checkIn = req.body;
    const validation = validateCheckIn(checkIn);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid check-in data',
        details: validation.errors
      });
    }

    if (!store.userProgress[userId]) {
      store.userProgress[userId] = createDefaultProgress();
    }

    if (store.userProgress[userId].checkIns.length >= MAX_CHECKINS) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${MAX_CHECKINS} check-ins allowed`
      });
    }

    const newCheckIn = {
      id: uuidv4(),
      village: checkIn.village.trim(),
      coordinates: checkIn.coordinates || null,
      timestamp: new Date().toISOString()
    };

    store.userProgress[userId].checkIns.push(newCheckIn);
    store.userProgress[userId].lastUpdated = new Date().toISOString();

    logger.info(`Check-in added for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Check-in added successfully',
      data: newCheckIn
    });

  } catch (error) {
    logger.error('[Progress] Add check-in error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const removeBadge = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const badgeId = req.params.badgeId;

    if (!store.userProgress[userId]) {
      return res.status(404).json({
        success: false,
        error: 'User progress not found'
      });
    }

    const index = store.userProgress[userId].badges.findIndex(b => b.id === badgeId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Badge not found'
      });
    }

    store.userProgress[userId].badges.splice(index, 1);
    store.userProgress[userId].lastUpdated = new Date().toISOString();

    logger.info(`Badge removed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Badge removed successfully'
    });

  } catch (error) {
    logger.error('[Progress] Remove badge error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const removeQuest = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const questId = req.params.questId;

    if (!store.userProgress[userId]) {
      return res.status(404).json({
        success: false,
        error: 'User progress not found'
      });
    }

    const index = store.userProgress[userId].quests.findIndex(q => q.id === questId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Quest not found'
      });
    }

    store.userProgress[userId].quests.splice(index, 1);
    store.userProgress[userId].lastUpdated = new Date().toISOString();

    logger.info(`Quest removed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Quest removed successfully'
    });

  } catch (error) {
    logger.error('[Progress] Remove quest error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateQuestStatus = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    const questId = req.params.questId;
    const { status, progress } = req.body;

    if (!status && progress === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Status or progress must be provided'
      });
    }

    if (status && !ALLOWED_QUEST_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${ALLOWED_QUEST_STATUSES.join(', ')}`
      });
    }

    if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100'
      });
    }

    if (!store.userProgress[userId]) {
      return res.status(404).json({
        success: false,
        error: 'User progress not found'
      });
    }

    const quest = store.userProgress[userId].quests.find(q => q.id === questId);
    if (!quest) {
      return res.status(404).json({
        success: false,
        error: 'Quest not found'
      });
    }

    if (status) quest.status = status;
    if (progress !== undefined) quest.progress = progress;
    quest.updatedAt = new Date().toISOString();
    store.userProgress[userId].lastUpdated = new Date().toISOString();

    logger.info(`Quest updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'Quest updated successfully',
      data: quest
    });

  } catch (error) {
    logger.error('[Progress] Update quest error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getStats = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    if (!store.userProgress[userId]) {
      return res.json({
        success: true,
        data: {
          totalCheckIns: 0,
          uniqueVillages: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalQuests: 0,
          completedQuests: 0,
          totalBadges: 0
        }
      });
    }

    const stats = calculateStats(store.userProgress[userId]);

    logger.info(`Stats fetched for user: ${userId}`);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('[Progress] Stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const clearProgress = (req, res) => {
  try {
    const userIdValidation = validateUserId(req.params.userId);
    if (!userIdValidation.valid) {
      return res.status(400).json({ success: false, error: userIdValidation.error });
    }
    const userId = userIdValidation.value;

    if (store.userProgress[userId]) {
      store.userProgress[userId] = createDefaultProgress();
    }

    logger.info(`Progress cleared for user: ${userId}`);

    res.json({
      success: true,
      message: 'Progress cleared successfully',
      data: createDefaultProgress()
    });

  } catch (error) {
    logger.error('[Progress] Clear error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  getProgress,
  updateProgress,
  addBadge,
  addQuest,
  addCheckIn,
  removeBadge,
  removeQuest,
  updateQuestStatus,
  getStats,
  clearProgress
};