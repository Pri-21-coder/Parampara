/**
 * Parampara - Cultural Item Controller
 * Handles retrieval, full-text searching, filtering, pagination, 
 * and insertion of rural cultural heritage assets.
 */

const store = require('../data/store');
const { apiCache } = require('../middleware/lruCache');
const { BoundingBox } = require('../utils/QuadTree');
const notificationService = require('../server/services/notificationService');

/**
 * Retrieves a list of cultural items with optional search, category filters, and pagination.
 * 
 * @param {Object} req Express request object containing query parameters.
 * @param {Object} res Express response object.
 */
const getItems = (req, res) => {
    try {
        let culturalAssets = store.culturalItems || [];

        // Apply Spatial Bounding Box Filter if 'bounds' query is provided
        if (req.query.bounds) {
            const parts = req.query.bounds.split(',').map(Number);
            if (parts.length === 4 && !parts.some(isNaN)) {
                // frontend sends: minLng, minLat, maxLng, maxLat
                const range = new BoundingBox(parts[1], parts[0], parts[3], parts[2]);
                culturalAssets = store.culturalItemsQuadTree.search(range);
            }
        }

        // Filter out hidden items
        culturalAssets = culturalAssets.filter(item => !item.isHidden);

        // Extract and parse pagination config & query variables
        var activePage = parseInt(req.query.page, 10) || 1;
        var itemsPerPageLimit = parseInt(req.query.limit, 10) || 10;
        var categoryTypeFilter = req.query.type;
        var fullTextSearchQuery = req.query.search;

        // Utilize the TF-IDF indexing search engine for full-text queries
        if (fullTextSearchQuery) {
            culturalAssets = store.searchEngine.search(fullTextSearchQuery, 'culturalItem');

            // Ensure hidden items never reappear in search results
            culturalAssets = culturalAssets.filter(item => !item.isHidden);
        }

        // Filter items based on specified type category (skip if set to 'all')
        if (categoryTypeFilter && categoryTypeFilter !== 'all') {
            culturalAssets = culturalAssets.filter(function (asset) {
                return asset.type === categoryTypeFilter;
            });
        }

        var yearFilter = req.query.year;
        if (yearFilter && yearFilter !== 'All') {
            culturalAssets = culturalAssets.filter(function (asset) {
                return asset.year && asset.year.toString() === yearFilter.toString();
            });
        }

        // Calculate metadata limits for pagination offset boundaries
        var totalMatchedItems = culturalAssets.length;
        var totalPagesCount = Math.ceil(totalMatchedItems / itemsPerPageLimit);
        var paginationOffset = (activePage - 1) * itemsPerPageLimit;
        var paginationUpperLimit = paginationOffset + itemsPerPageLimit;

        // Slice active assets block for client response
        var pagedCulturalItems = culturalAssets.slice(paginationOffset, paginationUpperLimit);

        // Send formatted pagination response
        res.json({
            data: pagedCulturalItems,
            meta: {
                currentPage: activePage,
                limit: itemsPerPageLimit,
                totalItems: totalMatchedItems,
                totalPages: totalPagesCount
            }
        });
    }
    catch (fetchError) {
        console.error('[Item Controller] Failed to fetch cultural items:', fetchError);
        res.status(500).json({ error: 'Error fetching items' });
    }
};

/**
 * Creates and stores a new cultural item in the registry.
 * 
 * @param {Object} req Express request object containing item payload in body.
 * @param {Object} res Express response object.
 */
const createItem = (req, res) => {
    try {
        var title = req.body.title;
        var type = req.body.type;
        var location = req.body.location;

        // Enforce presence of essential fields
        if (!title || !type || !location) {
            return res.status(400).json({
                error: 'Missing required fields: title, type, location',
            });
        }

        // Build the structured item object
        var createdAsset = {};
        createdAsset.id = Date.now().toString();
        createdAsset.title = title;
        createdAsset.type = type;
        createdAsset.location = location;
        createdAsset.coordinates = req.body.coordinates || null;
        createdAsset.description = req.body.description || '';
        createdAsset.imageUrl = req.body.imageUrl || '';
        createdAsset.audioUrl = req.body.audioUrl || '';
        createdAsset.tags = Array.isArray(req.body.tags)
            ? req.body.tags
            : req.body.tags
                ? [req.body.tags]
                : [];
        createdAsset.timestamp = new Date().toISOString();
        createdAsset.authorId = req.user ? req.user.id : null;

        // Hashing for tamper detection
        const { hashObject } = require('../server/utils/hashUtils');
        if (req.body.hash) {
            createdAsset.hash = req.body.hash;
        } else {
            createdAsset.hash = hashObject(createdAsset);
        }

        // Store in memory database and update spatial index
        store.culturalItems.push(createdAsset);
        store.culturalItemsQuadTree.insert(createdAsset);

        // Invalidate caches
        apiCache.invalidateByPrefix('/api/items');
        apiCache.invalidateByPrefix('/api/search');

        // Broadcast notification
        notificationService.broadcast('new_item', {
            title: createdAsset.title,
            type: createdAsset.type,
            location: createdAsset.location,
            id: createdAsset.id,
            message: `New cultural asset added: ${createdAsset.title} in ${createdAsset.location}`
        }, 'community');

        // Return the newly created asset
        res.status(201).json(createdAsset);
    }
    catch (insertionError) {
        console.error('[Item Controller] Failed to create item:', insertionError);
        res.status(500).json({
            error: 'Error adding item',
        });
    }
};

const deleteItem = (req, res) => {
    try {
        const id = req.params.id;
        const index = store.culturalItems.findIndex(i => i.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Remove item from the primary collection
        const filtered = store.culturalItems.filter(i => i.id !== id);
        store.culturalItems.length = 0;
        filtered.forEach(item => store.culturalItems.push(item));

        // Rebuild spatial index so deleted items do not remain in map/bounds results
        if (store.culturalItemsQuadTree) {
            if (typeof store.culturalItemsQuadTree.clear === 'function') {
                store.culturalItemsQuadTree.clear();
            } else if (Array.isArray(store.culturalItemsQuadTree.items)) {
                store.culturalItemsQuadTree.items.length = 0;
            }

            if (typeof store.culturalItemsQuadTree.insert === 'function') {
                store.culturalItems.forEach(item => {
                    store.culturalItemsQuadTree.insert(item);
                });
            }
        }

        apiCache.invalidateByPrefix('/api/items');
        apiCache.invalidateByPrefix('/api/search');

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('[Item Controller] Failed to delete item:', error);
        res.status(500).json({ error: 'Error deleting item' });
    }
};

module.exports = {
    getItems,
    createItem,
    deleteItem
};
