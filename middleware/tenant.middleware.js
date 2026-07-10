const { tenantContext } = require('../server/utils/tenantContext');

const config = {
    defaultTenant: 'default',
    validTenantPattern: /^[a-zA-Z0-9\-_]+$/,
    excludeSubdomains: ['www', 'api', 'admin', 'app', 'dev', 'test']
};

const getTenantFromHeader = (req) => {
    const tenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
    if (tenantId && typeof tenantId === 'string') {
        return tenantId.trim();
    }
    return null;
};

const getTenantFromQuery = (req) => {
    if (req.query && req.query.tenantId) {
        const tenantId = req.query.tenantId;
        if (typeof tenantId === 'string') {
            return tenantId.trim();
        }
    }
    return null;
};

const getTenantFromSubdomain = (req) => {
    if (!req.hostname) {
        return null;
    }

    const parts = req.hostname.split('.');
    
    if (parts.length < 3) {
        return null;
    }

    const subdomain = parts[0].toLowerCase();
    
    if (config.excludeSubdomains.includes(subdomain)) {
        return null;
    }

    return subdomain;
};

const validateTenantId = (tenantId) => {
    if (!tenantId || typeof tenantId !== 'string') {
        return { valid: false, reason: 'Tenant ID must be a non-empty string' };
    }

    const trimmed = tenantId.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, reason: 'Tenant ID cannot be empty' };
    }

    if (trimmed.length > 100) {
        return { valid: false, reason: 'Tenant ID exceeds maximum length of 100 characters' };
    }

    if (!config.validTenantPattern.test(trimmed)) {
        return { 
            valid: false, 
            reason: 'Tenant ID contains invalid characters. Only alphanumeric, hyphens, and underscores are allowed.' 
        };
    }

    return { valid: true, tenantId: trimmed };
};

const resolveTenantId = (req) => {
    let tenantId = getTenantFromHeader(req);
    
    if (!tenantId) {
        tenantId = getTenantFromQuery(req);
    }
    
    if (!tenantId) {
        tenantId = getTenantFromSubdomain(req);
    }
    
    if (!tenantId) {
        tenantId = config.defaultTenant;
    }

    const validation = validateTenantId(tenantId);
    
    if (!validation.valid) {
        console.warn(`Invalid tenant ID detected: "${tenantId}" - ${validation.reason}`);
        return config.defaultTenant;
    }

    return validation.tenantId;
};

const tenantMiddleware = (req, res, next) => {
    try {
        const tenantId = resolveTenantId(req);
        
        req.tenantId = tenantId;
        req.tenantSource = {
            header: !!getTenantFromHeader(req),
            query: !!getTenantFromQuery(req),
            subdomain: !!getTenantFromSubdomain(req),
            fallback: tenantId === config.defaultTenant
        };

        tenantContext.run({ tenantId }, () => {
            next();
        });
    } catch (error) {
        console.error('Tenant middleware error:', error.message);
        const fallbackTenant = config.defaultTenant;
        req.tenantId = fallbackTenant;
        tenantContext.run({ tenantId: fallbackTenant }, () => {
            next();
        });
    }
};

module.exports = tenantMiddleware;
module.exports.config = config;
module.exports.resolveTenantId = resolveTenantId;
module.exports.validateTenantId = validateTenantId;
module.exports.getTenantFromHeader = getTenantFromHeader;
module.exports.getTenantFromQuery = getTenantFromQuery;
module.exports.getTenantFromSubdomain = getTenantFromSubdomain;