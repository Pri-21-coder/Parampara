const { AsyncLocalStorage } = require('node:async_hooks');

const tenantContext = new AsyncLocalStorage();

/**
 * Returns the active tenant ID for the current async execution context.
 * Falls back to 'default' if no context is present.
 */
function getActiveTenantId() {
    const store = tenantContext.getStore();
    return store?.tenantId || 'default';
}

module.exports = {
    tenantContext,
    getActiveTenantId
};
