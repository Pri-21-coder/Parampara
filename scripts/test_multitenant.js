const { tenantContext } = require('../server/utils/tenantContext');
const store = require('../data/store');

async function runTests() {
    console.log('--- Starting Multi-tenant Edge Case Tests ---');

    try {
        // Test 1: Add item to Tenant A
        console.log('Test 1: Adding item to museum tenant');
        tenantContext.run({ tenantId: 'museum' }, () => {
            store.culturalItems.push({
                id: 'museum-1',
                title: 'Museum Artifact 1',
                type: 'visual',
                location: 'Museum Hall'
            });
        });

        // Test 2: Add item to Default Tenant
        console.log('Test 2: Adding item to default tenant');
        tenantContext.run({ tenantId: 'default' }, () => {
            store.culturalItems.push({
                id: 'global-1',
                title: 'Global Artifact 1',
                type: 'visual',
                location: 'Global Hub'
            });
        });

        // Test 3: Fetch items from Museum Tenant
        console.log('Test 3: Checking isolation (Museum -> Default)');
        tenantContext.run({ tenantId: 'museum' }, () => {
            const items = Array.from(store.culturalItems.values ? store.culturalItems.values() : store.culturalItems);
            if (!items.find(i => i.title === 'Museum Artifact 1')) throw new Error('Museum item missing');
            if (items.find(i => i.title === 'Global Artifact 1')) throw new Error('Data leak: Global artifact found in Museum tenant');
        });

        // Test 4: Fetch items from Default Tenant
        console.log('Test 4: Checking isolation (Default -> Museum)');
        tenantContext.run({ tenantId: 'default' }, () => {
            const items = Array.from(store.culturalItems.values ? store.culturalItems.values() : store.culturalItems);
            if (!items.find(i => i.title === 'Global Artifact 1')) throw new Error('Global item missing');
            if (items.find(i => i.title === 'Museum Artifact 1')) throw new Error('Data leak: Museum artifact found in Default tenant');
        });

        // Test 5: Default Fallback Isolation
        console.log('Test 5: Testing implicit default tenant isolation');
        // By default, if no context is provided, getActiveTenantId returns 'default'
        const defaultItems = Array.from(store.culturalItems.values ? store.culturalItems.values() : store.culturalItems);
        if (!defaultItems.find(i => i.title === 'Global Artifact 1')) throw new Error('Global item missing from implicit default context');
        if (defaultItems.find(i => i.title === 'Museum Artifact 1')) throw new Error('Data leak: Museum artifact found in implicit default context');

        console.log('--- All Tests Passed Successfully! ---');

    } catch (e) {
        console.error('TEST FAILED:', e.message);
        process.exit(1);
    }
}

runTests();
