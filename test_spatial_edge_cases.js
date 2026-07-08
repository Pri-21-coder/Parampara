const { QuadTree, BoundingBox } = require('./utils/QuadTree');

console.log('\n--- 🧪 Testing Spatial QuadTree Edge Cases 🧪 ---\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passCount++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failCount++;
    }
}

try {
    const globalBounds = new BoundingBox(-90, -180, 90, 180);

    // Test 1: Empty Tree
    let tree = new QuadTree(globalBounds);
    let results = tree.search(new BoundingBox(0, 0, 10, 10));
    assert(results.length === 0, 'Empty tree returns 0 results for any search');

    // Test 2: Invalid Coordinate Insertion
    assert(tree.insert(null) === false, 'Rejects null item');
    assert(tree.insert({ coordinates: [] }) === false, 'Rejects empty coordinates array');
    assert(tree.insert({ coordinates: [95, 200] }) === false, 'Rejects out-of-global-bounds coordinates');
    
    // Test 3: Exact Boundary Match
    tree.insert({ id: 'edge1', coordinates: [0, 0] });
    tree.insert({ id: 'edge2', coordinates: [10, 10] });
    let edgeSearch = tree.search(new BoundingBox(0, 0, 10, 10));
    assert(edgeSearch.length === 2, 'Finds items exactly on the bounding box edges');

    // Test 4: Disjoint Search
    let disjointSearch = tree.search(new BoundingBox(20, 20, 30, 30));
    assert(disjointSearch.length === 0, 'Returns empty array for completely disjoint bounding box');

    // Test 5: Subdivision Trigger (Capacity Exceedance)
    tree.clear();
    // Capacity is 10 by default
    for (let i = 0; i < 15; i++) {
        tree.insert({ id: `point${i}`, coordinates: [i, i] });
    }
    assert(tree.divided === true, 'Tree correctly subdivided after exceeding capacity');
    let halfSearch = tree.search(new BoundingBox(0, 0, 5, 5));
    assert(halfSearch.length === 6, 'Successfully searches subdivided tree (found 6 items)');

    // Test 6: Global Search
    let globalSearch = tree.search(new BoundingBox(-90, -180, 90, 180));
    assert(globalSearch.length === 15, 'Global bounding box returns all inserted items across subdivisions');

    // Test 7: Negative Coordinates (Western / Southern hemisphere)
    tree.clear();
    tree.insert({ id: 'brazil', coordinates: [-14.2350, -51.9253] }); // Brazil
    tree.insert({ id: 'argentina', coordinates: [-38.4161, -63.6167] }); // Argentina
    let southAmSearch = tree.search(new BoundingBox(-50, -70, -10, -40));
    assert(southAmSearch.length === 2, 'Correctly searches negative coordinates (Southern/Western hemispheres)');
    
    let northAmSearch = tree.search(new BoundingBox(10, -130, 60, -60));
    assert(northAmSearch.length === 0, 'Disjoint negative coordinate search returns empty');

} catch (err) {
    console.error('Test script crashed:', err);
    failCount++;
}

console.log(`\n📊 Results: ${passCount} Passed, ${failCount} Failed\n`);
if (failCount > 0) process.exit(1);
