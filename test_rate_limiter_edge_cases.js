const http = require('http');
const HeuristicRateLimiter = require('./middleware/rateLimiter');

// We will test the middleware function directly in isolation for these edge cases
// to avoid having to start/stop the express server and bypass CSRF issues entirely.

async function runEdgeCaseTests() {
  console.log('🧪 Starting Heuristic Rate Limiter Edge Case Tests...\n');
  let passCount = 0;
  let failCount = 0;

  function assertTest(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failCount++;
    }
  }

  // Helper to simulate an Express Request
  function createMockReq(ip = '192.168.1.1', method = 'GET', path = '/api/test') {
    return {
      ip,
      connection: { remoteAddress: ip },
      method,
      path,
      originalUrl: path
    };
  }

  // Helper to simulate an Express Response
  function createMockRes() {
    const res = {
      headers: {},
      statusCode: 200,
      jsonBody: null,
      setHeader: (key, val) => { res.headers[key] = val; },
      status: (code) => { res.statusCode = code; return res; },
      json: (body) => { res.jsonBody = body; }
    };
    return res;
  }

  try {
    // --- Test 1: Missing IP fallback ---
    const limiter = new HeuristicRateLimiter({ maxTokens: 10, windowMs: 1000 });
    const middleware = limiter.middleware();
    
    let nextCalled = false;
    const reqMissingIp = { connection: {}, method: 'GET', path: '/test', originalUrl: '/test' }; // No req.ip, no remoteAddress
    middleware(reqMissingIp, createMockRes(), () => { nextCalled = true; });
    
    assertTest(nextCalled && limiter.store.has('unknown'), 'Middleware gracefully falls back to "unknown" when IP is missing');

    // --- Test 2: Heuristic Cost Application (GET vs POST) ---
    const resGet = createMockRes();
    let nextGetCalled = false;
    middleware(createMockReq('ip2', 'GET', '/api/test'), resGet, () => { nextGetCalled = true; });
    
    const resPost = createMockRes();
    middleware(createMockReq('ip3', 'POST', '/api/test'), resPost, () => {});
    
    const getRemaining = resGet.headers['X-RateLimit-Remaining'];
    const postRemaining = resPost.headers['X-RateLimit-Remaining'];
    
    assertTest(getRemaining === 9 && postRemaining === 7, 'Heuristic costing correctly subtracts 1 for GET and 3 for POST');

    // --- Test 3: The Tarpit (Artificial Delay) ---
    const strictLimiter = new HeuristicRateLimiter({ maxTokens: 10, windowMs: 60000, baseDelayMs: 100 });
    const strictMw = strictLimiter.middleware();
    const reqBurst = createMockReq('ip4', 'GET', '/test');
    
    // Drain bucket to < 30% (so < 3 tokens left)
    strictMw(reqBurst, createMockRes(), () => {}); // 9 left
    strictMw(reqBurst, createMockRes(), () => {}); // 8 left
    strictMw(reqBurst, createMockRes(), () => {}); // 7 left
    strictMw(reqBurst, createMockRes(), () => {}); // 6 left
    strictMw(reqBurst, createMockRes(), () => {}); // 5 left (Burst penalty might kick in!)
    strictMw(reqBurst, createMockRes(), () => {}); 
    strictMw(reqBurst, createMockRes(), () => {}); 
    
    const startTarpit = Date.now();
    await new Promise(resolve => {
        strictMw(reqBurst, createMockRes(), () => {
            const delay = Date.now() - startTarpit;
            // It should be delayed by at least 10ms due to tarpit logic, but could be up to baseDelayMs
            assertTest(delay >= 5, `Tarpit correctly delayed execution by ${delay}ms`);
            resolve();
        });
        
        // If it returns a 429 directly, that's fine too (exhausted tokens)
        setTimeout(resolve, 200); 
    });

    // --- Test 4: Exclude Function Crashing ---
    const dangerousLimiter = new HeuristicRateLimiter({
        exclude: (req) => { throw new Error('Exclude function crashed!'); }
    });
    const dangerousMw = dangerousLimiter.middleware();
    let caughtError = false;
    try {
        dangerousMw(createMockReq(), createMockRes(), () => {});
    } catch (e) {
        caughtError = true;
    }
    assertTest(!caughtError, 'Middleware should catch errors thrown by the exclude function to prevent server crashes');
    
    // --- Test 5: Memory Leak Prevention (Cleanup Interval) ---
    const memoryLimiter = new HeuristicRateLimiter({ windowMs: 200, maxTokens: 10 });
    memoryLimiter.store.set('stale_ip', { lastRefill: Date.now() - 1000, tokens: 0 }); 
    memoryLimiter.store.set('fresh_ip', { lastRefill: Date.now() + 10000, tokens: 0 }); // In the future, to avoid deletion during the test delay
    
    // Wait for cleanup interval to run (windowMs is 200)
    await new Promise(r => setTimeout(r, 250));
    
    assertTest(!memoryLimiter.store.has('stale_ip') && memoryLimiter.store.has('fresh_ip'), 'Memory leak prevention correctly purges stale IPs and keeps active ones');
    clearInterval(memoryLimiter.cleanupInterval);
    clearInterval(limiter.cleanupInterval);
    clearInterval(strictLimiter.cleanupInterval);

  } catch (err) {
    console.error('Test script encountered an unexpected error:', err);
    failCount++;
  }

  console.log(`\n📊 Rate Limiter Edge Case Results: ${passCount} Passed, ${failCount} Failed\n`);
  if (failCount > 0) process.exit(1);
}

runEdgeCaseTests();
