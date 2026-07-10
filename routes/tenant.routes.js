const express = require('express');
const router = express.Router();
const tenantManager = require('../server/services/tenantManager');

// GET /api/tenant/config
router.get('/config', (req, res) => {
    try {
        // tenantMiddleware sets req.tenantId before calling next()
        const tenantId = req.tenantId || 'default';
        const config = tenantManager.getConfig(tenantId);
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tenant config' });
    }
});

// GET /api/tenant/list (For Demo/Switcher UI)
router.get('/list', (req, res) => {
    try {
        const tenants = tenantManager.listTenants();
        res.json(tenants.map(t => ({ id: t.id, name: t.name })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to list tenants' });
    }
});

module.exports = router;
