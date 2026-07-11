/**
 * Multi-tenant Fetch Interceptor
 * 
 * Automatically attaches the `X-Tenant-ID` header to all outgoing API requests.
 * It reads the tenant ID from localStorage, falling back to 'default'.
 */
(function() {
    const originalFetch = window.fetch;
    
    // Default to 'default' tenant if none is set
    if (!localStorage.getItem('tenantId')) {
        localStorage.setItem('tenantId', 'default');
    }

    window.fetch = async function() {
        let [resource, config] = arguments;
        
        // Only intercept requests to our API
        if (typeof resource === 'string' && resource.startsWith('/api')) {
            config = config || {};
            config.headers = config.headers || {};
            
            // Allow overrides, but default to the active tenant
            if (!config.headers['X-Tenant-ID'] && !config.headers['x-tenant-id']) {
                config.headers['X-Tenant-ID'] = localStorage.getItem('tenantId') || 'default';
            }
        }
        
        return originalFetch.call(this, resource, config);
    };

    // Load Tenant Config and Apply Branding
    async function loadTenantConfig() {
        try {
            const res = await originalFetch('/api/tenant/config', {
                headers: { 'X-Tenant-ID': localStorage.getItem('tenantId') || 'default' }
            });
            if (res.ok) {
                const config = await res.json();
                applyTenantBranding(config);
            }
        } catch (e) {
            console.error('Failed to load tenant config', e);
        }
    }

    function applyTenantBranding(config) {
        if (!config || !config.theme) return;
        const root = document.documentElement;
        if (config.theme.primaryColor) {
            root.style.setProperty('--primary-color', config.theme.primaryColor);
        }
        if (config.theme.secondaryColor) {
            root.style.setProperty('--secondary-color', config.theme.secondaryColor);
        }
        // Update document title if present
        if (config.name) {
            document.title = `${config.name} - Parampara`;
        }
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', loadTenantConfig);
})();
