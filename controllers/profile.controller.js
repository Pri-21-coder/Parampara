const store = require('../data/store');
const GamificationService = require('../server/services/gamificationService');
const { verifyToken } = require('../utils/jwt');

let gamificationService = null;
const getGamificationService = () => {
  if (!gamificationService) {
    gamificationService = new GamificationService();
  }
  return gamificationService;
};

/**
 * Resolve user ID from request query parameter, JWT token, or default fallback
 */
const resolveUserId = (req) => {
  if (req.query.userId) {
    return String(req.query.userId).trim();
  }
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        return decoded.id;
      }
    } catch (e) {
      // Ignore token decode error and fall back
    }
  }
  
  return 'visitor1'; // Default fallback
};

/**
 * Helper to determine region from location names
 */
const getRegionForLocation = (locationName) => {
  if (!locationName) return 'General';
  const nameLower = locationName.toLowerCase();
  if (nameLower.includes('bengal') || nameLower.includes('west bengal') || nameLower.includes('kolkata') || nameLower.includes('shantiniketan')) return 'West Bengal';
  if (nameLower.includes('bihar') || nameLower.includes('mithila') || nameLower.includes('madhubani') || nameLower.includes('darbhanga')) return 'Bihar';
  if (nameLower.includes('rajasthan') || nameLower.includes('jodhpur') || nameLower.includes('jaipur')) return 'Rajasthan';
  if (nameLower.includes('chhattisgarh') || nameLower.includes('bastar') || nameLower.includes('kondagaon')) return 'Chhattisgarh';
  if (nameLower.includes('pradesh') || nameLower.includes('khurja')) return 'Uttar Pradesh';
  return 'General';
};

/**
 * GET /api/profile
 */
const getProfile = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    
    // Check if user exists in the system (we check if user exists in store.users or progress is tracked)
    let userExists = false;
    if (store.users && typeof store.users.has === 'function') {
      userExists = store.users.has(userId);
    } else if (store.users && store.users[userId]) {
      userExists = true;
    }
    
    // Also consider it exists if there's tracking progress for it
    if (store.userProgress && store.userProgress[userId]) {
      userExists = true;
    }

    if (!userExists && userId !== 'visitor1' && !userId.startsWith('user_')) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found.'
      });
    }

    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    
    if (!progress.joinDate) {
      progress.joinDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    // Calculate Rank
    const points = progress.points || 0;
    let rank = 'Novice Explorer';
    if (points >= 1000) rank = 'Heritage Guardian';
    else if (points >= 600) rank = 'Tradition Keeper';
    else if (points >= 300) rank = 'Heritage Archivist';
    else if (points >= 100) rank = 'Cultural Seeker';
    
    res.json({
      success: true,
      profile: {
        userId: progress.userId || userId,
        avatar: progress.avatar || '🧑‍🚀',
        bio: progress.bio || 'Passionate preserver of rural traditions and folk arts.',
        level: progress.level || 1,
        points: points,
        rank: rank,
        joinDate: progress.joinDate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/profile
 */
const updateProfile = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    const { avatar, bio } = req.body;
    
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.trim().length > 10) {
        return res.status(400).json({ success: false, error: 'Invalid avatar format or length (max 10 chars).' });
      }
      progress.avatar = avatar.trim();
    }
    
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        return res.status(400).json({ success: false, error: 'Bio must be a string and under 500 characters.' });
      }
      // Sanitize input to prevent XSS
      progress.bio = bio
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    progress.lastUpdated = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        userId: progress.userId || userId,
        avatar: progress.avatar || '🧑‍🚀',
        bio: progress.bio || '',
        level: progress.level || 1,
        points: progress.points || 0,
        joinDate: progress.joinDate || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profile/stats
 */
const getProfileStats = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    const stats = progress.stats || {};
    
    res.json({
      success: true,
      stats: {
        villagesExplored: stats.villages_explored || 0,
        storiesListened: stats.stories_read || 0,
        craftsDiscovered: stats.crafts_discovered || 0,
        festivalsLearned: stats.festivals_learned || 0,
        pathsCompleted: stats.paths_completed || 0,
        natureVisited: stats.nature_visited || 0,
        artifactsExplored: stats.artifacts_explored || 0,
        questsCompleted: stats.quests_completed || 0,
        badgesEarned: progress.badges ? progress.badges.length : 0,
        gpsCheckins: stats.gps_checkins || 0,
        responsibleVisits: stats.responsible_visits || 0,
        audioPlayed: stats.audio_played || 0,
        aiConversations: stats.ai_conversations || 0,
        explorationTime: stats.exploration_time || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profile/badges
 */
const getProfileBadges = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    const allBadges = service.badges;
    
    const earnedIds = progress.badges.map(b => typeof b === 'string' ? b : b.id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    let badgesData = allBadges.map(badge => {
      const isEarned = earnedIds.includes(badge.id);
      const earnedInfo = isEarned ? (progress.badges.find(b => typeof b === 'string' ? b === badge.id : b.id === badge.id) || {}) : null;
      
      let requirementProgress = 0;
      if (isEarned) {
        requirementProgress = 100;
      } else {
        const stats = progress.stats || {};
        switch (badge.id) {
          case 'badge_1': requirementProgress = Math.min((stats.sites_visited / 1) * 100, 99); break;
          case 'badge_2': requirementProgress = Math.min((stats.sites_visited / 5) * 100, 99); break;
          case 'badge_3': requirementProgress = Math.min((stats.sites_visited / 10) * 100, 99); break;
          case 'badge_4': requirementProgress = Math.min((stats.sites_visited / 25) * 100, 99); break;
          case 'badge_5': requirementProgress = Math.min((stats.sites_visited / 50) * 100, 99); break;
          case 'badge_6': requirementProgress = Math.min((stats.stories_read / 10) * 100, 99); break;
          case 'badge_7': requirementProgress = Math.min((stats.stories_read / 25) * 100, 99); break;
          case 'badge_8': requirementProgress = Math.min((stats.stories_read / 50) * 100, 99); break;
          case 'badge_9': requirementProgress = Math.min((stats.stories_read / 100) * 100, 99); break;
          case 'badge_10': requirementProgress = Math.min((stats.stories_read / 200) * 100, 99); break;
          case 'badge_11': requirementProgress = Math.min((stats.stories_added / 1) * 100, 99); break;
          case 'badge_12': requirementProgress = Math.min((stats.stories_added / 5) * 100, 99); break;
          case 'badge_13': requirementProgress = Math.min((stats.stories_added / 10) * 100, 99); break;
          case 'badge_14': requirementProgress = Math.min((stats.stories_added / 25) * 100, 99); break;
          case 'badge_15': requirementProgress = Math.min((stats.upvotes_received / 50) * 100, 99); break;
          case 'badge_17': requirementProgress = Math.min((stats.comments_made / 10) * 100, 99); break;
          case 'badge_18': requirementProgress = Math.min((stats.upvotes_received / 100) * 100, 99); break;
          case 'badge_19': requirementProgress = Math.min((stats.shares / 20) * 100, 99); break;
          case 'badge_20': requirementProgress = Math.min((stats.shares / 50) * 100, 99); break;
          case 'badge_21': requirementProgress = Math.min((stats.quests_completed / 1) * 100, 99); break;
          case 'badge_22': requirementProgress = Math.min((stats.quests_completed / 10) * 100, 99); break;
          case 'badge_23': requirementProgress = Math.min((stats.sites_visited / 100) * 100, 99); break;
          case 'badge_24': requirementProgress = Math.min((stats.stories_added / 50) * 100, 99); break;
          case 'badge_25': requirementProgress = Math.min((earnedIds.length / 25) * 100, 99); break;
          case 'badge_26': requirementProgress = Math.min((stats.weekly_visits / 10) * 100, 99); break;
          case 'badge_27': requirementProgress = Math.min((stats.monthly_stories / 5) * 100, 99); break;
          case 'badge_29': requirementProgress = Math.min((progress.artifacts.length / 10) * 100, 99); break;
          case 'badge_30': requirementProgress = Math.min((earnedIds.length / 30) * 100, 99); break;
          default: requirementProgress = 0;
        }
      }
      
      return {
        id: badge.id,
        name: badge.name,
        category: badge.category,
        points: badge.points,
        icon: badge.icon,
        description: badge.description,
        isEarned,
        unlockedAt: earnedInfo ? earnedInfo.timestamp : null,
        progress: Math.round(requirementProgress)
      };
    });
    
    if (req.query.category) {
      badgesData = badgesData.filter(b => b.category === req.query.category);
    }
    
    // Sort so earned badges come first, then sort by id
    badgesData.sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
    
    const paginated = badgesData.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      badges: paginated,
      totalCount: badgesData.length,
      earnedCount: earnedIds.length,
      page,
      totalPages: Math.ceil(badgesData.length / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profile/timeline
 */
const getProfileTimeline = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    
    let timeline = progress.activityTimeline || [];
    
    // Filters
    if (req.query.region) {
      const regionFilter = String(req.query.region).toLowerCase();
      timeline = timeline.filter(t => t.metadata && t.metadata.region && t.metadata.region.toLowerCase().includes(regionFilter));
    }
    if (req.query.category) {
      const catFilter = String(req.query.category).toLowerCase();
      timeline = timeline.filter(t => t.metadata && t.metadata.category && t.metadata.category.toLowerCase().includes(catFilter));
    }
    if (req.query.type) {
      const typeFilter = String(req.query.type).toLowerCase();
      timeline = timeline.filter(t => t.type === typeFilter);
    }
    if (req.query.startDate) {
      const start = new Date(req.query.startDate);
      if (!isNaN(start.getTime())) {
        timeline = timeline.filter(t => new Date(t.timestamp) >= start);
      }
    }
    if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      if (!isNaN(end.getTime())) {
        timeline = timeline.filter(t => new Date(t.timestamp) <= end);
      }
    }
    
    // Sort chronologically (newest first)
    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginated = timeline.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      timeline: paginated,
      totalCount: timeline.length,
      page,
      totalPages: Math.ceil(timeline.length / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profile/achievements
 */
const getProfileAchievements = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    const stats = progress.stats || {};
    
    const MILESTONES = [
      { id: 'ms_first_village', name: 'First Village', description: 'Explore your first village', check: (stats) => (stats.villages_explored || 0) >= 1, icon: '🏡' },
      { id: 'ms_first_story', name: 'First Story', description: 'Listen to/read your first heritage story', check: (stats) => (stats.stories_read || 0) >= 1, icon: '📖' },
      { id: 'ms_first_festival', name: 'First Festival', description: 'Learn about your first festival', check: (stats) => (stats.festivals_learned || 0) >= 1, icon: '🎉' },
      { id: 'ms_10_villages', name: '10 Villages', description: 'Explore 10 villages', check: (stats) => (stats.villages_explored || 0) >= 10, icon: '🏘️' },
      { id: 'ms_25_villages', name: '25 Villages', description: 'Explore 25 villages', check: (stats) => (stats.villages_explored || 0) >= 25, icon: '🗺️' },
      { id: 'ms_50_villages', name: '50 Villages', description: 'Explore 50 villages', check: (stats) => (stats.villages_explored || 0) >= 50, icon: '🌍' },
      { id: 'ms_master_explorer', name: 'Master Explorer', description: 'Unlock 15 badges and explore 20 villages', check: (stats, progress) => (progress.badges || []).length >= 15 && (stats.villages_explored || 0) >= 20, icon: '👑' },
      { id: 'ms_heritage_guardian', name: 'Heritage Guardian', description: 'Explore 5 sacred natural heritage sites and 5 artifacts', check: (stats) => (stats.nature_visited || 0) >= 5 && (stats.artifacts_explored || 0) >= 5, icon: '🛡️' },
      { id: 'ms_story_collector', name: 'Story Collector', description: 'Listen to/read 30 stories', check: (stats) => (stats.stories_read || 0) >= 30, icon: '📚' },
      { id: 'ms_festival_enthusiast', name: 'Festival Enthusiast', description: 'Learn about 10 festivals', check: (stats) => (stats.festivals_learned || 0) >= 10, icon: '🎭' },
      { id: 'ms_cultural_ambassador', name: 'Cultural Ambassador', description: 'Accumulate 1000 total exploration score', check: (stats, progress) => (progress.points || 0) >= 1000, icon: '🤴' }
    ];
    
    let achievements = MILESTONES.map(m => {
      const isUnlocked = m.check(stats, progress);
      return {
        id: m.id,
        name: m.name,
        description: m.description,
        icon: m.icon,
        isUnlocked
      };
    });
    
    // Filtering by unlocked state if specified
    if (req.query.unlocked === 'true') {
      achievements = achievements.filter(a => a.isUnlocked);
    } else if (req.query.unlocked === 'false') {
      achievements = achievements.filter(a => !a.isUnlocked);
    }
    
    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profile/passport
 */
const getProfilePassport = (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const service = getGamificationService();
    const progress = service.getUserProgress(userId);
    const stats = progress.stats || {};
    
    // Visited villages from timeline/checkins
    const checkIns = progress.checkIns || [];
    const timeline = progress.activityTimeline || [];
    
    // Gather all unique visited villages
    const visitedVillagesSet = new Set();
    const visitedVillagesDetails = [];
    
    // 1. Scan check-ins
    checkIns.forEach(c => {
      const name = typeof c === 'string' ? c : c.name || c.id;
      if (name && !visitedVillagesSet.has(name)) {
        visitedVillagesSet.add(name);
        visitedVillagesDetails.push({
          name,
          timestamp: c.timestamp || new Date().toISOString(),
          region: getRegionForLocation(name)
        });
      }
    });
    
    // 2. Scan timeline for visit actions
    timeline.forEach(t => {
      if ((t.type === 'visit_village' || t.type === 'visit_site') && t.metadata && t.metadata.name) {
        const name = t.metadata.name;
        if (!visitedVillagesSet.has(name)) {
          visitedVillagesSet.add(name);
          visitedVillagesDetails.push({
            name,
            timestamp: t.timestamp,
            region: t.metadata.region || getRegionForLocation(name)
          });
        }
      }
    });
    
    // Regions explored
    const regionsSet = new Set();
    visitedVillagesDetails.forEach(v => {
      regionsSet.add(v.region);
    });
    const regionsExplored = Array.from(regionsSet);
    
    // Categories completed (based on completed activity milestones)
    const categoriesCompleted = [];
    if ((stats.crafts_discovered || 0) >= 3 || (stats.artifacts_explored || 0) >= 3) {
      categoriesCompleted.push({ category: 'Visual Heritage', icon: '🎨', description: 'Explored multiple crafts and artifacts' });
    }
    if ((stats.audio_played || 0) >= 5) {
      categoriesCompleted.push({ category: 'Oral Stories', icon: '🎧', description: 'Listened to audio narrations' });
    }
    if ((stats.stories_read || 0) >= 5) {
      categoriesCompleted.push({ category: 'Living Folklore', icon: '📖', description: 'Read digital heritage histories' });
    }
    if ((stats.nature_visited || 0) >= 1) {
      categoriesCompleted.push({ category: 'Natural Heritage', icon: '🌿', description: 'Visited sacred groves/nature sites' });
    }
    if ((stats.responsible_visits || 0) >= 1) {
      categoriesCompleted.push({ category: 'Responsible Tourism', icon: '🤝', description: 'Interacted with local artisan hosts' });
    }
    
    // Journey Summary
    const points = progress.points || 0;
    let rank = 'Novice Explorer';
    if (points >= 1000) rank = 'Heritage Guardian';
    else if (points >= 600) rank = 'Tradition Keeper';
    else if (points >= 300) rank = 'Heritage Archivist';
    else if (points >= 100) rank = 'Cultural Seeker';
    
    const joinDate = progress.joinDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const journeySummary = `Explorer ${userId} initiated their heritage preservation journey on ${joinDate}. Currently carrying the rank of "${rank}" at level ${progress.level || 1}, they have explored ${visitedVillagesDetails.length} villages across ${regionsExplored.length} unique regions of India, completing ${stats.paths_completed || 0} heritage trails and documenting various living traditions.`;
    
    res.json({
      success: true,
      passport: {
        visitedVillages: visitedVillagesDetails,
        regionsExplored,
        categoriesCompleted,
        checkinsCount: checkIns.length,
        journeySummary
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getProfileStats,
  getProfileBadges,
  getProfileTimeline,
  getProfileAchievements,
  getProfilePassport
};
