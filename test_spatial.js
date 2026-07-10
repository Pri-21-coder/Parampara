const { QuadTree, BoundingBox } = require('./utils/QuadTree');

console.log('\n--- 🧪 Testing Spatial QuadTree 🧪 ---\n');

const globalBounds = new BoundingBox(-90, -180, 90, 180);
const tree = new QuadTree(globalBounds);

// Insert items
const items = [
    { id: 1, title: 'Mumbai Item', coordinates: [19.0760, 72.8777] },
    { id: 2, title: 'Delhi Item', coordinates: [28.7041, 77.1025] },
    { id: 3, title: 'Kolkata Item', coordinates: [22.5726, 88.3639] },
    { id: 4, title: 'New York Item', coordinates: [40.7128, -74.0060] }
];

items.forEach(item => {
    const success = tree.insert(item);
    console.log(`Inserting ${item.title}: ${success ? '✅ Success' : '❌ Failed'}`);
});

console.log('\n--- Searching ---');

// Search for items in India roughly
const indiaBounds = new BoundingBox(8, 68, 37, 97);
const indiaItems = tree.search(indiaBounds);
console.log(`\nItems in India: ${indiaItems.length} (Expected: 3)`);
indiaItems.forEach(i => console.log(` - ${i.title}`));

// Search for items globally
const allItems = tree.search(globalBounds);
console.log(`\nItems Globally: ${allItems.length} (Expected: 4)`);

// Search in small bounding box around Mumbai
const mumbaiBounds = new BoundingBox(19.0, 72.8, 19.1, 72.9);
const mumbaiItems = tree.search(mumbaiBounds);
console.log(`\nItems in Mumbai only: ${mumbaiItems.length} (Expected: 1)`);
mumbaiItems.forEach(i => console.log(` - ${i.title}`));

console.log('\n✅ QuadTree Tests Complete!\n');
