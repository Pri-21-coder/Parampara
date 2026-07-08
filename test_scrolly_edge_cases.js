const { getStoryData } = require('./controllers/story.controller');
const store = require('./data/store');
const initializeSampleData = require('./config/sampleData');

// Initialize store with sample data
initializeSampleData();

console.log('\n--- 🧪 Testing Scrollytelling API Edge Cases 🧪 ---\n');

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

// Mock Express response object
function mockRes() {
    return {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.data = data; return this; },
        statusCode: 200,
        data: null
    };
}

try {
    // Test 1: Fetching all stories (No query param)
    let req1 = { query: {} };
    let res1 = mockRes();
    getStoryData(req1, res1, console.error);
    // res1.data may be an AuditProxy, so check length directly or convert to array
    assert(res1.data && res1.data.length > 0, 'Fetching without "item" query returns all stories');

    // Test 2: Fetching valid story with Case Insensitivity
    let req2 = { query: { item: 'madhubani ART' } };
    let res2 = mockRes();
    getStoryData(req2, res2, console.error);
    assert(res2.statusCode === 200 && res2.data.name === 'Madhubani Art', 'Fetches story successfully with case-insensitive matching');
    assert(Array.isArray(res2.data.chapters) && res2.data.chapters.length > 0, 'Returned story contains the enhanced "chapters" array for scrollytelling');

    // Test 3: Fetching non-existent story
    let req3 = { query: { item: 'Ghost Story of Nowhere' } };
    let res3 = mockRes();
    getStoryData(req3, res3, console.error);
    assert(res3.statusCode === 404, 'Returns 404 for non-existent story');
    assert(res3.data.error.includes('not found'), 'Returns appropriate error message for missing story');

    // Test 4: Handling Malformed Data (Missing chapters)
    // Temporarily inject a malformed story into the store
    store.storySourceData.push({
        id: 'story-broken',
        name: 'Broken Story',
        village: 'Errorville',
        // Missing history, traditions, chapters entirely
    });
    
    let req4 = { query: { item: 'Broken Story' } };
    let res4 = mockRes();
    getStoryData(req4, res4, console.error);
    assert(res4.statusCode === 200, 'Does not crash when fetching a severely malformed story from the store');
    assert(Array.isArray(res4.data.chapters) && res4.data.chapters.length === 0, 'Safely falls back to empty array [] when chapters are missing');

    // No need to cleanup, process exits.
} catch (err) {
    console.error('Test script crashed:', err);
    failCount++;
}

console.log(`\n📊 Results: ${passCount} Passed, ${failCount} Failed\n`);
if (failCount > 0) process.exit(1);
