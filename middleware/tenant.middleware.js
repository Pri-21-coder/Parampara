const { tenantContext } = require('../server/utils/tenantContext');

/**
 * Advanced Tenant Middleware
 * Resolves the tenant from headers, query parameters, or subdomains.
 * Wraps the request in `tenantContext` so downstream logic automatically accesses isolated data.
 */
const tenantMiddleware = (req, res, next) => {
    // 1. Try Header: X-Tenant-ID
    let tenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];

    // 2. Try Query Parameter (useful for quick links or testing)
    if (!tenantId && req.query.tenantId) {
        tenantId = req.query.tenantId;
    }

    // 3. Try Subdomain extraction (e.g., museum.parampara.org -> museum)
    if (!tenantId && req.hostname) {
        const parts = req.hostname.split('.');
        if (parts.length >= 3 && parts[0] !== 'www') {
            tenantId = parts[0];
        }
    }

    // Fallback to default tenant
    if (!tenantId) {
        tenantId = 'default';
    }

    req.tenantId = tenantId; // Just for reference

    // Run the rest of the request within this tenant's isolated context!
    tenantContext.run({ tenantId }, () => {
        next();
    });
};

module.exports = tenantMiddleware;
