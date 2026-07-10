const http = require('http');

const runTest = () => {
    return new Promise((resolve) => {
        let passed = 0;
        let failed = 0;

        const request = (path, method = 'GET', body = null, headers = {}) => {
            return new Promise((reqResolve) => {
                const options = {
                    hostname: 'localhost',
                    port: 3000,
                    path: path,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    }
                };

                const req = http.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        let parsed = null;
                        try {
                            if (data) parsed = JSON.parse(data);
                        } catch (e) {
                            parsed = data;
                        }
                        
                        let cookies = [];
                        if (res.headers['set-cookie']) {
                            cookies = res.headers['set-cookie'];
                        }

                        reqResolve({ status: res.statusCode, body: parsed, cookies: cookies });
                    });
                });

                req.on('error', (e) => {
                    console.error(`Request Error: ${e.message}`);
                    reqResolve({ status: 500, error: e.message });
                });

                if (body) {
                    req.write(JSON.stringify(body));
                }
                req.end();
            });
        };

        const executeTests = async () => {
            console.log("Starting Markdown Edge Cases Test\n");

            // 1. Fetch CSRF Token
            const csrfRes = await request('/api/csrf-token', 'GET');
            const csrfToken = csrfRes.body?.csrfToken;
            const csrfCookies = csrfRes.cookies;
            let cookieHeader = '';
            if (csrfCookies.length > 0) {
                cookieHeader = csrfCookies[0].split(';')[0];
            }

            // 2. Fetch Auth Token
            let authToken = '';
            const authRes = await request('/api/auth/login', 'POST', { username: 'admin', password: 'admin123' }, { 
                'x-csrf-token': csrfToken,
                'Cookie': cookieHeader
            });
            if (authRes.body?.token) {
                authToken = authRes.body.token;
            }

            const getAuthHeaders = () => {
                return {
                    'x-csrf-token': csrfToken,
                    'Cookie': cookieHeader,
                    'Authorization': `Bearer ${authToken}`
                };
            };

            // Test 1: Empty Description
            console.log("Test 1: Empty Markdown Description");
            const res1 = await request('/api/items', 'POST', {
                title: 'Empty Desc Item',
                type: 'visual',
                location: 'Village A',
                description: ''
            }, getAuthHeaders());

            if (res1.status === 201 && res1.body.description === '') {
                console.log("✅ Passed");
                passed++;
            } else {
                console.log("❌ Failed:", res1.status, res1.body);
                failed++;
            }

            // Test 2: Huge Markdown Description (e.g. 1MB of text)
            console.log("\nTest 2: Huge Markdown Description");
            const hugeText = "# Large File\n".repeat(10000);
            const res2 = await request('/api/items', 'POST', {
                title: 'Huge Markdown Item',
                type: 'visual',
                location: 'Village B',
                description: hugeText
            }, getAuthHeaders());

            if (res2.status === 201 && res2.body.description === hugeText) {
                console.log("✅ Passed");
                passed++;
            } else {
                console.log("❌ Failed:", res2.status, res2.body);
                failed++;
            }

            // Test 3: Markdown with XSS (Backend should store it exactly as is)
            console.log("\nTest 3: Markdown with XSS Payload");
            const xssText = "# Title\n[Click here](javascript:alert(1))\n<script>alert('XSS')</script>";
            const res3 = await request('/api/items', 'POST', {
                title: 'XSS Markdown Item',
                type: 'story',
                location: 'Village C',
                description: xssText
            }, getAuthHeaders());

            if (res3.status === 201 && res3.body.description === xssText) {
                console.log("✅ Passed (Backend correctly preserves raw text. Sanitization is done on frontend)");
                passed++;
            } else {
                console.log("❌ Failed:", res3.status, res3.body);
                failed++;
            }

            // Test 4: Retrieve Items to Ensure Storage Integrity
            console.log("\nTest 4: Storage Integrity (GET /api/items)");
            const getRes = await request('/api/items?limit=1000', 'GET');
            
            if (getRes.status === 200 && getRes.body && Array.isArray(getRes.body.data)) {
                const xssItem = getRes.body.data.find(i => i.title === 'XSS Markdown Item');
                if (xssItem && xssItem.description === xssText) {
                    console.log("✅ Passed (Retrieval successful)");
                    passed++;
                } else {
                    console.log("❌ Failed: Item not found or altered");
                    failed++;
                }
            } else {
                console.log("❌ Failed:", getRes.status);
                failed++;
            }

            // Test 5: Own Custom Test Case - Broken/Malformed JSON Payload Simulation (Actually this tests Express json parser)
            // But let's test markdown with weird unicode characters
            console.log("\nTest 5: Markdown with Unicode/Emoji Characters");
            const unicodeText = "# 🏛️ Heritage \n **तथ्य** : 🌍 \n ✨";
            const res5 = await request('/api/items', 'POST', {
                title: 'Unicode Markdown Item',
                type: 'audio',
                location: 'Village D',
                description: unicodeText
            }, getAuthHeaders());

            if (res5.status === 201 && res5.body.description === unicodeText) {
                console.log("✅ Passed (Unicode correctly preserved)");
                passed++;
            } else {
                console.log("❌ Failed:", res5.status, res5.body);
                failed++;
            }

            console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
            resolve({ passed, failed });
        };

        executeTests();
    });
};

runTest();
