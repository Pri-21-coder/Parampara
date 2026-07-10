const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

let csrfToken = '';

async function makeRequest(path, method, body) {
  if (!csrfToken && (method === 'POST' || method === 'PUT')) {
    const res = await makeRequest('/api/csrf-token', 'GET');
    csrfToken = res.body && res.body.csrfToken ? res.body.csrfToken : '';
  }
  const reqOptions = { ...options, path, method };
  if (csrfToken) {
    reqOptions.headers['X-CSRF-Token'] = csrfToken;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch(e) {}
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  try {
    console.log('--- RUNNING MODERATION EDGE CASE TESTS ---');
    
    // EDGE CASE 1: Submitting post with profanity (Expect 422)
    console.log('\n1. Submitting post with profanity ("spam")...');
    let res = await makeRequest('/api/posts', 'POST', {
      title: 'A terrible post',
      village: 'Test Village',
      content: 'This is some spam content with bad words.'
    });
    console.log(`Status: ${res.statusCode} | Body:`, res.body);
    if (res.statusCode !== 422) console.error('❌ FAILED: Should be 422');
    else console.log('✅ PASSED');

    // EDGE CASE 2: Submitting a valid post
    console.log('\n2. Submitting clean post...');
    res = await makeRequest('/api/posts', 'POST', {
      title: 'A lovely post',
      village: 'Test Village',
      content: 'This is a beautiful post about a nice festival.'
    });
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode !== 201) {
      console.error('❌ FAILED: Could not create post.', res.body);
      return;
    }
    const postId = res.body.id;
    console.log('✅ PASSED - Created Post ID:', postId);

    // EDGE CASE 3: Reporting without ID or Type
    console.log('\n3. Reporting without ID or Type...');
    let reportFail = await makeRequest('/api/moderation/report', 'POST', { id: postId });
    console.log(`Status: ${reportFail.statusCode} | Body:`, reportFail.body);
    if (reportFail.statusCode !== 400) console.error('❌ FAILED: Should be 400');
    else console.log('✅ PASSED');

    // EDGE CASE 4: Reporting invalid type
    console.log('\n4. Reporting with invalid type...');
    let reportFail2 = await makeRequest('/api/moderation/report', 'POST', { id: postId, type: 'fakeType' });
    console.log(`Status: ${reportFail2.statusCode} | Body:`, reportFail2.body);
    if (reportFail2.statusCode !== 400) console.error('❌ FAILED: Should be 400');
    else console.log('✅ PASSED');
    
    // EDGE CASE 5: Reporting non-existent ID
    console.log('\n5. Reporting non-existent ID...');
    let reportFail3 = await makeRequest('/api/moderation/report', 'POST', { id: '999999999', type: 'villagePost' });
    console.log(`Status: ${reportFail3.statusCode} | Body:`, reportFail3.body);
    if (reportFail3.statusCode !== 404) console.error('❌ FAILED: Should be 404');
    else console.log('✅ PASSED');

    // EDGE CASE 6: Valid Reporting & Auto-Hide Threshold
    console.log('\n6. Reporting clean post 3 times to trigger Auto-Hide...');
    for (let i = 1; i <= 3; i++) {
      let reportRes = await makeRequest('/api/moderation/report', 'POST', {
        id: postId,
        type: 'villagePost'
      });
      console.log(`Report ${i} Response (Hidden: ${reportRes.body.isHidden})`);
      if (i === 3 && reportRes.body.isHidden !== true) {
        console.error('❌ FAILED: Post should be hidden on 3rd report');
      } else if (i < 3 && reportRes.body.isHidden === true) {
        console.error('❌ FAILED: Post hid too early');
      }
    }
    console.log('✅ PASSED Threshold Logic');

    // EDGE CASE 7: Hidden post should not appear in API
    console.log('\n7. Fetching posts (the reported post should be hidden)...');
    res = await makeRequest('/api/posts', 'GET');
    const posts = res.body;
    const found = posts.find(p => p.id === postId);
    if (found) console.error('❌ FAILED: Post is still in public API');
    else console.log('✅ PASSED - Post successfully hidden from API');
    
  } catch (error) {
    console.error('Test script crashed:', error);
  }
}

runTest();
