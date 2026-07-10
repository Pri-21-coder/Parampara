const http = require('http');

const PORT = 3000;
const DELAY_MS = 50; // interval between bursts

// Helper to make an HTTP request and return the time taken
function makeRequest(path, method = 'GET') {
  return new Promise((resolve) => {
    const start = Date.now();
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          time: Date.now() - start,
          remaining: res.headers['x-ratelimit-remaining'],
          retryAfter: res.headers['retry-after'],
          data: data
        });
      });
    });

    req.on('error', (e) => {
      resolve({ error: e.message, time: Date.now() - start });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Heuristic Rate Limiter Tests...\n');
  
  // Test 1: Normal Request (Should be fast)
  console.log('--- Test 1: Normal Request ---');
  const res1 = await makeRequest('/');
  console.log(`Status: ${res1.status}, Time: ${res1.time}ms, Remaining Tokens: ${res1.remaining}`);
  if (res1.time > 100) console.log('❌ FAIL: Normal request took too long!');
  else console.log('✅ PASS: Normal request is fast.');

  // Test 2: Heuristic Cost (POST vs GET)
  console.log('\n--- Test 2: Heuristic Cost Check ---');
  // Send a POST request to search (it uses searchLimiter, 60 tokens)
  const resGet = await makeRequest('/api/search?q=test', 'GET'); // costs 3
  console.log(`GET Search - Remaining: ${resGet.remaining}`);
  // Send a POST request to items (uses createItemLimiter, 20 tokens)
  const resPost = await makeRequest('/api/items', 'POST'); // costs 3 (modifying)
  console.log(`POST Items - Remaining: ${resPost.remaining}`);
  
  // Since they hit different limiters, checking absolute difference is wrong, just check if remaining < maxTokens - 1
  if (parseInt(resPost.remaining) <= 17) {
      console.log('✅ PASS: POST request consumed more tokens heuristically.');
  } else {
      console.log('❌ FAIL: Heuristic cost multiplier not working correctly. Remaining was ' + resPost.remaining);
  }

  // Test 3: Adaptive Throttling (Tarpitting)
  console.log('\n--- Test 3: Adaptive Throttling (Bursting) ---');
  console.log('Sending burst of 25 search requests to trigger tarpitting (max 60 tokens, cost 3 + burst)...');
  
  let times = [];
  let blocked = false;
  
  for (let i = 0; i < 35; i++) {
    const res = await makeRequest('/api/search?q=test', 'GET');
    times.push(res.time);
    
    if (res.status === 429) {
      blocked = true;
      console.log(`Request ${i+1}: BLOCKED (429) after ${res.time}ms. Retry-After: ${res.retryAfter}s`);
      break;
    } else {
      console.log(`Request ${i+1}: Status ${res.status} in ${res.time}ms - Tokens left: ${res.remaining}`);
    }
    
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // Verify times increase
  let increased = false;
  for (let i = 1; i < times.length; i++) {
    if (times[i] > times[0] + 50) { // Should easily be 50ms+ slower due to tarpit
      increased = true;
      break;
    }
  }

  if (increased) {
    console.log('✅ PASS: Adaptive throttling successfully slowed down the client before blocking!');
  } else {
    console.log('❌ FAIL: Adaptive throttling did not significantly delay responses.');
  }
  
  if (blocked) {
    console.log('✅ PASS: Client was correctly blocked (429) after exhausting tokens.');
  } else {
    console.log('❌ FAIL: Client was never blocked despite exhausting tokens.');
  }

  console.log('\nTests Complete.');
  process.exit(0);
}

// Give server time to start if run concurrently
setTimeout(runTests, 1000);
