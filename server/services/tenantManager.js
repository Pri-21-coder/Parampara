const { getAllTenants, getTenantStore } = require('../../data/store');

class TenantManager {
    constructor() {
        // Mock configurations for different tenants
        this.tenantConfigs = new Map();
        
        // Default tenant config
        this.tenantConfigs.set('default', {
            id: 'default',
            name: 'Parampara Global',
            domain: 'parampara.org',
            features: {
                aiChat: true,
                collaborativeMap: true
            },
            theme: {
                primaryColor: '#3498db',
                secondaryColor: '#2ecc71',
                logoUrl: '/images/default-logo.png'
            }
        });

        // Example secondary tenant
        this.tenantConfigs.set('museum', {
            id: 'museum',
            name: 'National Rural Museum',
            domain: 'museum.parampara.org',
            features: {
                aiChat: false,
                collaborativeMap: true
            },
            theme: {
                primaryColor: '#8e44ad',
                secondaryColor: '#f39c12',
                logoUrl: '/images/museum-logo.png'
            }
        });
    }

    getConfig(tenantId) {
        if (this.tenantConfigs.has(tenantId)) {
            return this.tenantConfigs.get(tenantId);
        }
        return this.tenantConfigs.get('default');
    }

    provisionTenant(config) {
        if (!config.id) throw new Error('Tenant ID is required');
        
        this.tenantConfigs.set(config.id, {
            ...this.tenantConfigs.get('default'),
            ...config
        });

        // Pre-warm the store for the new tenant
        getTenantStore(config.id);

        return this.getConfig(config.id);
    }

    listTenants() {
        return Array.from(this.tenantConfigs.values());
    }

    getActiveTenantIds() {
        return getAllTenants();
    }
}

module.exports = new TenantManager();
