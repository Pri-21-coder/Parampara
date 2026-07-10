const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTest(name, fn) {
    try {
        console.log(`\n--- Running Test: ${name} ---`);
        await fn();
        console.log(`✅ Passed: ${name}`);
    } catch (err) {
        console.error(`❌ Failed: ${name} - ${err.message}`);
    }
}

async function request(path, method, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                ...headers
            }
        };

        if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
            body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(body);
        } else if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch(e) {}
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    console.log("Starting P2P Sync Edge Case Tests...");

    // Fetch CSRF Token
    let csrfToken = '';
    try {
        const csrfRes = await request('/api/csrf-token', 'GET');
        if (csrfRes.status === 200 && csrfRes.body && csrfRes.body.csrfToken) {
            csrfToken = csrfRes.body.csrfToken;
            console.log(`✅ Fetched CSRF Token: ${csrfToken.substring(0, 5)}...`);
        }
    } catch (err) {
        console.error("❌ Failed to fetch CSRF Token:", err.message);
    }

    // Fetch Auth Token
    let authToken = '';
    try {
        const authRes = await request('/api/auth/login', 'POST', { username: 'admin', password: 'admin123' }, { 'x-csrf-token': csrfToken });
        if (authRes.status === 200 && authRes.body && authRes.body.token) {
            authToken = authRes.body.token;
            console.log(`✅ Fetched Auth Token`);
        }
    } catch (err) {
        console.error("❌ Failed to fetch Auth Token:", err.message);
    }

    const headers = { 
        'x-csrf-token': csrfToken,
        'Authorization': `Bearer ${authToken}`
    };

    // Test 1: Valid Image Upload
    await runTest("Valid Image Upload Session Init", async () => {
        const res = await request('/api/upload/init', 'POST', {
            fileName: 'test-image.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            totalChunks: 1
        }, headers);
        if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
        if (!res.body.sessionId) throw new Error("Missing sessionId");
    });

    // Test 2: Valid Audio Upload
    await runTest("Valid Audio Upload Session Init", async () => {
        const res = await request('/api/upload/init', 'POST', {
            fileName: 'test-audio.mp3',
            fileSize: 5000,
            mimeType: 'audio/mpeg',
            totalChunks: 2
        }, headers);
        if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    });

    // Test 3: Invalid MIME Type
    await runTest("Invalid MIME Type Rejection", async () => {
        const res = await request('/api/upload/init', 'POST', {
            fileName: 'malicious.exe',
            fileSize: 1024,
            mimeType: 'application/x-msdownload',
            totalChunks: 1
        }, headers);
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    // Test 4: Missing Fields
    await runTest("Missing Fields in Init", async () => {
        const res = await request('/api/upload/init', 'POST', {
            fileName: 'test.jpg'
            // missing fileSize, mimeType, totalChunks
        }, headers);
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    // Test 5: Upload Chunk to Invalid Session
    await runTest("Chunk to Non-existent Session", async () => {
        const res = await request('/api/upload/chunk/invalid-session-123/0', 'POST', Buffer.from('fake data'), {
            'Content-Type': 'application/octet-stream',
            ...headers
        });
        if (res.status !== 404 && res.status !== 400) throw new Error(`Expected 404 or 400, got ${res.status}: ${JSON.stringify(res.body)}`);
    });

    // Test 6: Full Upload Flow & Item Creation
    await runTest("Full Chunked Upload Flow", async () => {
        // Init
        const initRes = await request('/api/upload/init', 'POST', {
            fileName: 'flow.png',
            fileSize: 12,
            mimeType: 'image/png',
            totalChunks: 1
        }, headers);
        const sessionId = initRes.body.sessionId;

        // Chunk
        const chunkRes = await request(`/api/upload/chunk/${sessionId}/0`, 'POST', Buffer.from('hello world!'), {
            'Content-Type': 'application/octet-stream',
            ...headers
        });
        if (chunkRes.status !== 200) throw new Error(`Chunk upload failed: ${chunkRes.status}`);

        // Complete
        const completeRes = await request(`/api/upload/complete/${sessionId}`, 'POST', null, headers);
        if (completeRes.status !== 200) throw new Error(`Complete failed: ${completeRes.status}`);
        if (!completeRes.body.fileUrl) throw new Error(`Missing fileUrl: ${JSON.stringify(completeRes.body)}`);

        // Create Item
        const itemRes = await request('/api/items', 'POST', {
            title: 'Test P2P Item',
            type: 'visual',
            location: 'Local',
            imageUrl: completeRes.body.fileUrl
        }, headers);
        if (itemRes.status !== 201) throw new Error(`Item creation failed: ${itemRes.status} - ${JSON.stringify(itemRes.body)}`);
    });

    console.log("\nAll tests completed.");
}

main();
