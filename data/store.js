const LRUCache = require('../server/utils/lruCache');
const { createAuditProxy } = require('../server/services/auditService');
const { SearchEngine, createSearchProxy } = require('../utils/searchEngine');
const { QuadTree, BoundingBox } = require('../utils/QuadTree');
const { getActiveTenantId } = require('../server/utils/tenantContext');

const tenantStores = new Map();

function createTenantStore(tenantId) {
    const auditLog = new LRUCache(5000);
    const searchEngine = new SearchEngine();

    // Initialize spatial indexes covering the globe
    const globalBounds = new BoundingBox(-90, -180, 90, 180);
    const culturalItemsQuadTree = new QuadTree(globalBounds);
    const villagePostsQuadTree = new QuadTree(globalBounds);

    return {
        tenantId,
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
        userProgress: {}, 
        userNotifications: {}, 
        publicKeys: new Map(), 
        familyArchives: new LRUCache(1000), 
        audioMetadata: new LRUCache(1000), 
        moderationQueue: new LRUCache(500), 
        trustedPeers: new Map(),            
        moderationLog: [],                  
        uploadSessions: new LRUCache(200),  
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
        recipes: [], // new collection for traditional recipes
        calendarEvents: [], // new collection for seasonal cultural events
        rangoliDesigns: createSearchProxy(
            searchEngine, 'rangoliDesign', ['title', 'author', 'style'],
            createAuditProxy('rangoliDesigns', new LRUCache(500), auditLog)
        ),
        artifacts: createSearchProxy(
            searchEngine, 'artifact', ['name', 'category', 'state', 'village', 'community', 'historicalPeriod', 'materials', 'description', 'associatedFestivals', 'associatedCrafts'],
            createAuditProxy('artifacts', new LRUCache(2000), auditLog)
        ),
        heritageLanguages: [], // new collection for language words
        naturalHeritageSites: [], // collection for sacred natural heritage
        villageThemes: new LRUCache(100), 
        analytics: {
            pageViews: {},
            events: [],
            interactions: {}
        },
        culturalItemsQuadTree,
        villagePostsQuadTree
    };
}

function getTenantStore(tenantId) {
    if (!tenantStores.has(tenantId)) {
        tenantStores.set(tenantId, createTenantStore(tenantId));
    }
    return tenantStores.get(tenantId);
}

// Ensure the default store is created at startup
getTenantStore('default');

// Magic Proxy: Automatically routes any `store.xyz` access to the active tenant's isolated store!
const proxyStore = new Proxy({}, {
    get: function(target, prop) {
        // Intercept calls based on current AsyncLocalStorage context
        const tenantId = getActiveTenantId();
        const activeStore = getTenantStore(tenantId);
        
        // Expose underlying helper functions explicitly if needed
        if (prop === 'getTenantStore') return getTenantStore;
        if (prop === 'getAllTenants') return () => Array.from(tenantStores.keys());

        return activeStore[prop];
    },
    set: function(target, prop, value) {
        const tenantId = getActiveTenantId();
        const activeStore = getTenantStore(tenantId);
        activeStore[prop] = value;
        return true;
    }
});

module.exports = proxyStore;
