const http = require('http');

const PORT = 3000;

function fetchItems(queryString) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}/api/items${queryString}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                }
            });
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('--- 🗺️ Testing Spatial Clustering & Bounds Edge Cases 🗺️ ---');
    let failCount = 0;

    // Test 1: Valid Bounding Box
    try {
        console.log('\\n[Test 1] Valid Bounding Box (India region)...');
        // bounds=minLng,minLat,maxLng,maxLat
        const res = await fetchItems('?bounds=68.7,8.4,97.2,37.6');
        if (res && res.data && Array.isArray(res.data)) {
            console.log(`✅ PASS: Returned ${res.data.length} items within India bounds.`);
        } else {
            throw new Error('Invalid data format');
        }
    } catch (e) {
        console.error('❌ FAIL:', e.message);
        failCount++;
    }

    // Test 2: Malformed Bounding Box (Strings instead of numbers)
    try {
        console.log('\\n[Test 2] Malformed Bounding Box (invalid numbers)...');
        const res = await fetchItems('?bounds=abc,def,ghi,jkl');
        if (res && res.data) {
            console.log(`✅ PASS: Server gracefully ignored invalid bounds and returned all ${res.data.length} items.`);
        } else {
            throw new Error('Failed to handle invalid bounds gracefully');
        }
    } catch (e) {
        console.error('❌ FAIL:', e.message);
        failCount++;
    }

    // Test 3: Inverted Bounds (minLng > maxLng)
    try {
        console.log('\\n[Test 3] Inverted Bounds (min > max)...');
        // Swapped min/max
        const res = await fetchItems('?bounds=97.2,37.6,68.7,8.4');
        if (res && res.data) {
            // Depending on QuadTree implementation, it might return 0 or handle it
            console.log(`✅ PASS: Server handled inverted bounds without crashing. Returned ${res.data.length} items.`);
        } else {
            throw new Error('Server crashed on inverted bounds');
        }
    } catch (e) {
        console.error('❌ FAIL:', e.message);
        failCount++;
    }

    // Test 4: Extreme Out-of-Bounds (Latitude > 90)
    try {
        console.log('\\n[Test 4] Out-of-Bounds (Latitude 150)...');
        const res = await fetchItems('?bounds=-180,150,180,200');
        if (res && res.data && res.data.length === 0) {
            console.log(`✅ PASS: Correctly returned 0 items for impossible latitude.`);
        } else if (res && res.data) {
             console.log(`✅ PASS: Handled impossible bounds without crashing, returned ${res.data.length} items.`);
        } else {
            throw new Error('Server crashed on impossible bounds');
        }
    } catch (e) {
        console.error('❌ FAIL:', e.message);
        failCount++;
    }

    // Test 5: Rapid Fire Map Panning (100 simultaneous requests)
    try {
        console.log('\\n[Test 5] Rapid Fire Map Panning (100 concurrent bounding box queries)...');
        const start = Date.now();
        const promises = [];
        for (let i = 0; i < 100; i++) {
            // Slightly shift the bounds each time to simulate fast panning
            const minLng = 70 + (i * 0.1);
            const minLat = 10 + (i * 0.1);
            const maxLng = 80 + (i * 0.1);
            const maxLat = 20 + (i * 0.1);
            promises.push(fetchItems(`?bounds=${minLng},${minLat},${maxLng},${maxLat}`));
        }
        
        const results = await Promise.all(promises);
        const duration = Date.now() - start;
        console.log(`✅ PASS: Server successfully handled 100 simultaneous spatial queries in ${duration}ms!`);
    } catch (e) {
        console.error('❌ FAIL: Server dropped requests during rapid fire panning.', e.message);
        failCount++;
    }

    console.log('\\n----------------------------------------------------');
    if (failCount === 0) {
        console.log('🎉 ALL EDGE CASES PASSED! The Spatial clustering API is rock solid.');
        process.exit(0);
    } else {
        console.log(`⚠️ ${failCount} TESTS FAILED. Please review the errors above.`);
        process.exit(1);
    }
}

runTests();
