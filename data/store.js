const LRUCache = require('../server/utils/lruCache');
const { createAuditProxy } = require('../server/services/auditService');
const { SearchEngine, createSearchProxy } = require('../utils/searchEngine');
const { QuadTree, BoundingBox } = require('../utils/QuadTree');

const auditLog = new LRUCache(5000);
const searchEngine = new SearchEngine();

// Initialize spatial indexes covering the globe (Lat: -90 to 90, Lng: -180 to 180)
const globalBounds = new BoundingBox(-90, -180, 90, 180);
const culturalItemsQuadTree = new QuadTree(globalBounds);
const villagePostsQuadTree = new QuadTree(globalBounds);

const store = {
  searchEngine,
  auditLog,
  culturalItems: createSearchProxy(
    searchEngine, 'culturalItem', ['title', 'description', 'location', 'tags'],
    createAuditProxy('culturalItems', new LRUCache(2000), auditLog)
  ),
  heritagePaths: createSearchProxy(
    searchEngine, 'heritagePath', ['title', 'theme', 'description'],
    createAuditProxy('heritagePaths', new LRUCache(1000), auditLog)
  ),
  userProgress: {}, // Keep as object for fast lookup by userId
  userNotifications: {}, // Tracks read state per user: { [userId]: { readIds: Set, preferences: {} } }
  publicKeys: new Map(), // { userId -> { publicKeyJwk, timestamp } }
  familyArchives: new LRUCache(1000), // E2EE Archives
  audioMetadata: new LRUCache(1000), // Processed audio metadata
  moderationQueue: new LRUCache(500), // Pending moderation items
  trustedPeers: new Map(),            // peerId -> { secretHash, username, registeredAt }
  moderationLog: [],                  // Audit trail (capped at 500)
  uploadSessions: new LRUCache(200),  // Chunked upload sessions
  villagePosts: createSearchProxy(
    searchEngine, 'villagePost', ['title', 'village', 'content', 'type'],
    createAuditProxy('villagePosts', new LRUCache(1000), auditLog)
  ),
  refreshTokens: new LRUCache(500),
  users: createAuditProxy('users', new LRUCache(100), auditLog),
  contributors: createAuditProxy('contributors', new LRUCache(500), auditLog),
  timelineEvents: createSearchProxy(
    searchEngine, 'timelineEvent', ['item', 'type', 'description'],
    createAuditProxy('timelineEvents', new LRUCache(500), auditLog)
  ),
  storySourceData: createAuditProxy('storySourceData', new LRUCache(500), auditLog),
  artisans: createSearchProxy(
    searchEngine, 'artisan', ['name', 'craft', 'village', 'bio'],
    createAuditProxy('artisans', new LRUCache(500), auditLog)
  ),
  villageThemes: new LRUCache(100), // Custom Village Themes (villageId -> css string)
  analytics: {
    pageViews: {},
    events: [],
    interactions: {}
  },
  culturalItemsQuadTree,
  villagePostsQuadTree
};

module.exports = store;
