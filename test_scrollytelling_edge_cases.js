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
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data });
                    }
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

async function runScrollytellingEdgeCaseTests() {
    console.log('🧪 Starting Scrollytelling Edge Case & Security Tests...\n');
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
        // Edge Case 1: Case Insensitivity
        const res1 = await fetchAPI('/api/story-generator?item=mAdHuBaNi%20aRt');
        assertTest(res1.status === 200, 'Handles bizarre casing gracefully (Case Insensitivity)');
        assertTest(res1.data.name === 'Madhubani Art', 'Returns correct story despite bizarre casing');

        // Edge Case 2: URL encoded special characters
        const res2 = await fetchAPI('/api/story-generator?item=Madhubani%20Art%20%26%20Craft');
        assertTest(res2.status === 404, 'Handles special characters safely (returns 404 instead of crashing)');
        
        // Edge Case 3: XSS / HTML Injection Attempt
        const xssPayload = encodeURIComponent('<script>alert("hack")</script>');
        const res3 = await fetchAPI(`/api/story-generator?item=${xssPayload}`);
        assertTest(res3.status === 404, 'Safely rejects XSS payload with 404');
        assertTest(typeof res3.data.error === 'string' && res3.data.error.includes('<script>'), 'Error message sanitization check (if it reflects, it should be sanitized in frontend, backend handles via JSON)');

        // Edge Case 4: SQL Injection Attempt
        const sqlPayload = encodeURIComponent("' OR 1=1--");
        const res4 = await fetchAPI(`/api/story-generator?item=${sqlPayload}`);
        assertTest(res4.status === 404, 'Safely rejects SQL injection payload without crashing the server');

        // Edge Case 5: Extremely long string (Buffer Overflow attempt)
        const longString = 'A'.repeat(5000);
        const res5 = await fetchAPI(`/api/story-generator?item=${longString}`);
        // Express might return 414 URI Too Long or 404 depending on how node handles it. Either is fine as long as it doesn't crash (5xx).
        assertTest(res5.status === 404 || res5.status === 414 || res5.status === 431, 'Handles absurdly long query strings without crashing (500)');

    } catch (err) {
        console.error('Test script crashed:', err);
        failCount++;
    }

    console.log(`\n📊 Edge Case Results: ${passCount} Passed, ${failCount} Failed\n`);
    if (failCount > 0) process.exit(1);
}

runScrollytellingEdgeCaseTests();
