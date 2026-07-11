const http = require('http');
const assert = require('assert');

// Helper to make HTTP GET requests
function fetchAPI(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400 && res.statusCode !== 404) {
                    reject(new Error(`Status Code: ${res.statusCode} - ${data}`));
                } else {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data });
                    }
                }
            });
        }).on('error', reject);
    });
}

async function runScrollytellingTests() {
    console.log('🧪 Starting Scrollytelling API Tests...\n');
    let passCount = 0;
    let failCount = 0;

    function assertTest(condition, message) {
        try {
            assert(condition);
            console.log(`✅ PASS: ${message}`);
            passCount++;
        } catch (e) {
            console.error(`❌ FAIL: ${message}`);
            failCount++;
        }
    }

    try {
        // Test 1: Fetch a story that exists and has chapters (Madhubani Art)
        const res1 = await fetchAPI('/api/story-generator?item=Madhubani%20Art');
        assertTest(res1.status === 200, 'API returns 200 OK for valid story');
        assertTest(res1.data.name === 'Madhubani Art', 'API returns correct story name');
        assertTest(Array.isArray(res1.data.chapters), 'Story contains a chapters array');
        assertTest(res1.data.chapters.length === 4, 'Madhubani Art has exactly 4 chapters');

        // Test 2: Validate the structural integrity of the chapters
        const firstChapter = res1.data.chapters[0];
        assertTest(typeof firstChapter.title === 'string', 'Chapter has a title');
        assertTest(typeof firstChapter.content === 'string', 'Chapter has content');
        assertTest(Array.isArray(firstChapter.coordinates) && firstChapter.coordinates.length === 2, 'Chapter has valid [lat, lng] coordinates');
        assertTest(typeof firstChapter.coordinates[0] === 'number', 'Latitude is a number');
        assertTest(typeof firstChapter.mediaUrl === 'string' && firstChapter.mediaUrl.startsWith('http'), 'Chapter has a valid mediaUrl');
        
        // Test 3: Fetch a non-existent story
        const res3 = await fetchAPI('/api/story-generator?item=NonExistentStory');
        assertTest(res3.status === 404, 'API correctly returns 404 Not Found for non-existent story');
        assertTest(res3.data.error !== undefined, '404 response has correct error formatting');

    } catch (err) {
        console.error('Test script crashed:', err);
        failCount++;
    }

    console.log(`\n📊 Results: ${passCount} Passed, ${failCount} Failed\n`);
    if (failCount > 0) process.exit(1);
}

runScrollytellingTests();
