// services/gamificationService.js
const store = require('../../data/store');

class GamificationService {
  constructor() {
    this.badges = [];
    this.challenges = [];
    this.leaderboards = new Map();
    this.digitalArtifacts = new Map();
    
    this.init();
  }

  init() {
    this.initBadges();
    this.initChallenges();
    this.initDigitalArtifacts();
    console.log('✅ Gamification Service initialized');
  }

  /**
   * Initialize 50+ achievement badges
   */
  initBadges() {
    this.badges = [
      // Exploration Badges (1-10)
      { id: 'badge_1', name: 'Heritage Explorer', category: 'exploration', points: 10, icon: '🗺️', description: 'Complete your first heritage trail' },
      { id: 'badge_2', name: 'Cultural Wanderer', category: 'exploration', points: 20, icon: '🚶', description: 'Visit 5 cultural sites' },
      { id: 'badge_3', name: 'Trail Blazer', category: 'exploration', points: 30, icon: '🏔️', description: 'Complete 10 heritage trails' },
      { id: 'badge_4', name: 'Heritage Seeker', category: 'exploration', points: 40, icon: '🔍', description: 'Visit 25 cultural sites' },
      { id: 'badge_5', name: 'Cultural Nomad', category: 'exploration', points: 50, icon: '🌍', description: 'Visit sites in 5 different regions' },
      
      // Learning Badges (11-20)
      { id: 'badge_6', name: 'Story Collector', category: 'learning', points: 15, icon: '📖', description: 'Read 10 heritage stories' },
      { id: 'badge_7', name: 'Knowledge Seeker', category: 'learning', points: 25, icon: '🧠', description: 'Complete 5 cultural quizzes' },
      { id: 'badge_8', name: 'Cultural Scholar', category: 'learning', points: 35, icon: '🎓', description: 'Read 50 heritage stories' },
      { id: 'badge_9', name: 'History Buff', category: 'learning', points: 45, icon: '📜', description: 'Complete 20 cultural quizzes' },
      { id: 'badge_10', name: 'Heritage Expert', category: 'learning', points: 60, icon: '🏆', description: 'Read 100 heritage stories' },
      
      // Contribution Badges (21-30)
      { id: 'badge_11', name: 'Contributor', category: 'contribution', points: 20, icon: '✍️', description: 'Add your first cultural story' },
      { id: 'badge_12', name: 'Culture Keeper', category: 'contribution', points: 30, icon: '🛡️', description: 'Add 5 cultural stories' },
      { id: 'badge_13', name: 'Heritage Guardian', category: 'contribution', points: 40, icon: '🏰', description: 'Add 10 cultural stories' },
      { id: 'badge_14', name: 'Artisan Advocate', category: 'contribution', points: 50, icon: '🎨', description: 'Add 5 artisan profiles' },
      { id: 'badge_15', name: 'Community Builder', category: 'contribution', points: 60, icon: '🤝', description: 'Get 50 upvotes on your content' },
      
      // Community Badges (31-40)
      { id: 'badge_16', name: 'Community Member', category: 'community', points: 10, icon: '👥', description: 'Join the Parampara community' },
      { id: 'badge_17', name: 'Active Participant', category: 'community', points: 20, icon: '💬', description: 'Comment on 10 stories' },
      { id: 'badge_18', name: 'Community Leader', category: 'community', points: 30, icon: '🌟', description: 'Get 100 upvotes on your content' },
      { id: 'badge_19', name: 'Social Advocate', category: 'community', points: 40, icon: '📱', description: 'Share 20 cultural stories' },
      { id: 'badge_20', name: 'Cultural Ambassador', category: 'community', points: 50, icon: '🤴', description: 'Refer 10 friends to Parampara' },
      
      // Special Badges (41-50)
      { id: 'badge_21', name: 'Trail Complete', category: 'special', points: 25, icon: '⭐', description: 'Complete your first heritage trail' },
      { id: 'badge_22', name: 'Quest Master', category: 'special', points: 35, icon: '🎯', description: 'Complete 10 quests' },
      { id: 'badge_23', name: 'Legendary Explorer', category: 'special', points: 50, icon: '👑', description: 'Visit 100 cultural sites' },
      { id: 'badge_24', name: 'Master Storyteller', category: 'special', points: 55, icon: '📚', description: 'Add 50 stories' },
      { id: 'badge_25', name: 'Heritage Pioneer', category: 'special', points: 70, icon: '🚀', description: 'Be among the first 100 users' },
      
      // More badges...
      { id: 'badge_26', name: 'Photo Enthusiast', category: 'exploration', points: 15, icon: '📸', description: 'Upload 10 cultural photos' },
      { id: 'badge_27', name: 'Check-in Champion', category: 'exploration', points: 20, icon: '📍', description: 'Check-in at 20 locations' },
      { id: 'badge_28', name: 'Quiz Master', category: 'learning', points: 30, icon: '🏅', description: 'Score 90% on any quiz' },
      { id: 'badge_29', name: 'Artifact Collector', category: 'exploration', points: 25, icon: '💎', description: 'Collect 10 digital artifacts' },
      { id: 'badge_30', name: 'Trail Pioneer', category: 'exploration', points: 40, icon: '🏗️', description: 'Create your own heritage trail' },
      
      // Fill remaining badges up to 50+
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `badge_${31 + i}`,
        name: `Heritage Badge ${31 + i}`,
        category: ['exploration', 'learning', 'contribution', 'community', 'special'][i % 5],
        points: 20 + (i * 2),
        icon: ['🏅', '🎖️', '🥇', '🥈', '🥉'][i % 5],
        description: `Achievement badge #${31 + i}`
      }))
    ];
  }

  /**
   * Initialize challenges
   */
  initChallenges() {
    this.challenges = [
      {
        id: 'challenge_1',
        title: 'Visit 5 Cultural Sites',
        description: 'Visit 5 different cultural sites and check-in',
        type: 'exploration',
        requirement: 5,
        metric: 'sites_visited',
        points: 100,
        badge: 'badge_2',
        daily: true,
        active: true
      },
      {
        id: 'challenge_2',
        title: 'Read 10 Heritage Stories',
        description: 'Read and learn from 10 heritage stories',
        type: 'learning',
        requirement: 10,
        metric: 'stories_read',
        points: 150,
        badge: 'badge_6',
        daily: true,
        active: true
      },
      {
        id: 'challenge_3',
        title: 'Add Your First Story',
        description: 'Contribute by adding your first heritage story',
        type: 'contribution',
        requirement: 1,
        metric: 'stories_added',
        points: 200,
        badge: 'badge_11',
        daily: false,
        active: true
      },
      {
        id: 'challenge_4',
        title: 'Complete 3 Quests',
        description: 'Complete 3 different heritage quests',
        type: 'quest',
        requirement: 3,
        metric: 'quests_completed',
        points: 250,
        badge: 'badge_22',
        daily: false,
        active: true
      },
      {
        id: 'challenge_5',
        title: 'Weekly Explorer',
        description: 'Visit 10 sites this week',
        type: 'exploration',
        requirement: 10,
        metric: 'weekly_visits',
        points: 300,
        badge: 'badge_4',
        daily: false,
        active: true
      },
      {
        id: 'challenge_6',
        title: 'Master Storyteller',
        description: 'Add 5 stories this month',
        type: 'contribution',
        requirement: 5,
        metric: 'monthly_stories',
        points: 400,
        badge: 'badge_13',
        daily: false,
        active: true
      },
      {
        id: 'challenge_7',
        title: 'Cultural Quiz Champion',
        description: 'Score 80% in any 3 quizzes',
        type: 'learning',
        requirement: 3,
        metric: 'quiz_scores',
        points: 200,
        badge: 'badge_28',
        daily: false,
        active: true
      },
      {
        id: 'challenge_8',
        title: 'Social Sharer',
        description: 'Share 5 cultural stories on social media',
        type: 'community',
        requirement: 5,
        metric: 'shares',
        points: 150,
        badge: 'badge_19',
        daily: true,
        active: true
      }
    ];
  }

  /**
   * Initialize digital artifacts
   */
  initDigitalArtifacts() {
    this.digitalArtifacts = new Map([
      ['artifact_1', { id: 'artifact_1', name: 'Ancient Pottery', rarity: 'common', value: 10, image: '🏺' }],
      ['artifact_2', { id: 'artifact_2', name: 'Folk Painting', rarity: 'rare', value: 25, image: '🖼️' }],
      ['artifact_3', { id: 'artifact_3', name: 'Traditional Sculpture', rarity: 'epic', value: 50, image: '🗿' }],
      ['artifact_4', { id: 'artifact_4', name: 'Heritage Coin', rarity: 'legendary', value: 100, image: '🪙' }],
      ['artifact_5', { id: 'artifact_5', name: 'Cultural Manuscript', rarity: 'epic', value: 75, image: '📜' }],
      ['artifact_6', { id: 'artifact_6', name: 'Tribal Mask', rarity: 'rare', value: 30, image: '🎭' }],
      ['artifact_7', { id: 'artifact_7', name: 'Heritage Crown', rarity: 'legendary', value: 200, image: '👑' }],
      ['artifact_8', { id: 'artifact_8', name: 'Cultural Drum', rarity: 'common', value: 15, image: '🥁' }],
      ['artifact_9', { id: 'artifact_9', name: 'Ancient Jewelry', rarity: 'epic', value: 60, image: '💍' }],
      ['artifact_10', { id: 'artifact_10', name: 'Heritage Map', rarity: 'rare', value: 35, image: '🗺️' }]
    ]);
  }

  /**
   * Get user progress from tenant-isolated store
   */
  getUserProgress(userId) {
    if (!store.userProgress) {
      store.userProgress = {};
    }
    
    if (!store.userProgress[userId]) {
      store.userProgress[userId] = {
        userId,
        points: 0,
        level: 1,
        badges: [],
        artifacts: [],
        challenges: [],
        checkIns: [],
        quests: [],
        stats: {
          sites_visited: 0,
          stories_read: 0,
          stories_added: 0,
          quests_completed: 0,
          quizzes_taken: 0,
          shares: 0,
          upvotes_received: 0,
          comments_made: 0,
          weekly_visits: 0,
          monthly_stories: 0,
          villages_explored: 0,
          crafts_discovered: 0,
          festivals_learned: 0,
          paths_completed: 0,
          nature_visited: 0,
          artifacts_explored: 0,
          gps_checkins: 0,
          responsible_visits: 0,
          audio_played: 0,
          ai_conversations: 0,
          exploration_time: 0
        },
        activityTimeline: [],
        lastUpdated: new Date().toISOString()
      };
    }

    const progress = store.userProgress[userId];

    // Ensure all gamification fields are present
    if (!progress.userId) progress.userId = userId;
    if (progress.points === undefined) progress.points = 0;
    if (progress.level === undefined) progress.level = 1;
    if (!progress.badges) progress.badges = [];
    if (!progress.artifacts) progress.artifacts = [];
    if (!progress.challenges) progress.challenges = [];
    if (!progress.checkIns) progress.checkIns = [];
    if (!progress.quests) progress.quests = [];
    if (!progress.activityTimeline) progress.activityTimeline = [];
    if (!progress.lastUpdated) progress.lastUpdated = new Date().toISOString();

    if (!progress.stats) {
      progress.stats = {};
    }

    const defaultStats = {
      sites_visited: 0,
      stories_read: 0,
      stories_added: 0,
      quests_completed: 0,
      quizzes_taken: 0,
      shares: 0,
      upvotes_received: 0,
      comments_made: 0,
      weekly_visits: 0,
      monthly_stories: 0,
      villages_explored: 0,
      crafts_discovered: 0,
      festivals_learned: 0,
      paths_completed: 0,
      nature_visited: 0,
      artifacts_explored: 0,
      gps_checkins: 0,
      responsible_visits: 0,
      audio_played: 0,
      ai_conversations: 0,
      exploration_time: 0
    };

    for (const key in defaultStats) {
      if (progress.stats[key] === undefined) {
        progress.stats[key] = defaultStats[key];
      }
    }

    return progress;
  }

  /**
   * Earn points
   */
  earnPoints(userId, points, source) {
    const progress = this.getUserProgress(userId);
    progress.points = (progress.points || 0) + points;
    progress.lastUpdated = new Date().toISOString();
    
    // Check level up
    const newLevel = Math.floor(progress.points / 100) + 1;
    if (newLevel > progress.level) {
      progress.level = newLevel;
      this.checkBadgeUnlock(userId, 'level_up');
    }
    
    return progress;
  }

  /**
   * Add a timeline event for user
   */
  addTimelineEvent(userId, type, title, description, metadata = {}) {
    const progress = this.getUserProgress(userId);
    if (!progress.activityTimeline) {
      progress.activityTimeline = [];
    }
    progress.activityTimeline.push({
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      metadata: {
        region: metadata.region || metadata.location || 'General',
        category: metadata.category || metadata.type || 'General',
        ...metadata
      }
    });
  }

  /**
   * Track user action
   */
  trackAction(userId, action, metadata = {}) {
    const progress = this.getUserProgress(userId);
    
    // Update stats
    switch (action) {
      case 'visit_site':
        progress.stats.sites_visited++;
        progress.stats.weekly_visits++;
        this.earnPoints(userId, 10, 'site_visit');
        this.addTimelineEvent(userId, 'visit_site', 'Visited Cultural Site', `Visited cultural site: ${metadata.name || 'Unnamed Site'}`, metadata);
        break;
      case 'visit_village':
        progress.stats.villages_explored++;
        progress.stats.sites_visited++;
        progress.stats.weekly_visits++;
        this.earnPoints(userId, 15, 'visit_village');
        this.addTimelineEvent(userId, 'visit_village', 'Explored Village', `Explored village: ${metadata.name || 'Unnamed Village'}`, metadata);
        break;
      case 'read_story':
        progress.stats.stories_read++;
        this.earnPoints(userId, 5, 'read_story');
        this.addTimelineEvent(userId, 'story_complete', 'Read Story', `Read heritage story: ${metadata.name || 'Unnamed Story'}`, metadata);
        break;
      case 'add_story':
        progress.stats.stories_added++;
        progress.stats.monthly_stories++;
        this.earnPoints(userId, 20, 'add_story');
        this.addTimelineEvent(userId, 'story_add', 'Contributed Story', `Added a new cultural story: ${metadata.name || 'Unnamed Story'}`, metadata);
        break;
      case 'complete_quest':
        progress.stats.quests_completed++;
        this.earnPoints(userId, 30, 'complete_quest');
        this.addTimelineEvent(userId, 'quest_complete', 'Completed Quest', `Completed quest: ${metadata.name || 'Unnamed Quest'}`, metadata);
        break;
      case 'take_quiz':
        progress.stats.quizzes_taken++;
        if (metadata.score && metadata.score > 80) {
          this.earnPoints(userId, 15, 'quiz_high_score');
        }
        this.addTimelineEvent(userId, 'take_quiz', 'Completed Quiz', `Completed quiz on ${metadata.topic || 'heritage'} with score ${metadata.score || 0}%`, metadata);
        break;
      case 'share':
        progress.stats.shares++;
        this.earnPoints(userId, 10, 'share');
        this.addTimelineEvent(userId, 'share', 'Shared Content', `Shared a story/path: ${metadata.name || 'Unnamed Item'}`, metadata);
        break;
      case 'upvote':
        progress.stats.upvotes_received++;
        this.earnPoints(userId, 5, 'upvote');
        break;
      case 'comment':
        progress.stats.comments_made++;
        this.earnPoints(userId, 5, 'comment');
        this.addTimelineEvent(userId, 'comment', 'Added Comment', `Commented on: ${metadata.name || 'Unnamed Item'}`, metadata);
        break;
      case 'discover_craft':
        progress.stats.crafts_discovered++;
        this.earnPoints(userId, 15, 'discover_craft');
        this.addTimelineEvent(userId, 'craft_discover', 'Discovered Craft', `Learned about craft: ${metadata.name || 'Unnamed Craft'}`, metadata);
        break;
      case 'learn_festival':
        progress.stats.festivals_learned++;
        this.earnPoints(userId, 15, 'learn_festival');
        this.addTimelineEvent(userId, 'festival_learn', 'Learned Festival', `Explored festival: ${metadata.name || 'Unnamed Festival'}`, metadata);
        break;
      case 'complete_path':
        progress.stats.paths_completed++;
        this.earnPoints(userId, 25, 'complete_path');
        this.addTimelineEvent(userId, 'path_complete', 'Completed Path', `Completed heritage path: ${metadata.name || 'Unnamed Path'}`, metadata);
        break;
      case 'visit_nature':
        progress.stats.nature_visited++;
        this.earnPoints(userId, 20, 'visit_nature');
        this.addTimelineEvent(userId, 'nature_visit', 'Visited Nature Site', `Visited sacred natural heritage site: ${metadata.name || 'Unnamed Site'}`, metadata);
        break;
      case 'explore_artifact':
        progress.stats.artifacts_explored++;
        this.earnPoints(userId, 15, 'explore_artifact');
        this.addTimelineEvent(userId, 'artifact_discover', 'Explored Artifact', `Explored cultural artifact: ${metadata.name || 'Unnamed Artifact'}`, metadata);
        break;
      case 'gps_checkin':
        progress.stats.gps_checkins++;
        const hasCheckin = progress.checkIns && progress.checkIns.some(c => typeof c === 'string' ? c === metadata.locationId : c.id === metadata.locationId);
        if (!hasCheckin && metadata.locationId) {
          if (!progress.checkIns) progress.checkIns = [];
          progress.checkIns.push({ id: metadata.locationId, name: metadata.name, timestamp: new Date().toISOString() });
        }
        this.earnPoints(userId, 15, 'gps_checkin');
        this.addTimelineEvent(userId, 'gps_checkin', 'GPS Check-in Badge', `Checked in at: ${metadata.name || 'Unnamed Location'}`, metadata);
        break;
      case 'responsible_visit':
        progress.stats.responsible_visits++;
        this.earnPoints(userId, 20, 'responsible_visit');
        this.addTimelineEvent(userId, 'responsible_visit', 'Responsible Tourism Visit', `Visited local host responsibly at: ${metadata.name || 'Unnamed Location'}`, metadata);
        break;
      case 'play_audio':
        progress.stats.audio_played++;
        this.earnPoints(userId, 5, 'play_audio');
        this.addTimelineEvent(userId, 'play_audio', 'Listened to Audio Story', `Listened to audio track: ${metadata.name || 'Unnamed Audio'}`, metadata);
        break;
      case 'ai_conversation':
        progress.stats.ai_conversations++;
        this.earnPoints(userId, 5, 'ai_conversation');
        if (progress.stats.ai_conversations % 3 === 1) {
          this.addTimelineEvent(userId, 'ai_conversation', 'AI Curator Conversation', `Spoke with the AI Curator about cultural traditions`, metadata);
        }
        break;
      case 'add_exploration_time':
        const timeToAdd = parseInt(metadata.time) || 1;
        progress.stats.exploration_time += timeToAdd;
        break;
    }
    
    // Update user progress lastUpdated
    progress.lastUpdated = new Date().toISOString();
    
    // Check badge unlocks
    this.checkBadgeUnlock(userId, action, metadata);
    
    // Check challenge progress
    this.updateChallengeProgress(userId, action, metadata);
    
    return progress;
  }

  /**
   * Check badge unlock
   */
  checkBadgeUnlock(userId, action, metadata = {}) {
    const progress = this.getUserProgress(userId);
    let unlocked = [];
    
    this.badges.forEach(badge => {
      const hasBadge = progress.badges.some(b => typeof b === 'string' ? b === badge.id : b.id === badge.id);
      if (hasBadge) return;
      
      if (this.meetsBadgeRequirement(progress, badge, action, metadata)) {
        progress.badges.push({
          id: badge.id,
          name: badge.name,
          icon: badge.icon,
          timestamp: new Date().toISOString()
        });
        this.earnPoints(userId, badge.points, `badge_${badge.id}`);
        unlocked.push(badge);
        
        // Add to activity timeline
        this.addTimelineEvent(userId, 'badge_unlock', `Unlocked Badge: ${badge.name}`, `Earned "${badge.name}" badge (${badge.icon}) for ${badge.description}`, { badgeId: badge.id });
      }
    });
    
    return unlocked;
  }

  /**
   * Check if user meets badge requirement
   */
  meetsBadgeRequirement(progress, badge, action, metadata) {
    const requirements = {
      'badge_1': () => progress.stats.sites_visited >= 1,
      'badge_2': () => progress.stats.sites_visited >= 5,
      'badge_3': () => progress.stats.sites_visited >= 10,
      'badge_4': () => progress.stats.sites_visited >= 25,
      'badge_5': () => progress.stats.sites_visited >= 50,
      'badge_6': () => progress.stats.stories_read >= 10,
      'badge_7': () => progress.stats.stories_read >= 25,
      'badge_8': () => progress.stats.stories_read >= 50,
      'badge_9': () => progress.stats.stories_read >= 100,
      'badge_10': () => progress.stats.stories_read >= 200,
      'badge_11': () => progress.stats.stories_added >= 1,
      'badge_12': () => progress.stats.stories_added >= 5,
      'badge_13': () => progress.stats.stories_added >= 10,
      'badge_14': () => progress.stats.stories_added >= 25,
      'badge_15': () => progress.stats.upvotes_received >= 50,
      'badge_16': () => true,
      'badge_17': () => progress.stats.comments_made >= 10,
      'badge_18': () => progress.stats.upvotes_received >= 100,
      'badge_19': () => progress.stats.shares >= 20,
      'badge_20': () => progress.stats.shares >= 50,
      'badge_21': () => progress.stats.quests_completed >= 1,
      'badge_22': () => progress.stats.quests_completed >= 10,
      'badge_23': () => progress.stats.sites_visited >= 100,
      'badge_24': () => progress.stats.stories_added >= 50,
      'badge_25': () => progress.badges.length >= 25,
      'badge_26': () => progress.stats.weekly_visits >= 10,
      'badge_27': () => progress.stats.monthly_stories >= 5,
      'badge_28': () => metadata.score && metadata.score >= 90,
      'badge_29': () => progress.artifacts.length >= 10,
      'badge_30': () => progress.badges.length >= 30
    };
    
    const requirement = requirements[badge.id];
    return requirement ? requirement() : false;
  }

  /**
   * Update challenge progress
   */
  updateChallengeProgress(userId, action, metadata) {
    const progress = this.getUserProgress(userId);
    
    this.challenges.forEach(challenge => {
      if (progress.challenges.includes(challenge.id)) return;
      
      if (challenge.metric === action || 
          (action === 'visit_site' && challenge.type === 'exploration') ||
          (action === 'read_story' && challenge.type === 'learning') ||
          (action === 'add_story' && challenge.type === 'contribution')) {
        
        progress.challenges.push(challenge.id);
        this.earnPoints(userId, challenge.points, `challenge_${challenge.id}`);
        this.addTimelineEvent(userId, 'challenge_complete', 'Completed Challenge', `Completed challenge: ${challenge.title}`, { challengeId: challenge.id });
      }
    });
  }

  /**
   * Get leaderboard from tenant store
   */
  getLeaderboard(region = null, limit = 100) {
    const users = Object.values(store.userProgress || {});
    
    let filtered = users;
    if (region) {
      filtered = users.filter(u => u.region === region);
    }
    
    filtered.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    return filtered.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      points: user.points || 0,
      level: user.level || 1,
      badges: user.badges ? user.badges.length : 0,
      artifacts: user.artifacts ? user.artifacts.length : 0
    }));
  }

  /**
   * Get digital artifact
   */
  getDigitalArtifact(userId, artifactId) {
    const progress = this.getUserProgress(userId);
    
    if (!this.digitalArtifacts.has(artifactId)) {
      throw new Error('Artifact not found');
    }
    
    if (progress.artifacts.includes(artifactId)) {
      throw new Error('Artifact already collected');
    }
    
    const artifact = this.digitalArtifacts.get(artifactId);
    progress.artifacts.push(artifactId);
    
    // Earn points for collecting
    this.earnPoints(userId, artifact.value, `artifact_${artifactId}`);
    this.addTimelineEvent(userId, 'artifact_discover', 'Collected Digital Artifact', `Collected digital artifact: ${artifact.name} (${artifact.image})`, { artifactId });
    
    return artifact;
  }

  /**
   * Get user achievements
   */
  getUserAchievements(userId) {
    const progress = this.getUserProgress(userId);
    
    const badgeIds = progress.badges.map(b => typeof b === 'string' ? b : b.id);
    const badges = this.badges.filter(b => badgeIds.includes(b.id));
    const artifacts = progress.artifacts.map(id => this.digitalArtifacts.get(id)).filter(Boolean);
    const challenges = this.challenges.filter(c => progress.challenges.includes(c.id));
    
    return {
      userId,
      points: progress.points || 0,
      level: progress.level || 1,
      badges,
      artifacts,
      challenges,
      stats: progress.stats
    };
  }

  /**
   * Get available challenges
   */
  getAvailableChallenges(userId) {
    const progress = this.getUserProgress(userId);
    
    return this.challenges.filter(c => 
      c.active && !progress.challenges.includes(c.id)
    );
  }

  /**
   * Get gamification statistics
   */
  getStatistics() {
    const users = Object.values(store.userProgress || {});
    
    return {
      totalUsers: users.length,
      totalPoints: users.reduce((sum, u) => sum + (u.points || 0), 0),
      averagePoints: users.length ? users.reduce((sum, u) => sum + (u.points || 0), 0) / users.length : 0,
      totalBadgesUnlocked: users.reduce((sum, u) => sum + (u.badges ? u.badges.length : 0), 0),
      totalArtifactsCollected: users.reduce((sum, u) => sum + (u.artifacts ? u.artifacts.length : 0), 0),
      topUser: users.length ? users.reduce((a, b) => (a.points || 0) > (b.points || 0) ? a : b) : null,
      activeUsers: users.filter(u => {
        const days = (Date.now() - new Date(u.lastUpdated || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        return days < 7;
      }).length,
      mostCollectedArtifact: this.getMostCollectedArtifact(),
      popularChallenges: this.getPopularChallenges()
    };
  }

  /**
   * Get most collected artifact
   */
  getMostCollectedArtifact() {
    const counts = new Map();
    const users = Object.values(store.userProgress || {});
    users.forEach(progress => {
      if (progress.artifacts) {
        progress.artifacts.forEach(artifactId => {
          counts.set(artifactId, (counts.get(artifactId) || 0) + 1);
        });
      }
    });
    
    let maxCount = 0;
    let maxArtifact = null;
    counts.forEach((count, id) => {
      if (count > maxCount) {
        maxCount = count;
        maxArtifact = id;
      }
    });
    
    return maxArtifact ? this.digitalArtifacts.get(maxArtifact) : null;
  }

  /**
   * Get popular challenges
   */
  getPopularChallenges() {
    const counts = new Map();
    const users = Object.values(store.userProgress || {});
    users.forEach(progress => {
      if (progress.challenges) {
        progress.challenges.forEach(challengeId => {
          counts.set(challengeId, (counts.get(challengeId) || 0) + 1);
        });
      }
    });
    
    return Array.from(counts.entries())
      .map(([id, count]) => ({ 
        challenge: this.challenges.find(c => c.id === id), 
        completions: count 
      }))
      .filter(item => item.challenge)
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);
  }

  /**
   * Reset user progress (for testing)
   */
  resetUserProgress(userId) {
    if (store.userProgress && store.userProgress[userId]) {
      delete store.userProgress[userId];
    }
  }
}

module.exports = GamificationService;