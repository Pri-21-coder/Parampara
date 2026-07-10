const store = require('../data/store');

// Basic CSS sanitizer to remove obvious malicious patterns
function sanitizeCSS(css) {
    if (!css || typeof css !== 'string') return '';
    // Strip script tags, expression(), javascript:, etc.
    let clean = css.replace(/<script.*?>.*?<\/script>/gi, '');
    clean = clean.replace(/expression\s*\(/gi, '');
    clean = clean.replace(/javascript\s*:/gi, '');
    clean = clean.replace(/behavior\s*:/gi, '');
    return clean;
}

exports.getTheme = (req, res, next) => {
    try {
        const { villageId } = req.params;
        if (!villageId) {
            return res.status(400).json({ error: 'Village ID is required' });
        }

        const theme = store.villageThemes.get(villageId);
        if (theme) {
            res.json(theme);
        } else {
            res.status(404).json({ error: 'Theme not found for this village' });
        }
    } catch (err) {
        next(err);
    }
};

exports.saveTheme = (req, res, next) => {
    try {
        const { villageId } = req.params;
        const { css } = req.body;
        
        if (!villageId) {
            return res.status(400).json({ error: 'Village ID is required' });
        }
        
        if (css === undefined || typeof css !== 'string') {
            return res.status(400).json({ error: 'Valid CSS string is required' });
        }
        
        if (css.length > 50000) {
            return res.status(400).json({ error: 'CSS theme is too large. Maximum size is 50KB.' });
        }

        const sanitizedCss = sanitizeCSS(css);
        
        const themeConfig = {
            villageId,
            css: sanitizedCss,
            updatedAt: new Date().toISOString()
        };
        
        store.villageThemes.set(villageId, themeConfig);
        
        res.status(200).json({ message: 'Theme saved securely', theme: themeConfig });
    } catch (err) {
        next(err);
    }
};
