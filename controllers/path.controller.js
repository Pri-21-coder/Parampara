const store = require('../data/store');
const { apiCache } = require('../middleware/lruCache');

// Allowed values for query params (whitelist approach)
const ALLOWED_SORT_FIELDS = new Set(['itemCount']);
const ALLOWED_ORDERS = new Set(['asc', 'desc']);

/**
 * GET /api/paths
 * Query params:
 *   theme  — filter by theme (case-insensitive, partial match); trimmed
 *   sort   — "itemCount" to sort by number of connected items (only allowed value)
 *   order  — "asc" | "desc"  (default: "asc"); unknown values default to "asc"
 */
const getPaths = (req, res, next) => {
    try {
        let theme = req.query.theme || '';
        let sort = req.query.sort || '';
        let order = req.query.order || 'asc';

        // ── Sanitise & validate ─────────────────────────────────────────────────
        theme = String(theme).trim();
        sort = String(sort).trim();
        order = String(order).trim().toLowerCase();

        if (theme.length > 200) {
            return res.status(400).json({
                error: 'Query param "theme" exceeds 200 characters.',
            });
        }

        // Whitelist: ignore unknown sort fields
        if (!ALLOWED_SORT_FIELDS.has(sort)) {
            sort = '';
        }

        // Whitelist: default invalid order to 'asc'
        if (!ALLOWED_ORDERS.has(order)) {
            order = 'asc';
        }

        // ── Start from store ────────────────────────────────────────────────────
        let paths = store.heritagePaths.map((p) => {
            const cleanPath = {
                ...p,
                items: Array.isArray(p.items) ? p.items : [],
                theme: typeof p.theme === 'string' ? p.theme : '',
            };
            return cleanPath;
        });

        // ── Theme filter (case-insensitive, partial match) ──────────────────────
        if (theme !== '') {
            const needle = theme.toLowerCase();
            paths = paths.filter((p) => {
                const isMatched = p.theme.toLowerCase().includes(needle);
                return isMatched;
            });
        }

        // ── Sort by item count ──────────────────────────────────────────────────
        if (sort === 'itemCount') {
            const direction = order === 'desc' ? -1 : 1;
            // Stable sort: preserve insertion order for equal counts
            paths = paths
                .map((p, i) => {
                    return { p, i };
                })
                .sort((a, b) => {
                    const diff = a.p.items.length - b.p.items.length;
                    if (diff !== 0) {
                        return diff * direction;
                    } else {
                        return a.i - b.i;
                    }
                })
                .map(({ p }) => {
                    return p;
                });
        }

        res.json(paths);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/paths/themes
 * Returns an array of distinct non-empty themes, alphabetically sorted.
 */
const getPathThemes = (req, res, next) => {
    try {
        const allThemes = store.heritagePaths.map((p) => {
            if (typeof p.theme === 'string') {
                return p.theme.trim();
            } else {
                return '';
            }
        });

        const nonNullThemes = allThemes.filter(Boolean);
        const uniqueThemes = [...new Set(nonNullThemes)];
        const sortedThemes = uniqueThemes.sort((a, b) => {
            return a.localeCompare(b);
        });

        res.json(sortedThemes);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/paths
 * Creates a new heritage path.
 */
const createPath = (req, res, next) => {
    try {
        const title = String(req.body.title || '').trim();
        const theme = String(req.body.theme || '').trim();
        const description = String(req.body.description || '').trim();

        if (!title || !theme) {
            return res.status(400).json({
                error:
                    'Missing required fields: title and theme must be non-empty strings.',
            });
        }

        if (title.length > 200) {
            return res.status(400).json({
                error: 'Field "title" exceeds 200 characters.',
            });
        }
        if (theme.length > 200) {
            return res.status(400).json({
                error: 'Field "theme" exceeds 200 characters.',
            });
        }

        // Deduplicate and sanitise items array
        const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
        const normalizedItems = rawItems
            .filter((id) => typeof id === 'string')
            .map((id) => id.trim())
            .filter(Boolean);

        const items = [...new Set(normalizedItems)];

        const newPath = {
            id: Date.now().toString(),
            title,
            description,
            items,
            theme,
        };

        store.heritagePaths.push(newPath);

        // Invalidate caches
        if (apiCache && typeof apiCache.invalidateByPrefix === 'function') {
            apiCache.invalidateByPrefix('/api/paths');
            apiCache.invalidateByPrefix('/api/search');
        }

        res.status(201).json(newPath);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/paths/route
 * Query params: start (id), end (id), theme (optional)
 */
const getOptimizedRoute = (req, res, next) => {
    try {
        const start = req.query.start;
        const end = req.query.end;
        const theme = req.query.theme;

        if (!start || !end) {
            return res.status(400).json({
                error: 'Missing required query parameters: start and end.',
            });
        }

        const GraphEngine = require('../utils/GraphEngine');
        const engine = new GraphEngine(store.culturalItems, store.heritagePaths);

        try {
            const route = engine.findShortestPath(start, end, { theme });
            if (!route) {
                return res.status(404).json({
                    error: 'No valid route found between the specified locations.',
                });
            }
            res.json(route);
        } catch (err) {
            if (err.message === 'Invalid start or end location.') {
                return res.status(400).json({
                    error: err.message,
                });
            }
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPaths,
    getPathThemes,
    createPath,
    getOptimizedRoute,
};
