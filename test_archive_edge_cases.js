const { app, server } = require('./server');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('--- Starting Archive Edge Case Tests ---\n');

  // Wait a moment for server to bind
  await new Promise(resolve => setTimeout(resolve, 1000));

  let csrfToken = '';
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfRes.json();
    csrfToken = csrfData.csrfToken;
    console.log(`Got CSRF Token: ${csrfToken ? 'Yes' : 'No'}`);
  } catch(e) {
    console.error('Failed to get CSRF token', e);
  }

  const postHeaders = {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  };

  try {
    // 1. Missing fields when registering key
    console.log('Test 1: Missing fields when registering key');
    const res1 = await fetch(`${BASE_URL}/api/archives/keys`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({ userId: 'testUser1' }) // missing publicKey
    });
    if (res1.status !== 400) {
      console.error('❌ Test 1 Failed: Expected 400, got', res1.status);
    } else {
      console.log('✅ Test 1 Passed');
    }

    // 2. Register valid key
    console.log('\nTest 2: Register valid key');
    const res2 = await fetch(`${BASE_URL}/api/archives/keys`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        userId: 'testUser1',
        publicKey: { kty: 'RSA', e: 'AQAB', n: 'test' }
      })
    });
    if (res2.status !== 200) {
      console.error('❌ Test 2 Failed: Expected 200, got', res2.status);
    } else {
      console.log('✅ Test 2 Passed');
    }

    // 3. Get specific public key
    console.log('\nTest 3: Get specific public key');
    const res3 = await fetch(`${BASE_URL}/api/archives/keys/testUser1`);
    const body3 = await res3.json();
    if (res3.status !== 200 || !body3.publicKey) {
      console.error('❌ Test 3 Failed:', body3);
    } else {
      console.log('✅ Test 3 Passed');
    }

    // 4. Get non-existent public key
    console.log('\nTest 4: Get non-existent public key');
    const res4 = await fetch(`${BASE_URL}/api/archives/keys/nonexistentUser`);
    if (res4.status !== 404) {
      console.error('❌ Test 4 Failed: Expected 404, got', res4.status);
    } else {
      console.log('✅ Test 4 Passed');
    }

    // 5. Create archive with missing fields
    console.log('\nTest 5: Create archive with missing fields');
    const res5 = await fetch(`${BASE_URL}/api/archives`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        title: 'Secret Diary',
        ownerId: 'testUser1'
      })
    });
    if (res5.status !== 400) {
      console.error('❌ Test 5 Failed: Expected 400, got', res5.status);
    } else {
      console.log('✅ Test 5 Passed');
    }

    // 6. Create valid archive
    console.log('\nTest 6: Create valid archive');
    const res6 = await fetch(`${BASE_URL}/api/archives`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        title: 'Secret Diary',
        ownerId: 'testUser1',
        encryptedContent: 'mockCiphertext',
        iv: 'mockIV',
        encryptedKeys: { 'testUser1': 'mockEncryptedKey' }
      })
    });
    if (res6.status !== 201) {
      console.error('❌ Test 6 Failed: Expected 201, got', res6.status);
    } else {
      console.log('✅ Test 6 Passed');
    }

    // 7. Get archives missing userId
    console.log('\nTest 7: Get archives missing userId');
    const res7 = await fetch(`${BASE_URL}/api/archives`);
    if (res7.status !== 400) {
      console.error('❌ Test 7 Failed: Expected 400, got', res7.status);
    } else {
      console.log('✅ Test 7 Passed');
    }

    // 8. Get archives for user
    console.log('\nTest 8: Get archives for user');
    const res8 = await fetch(`${BASE_URL}/api/archives?userId=testUser1`);
    const body8 = await res8.json();
    if (res8.status !== 200 || body8.length !== 1) {
      console.error('❌ Test 8 Failed: Expected 1 archive, got', body8);
    } else {
      console.log('✅ Test 8 Passed');
      if (body8[0].title === 'Secret Diary') {
        console.log('   Archive correctly identified.');
      }
    }

    // 9. Get archives for unauthorized user
    console.log('\nTest 9: Get archives for unauthorized user');
    const res9 = await fetch(`${BASE_URL}/api/archives?userId=unauthorizedUser`);
    const body9 = await res9.json();
    if (res9.status !== 200 || body9.length !== 0) {
      console.error('❌ Test 9 Failed: Expected 0 archives, got', body9);
    } else {
      console.log('✅ Test 9 Passed');
    }

    console.log('\n--- All Tests Completed ---');
  } catch (err) {
    console.error('Test Execution Error:', err);
  } finally {
    // Close the server and exit
    server.close();
    process.exit(0);
  }
}

runTests();
