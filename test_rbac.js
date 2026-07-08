const http = require('http');

const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Starting RBAC Tests ---');
  let adminToken, visitorToken, csrfToken;

  try {
    // 0. Get CSRF Token
    const csrfRes = await fetch(`${API_BASE}/csrf-token`);
    const csrfData = await csrfRes.json();
    if (csrfData.csrfToken) {
      csrfToken = csrfData.csrfToken;
      console.log('✅ Fetched CSRF token');
    } else {
      console.error('❌ Failed to fetch CSRF token');
      return;
    }

    // 1. Test Login - Valid Admin
    console.log('\n1. Testing Login - Admin (Valid)');
    const res1 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const data1 = await res1.json();
    if (res1.ok && data1.token) {
      console.log('✅ Admin login successful');
      adminToken = data1.token;
    } else {
      console.error('❌ Admin login failed', data1);
    }

    // 2. Test Login - Invalid Credentials
    console.log('\n2. Testing Login - Invalid Password');
    const res2 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
    });
    if (res2.status === 401) {
      console.log('✅ Correctly rejected invalid password (401)');
    } else {
      console.error('❌ Expected 401, got', res2.status);
    }

    // 3. Test Login - Visitor
    console.log('\n3. Testing Login - Visitor (Valid)');
    const res3 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ username: 'visitor', password: 'visitor123' })
    });
    const data3 = await res3.json();
    if (res3.ok && data3.token) {
      console.log('✅ Visitor login successful');
      visitorToken = data3.token;
    } else {
      console.error('❌ Visitor login failed', data3);
    }

    // 4. Test Protected Route without Token
    console.log('\n4. Testing Protected Route without Token');
    const res4 = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ title: 'Test Item', description: 'Test', location: 'Test' })
    });
    if (res4.status === 401) {
      console.log('✅ Correctly blocked unauthenticated request (401)');
    } else {
      console.error('❌ Expected 401, got', res4.status, await res4.text());
    }

    // 5. Test Admin-Only Route with Visitor Token
    console.log('\n5. Testing Admin-Only Route with Visitor Token');
    const res5 = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${visitorToken}` }
    });
    if (res5.status === 403) {
      console.log('✅ Correctly blocked visitor from accessing /users (403)');
    } else {
      console.error('❌ Expected 403, got', res5.status, await res5.text());
    }

    // 6. Test Admin-Only Route with Admin Token
    console.log('\n6. Testing Admin-Only Route with Admin Token');
    const res6 = await fetch(`${API_BASE}/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data6 = await res6.json();
    if (res6.ok && Array.isArray(data6)) {
      console.log(`✅ Admin successfully accessed /users. Found ${data6.length} users.`);
    } else {
      console.error('❌ Admin failed to access /users', data6);
    }

    // 7. Test Creating New User (Custom Data)
    console.log('\n7. Testing Creating a New Custom User');
    const customUser = { username: 'custom_curator', password: 'custompassword', role: 'Curator' };
    const res7 = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}`, 'x-csrf-token': csrfToken },
      body: JSON.stringify(customUser)
    });
    const data7 = await res7.json();
    if (res7.ok && data7.user) {
      console.log('✅ Custom user created successfully:', data7.user.username);
    } else {
      console.error('❌ Failed to create custom user', data7);
    }

    // 8. Test Login with Custom User
    console.log('\n8. Testing Login with New Custom User');
    let customToken, customRefreshToken;
    const res8 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ username: customUser.username, password: customUser.password })
    });
    const data8 = await res8.json();
    if (res8.ok && data8.token) {
      console.log('✅ Custom user login successful');
      customToken = data8.token;
      customRefreshToken = data8.refreshToken;
    } else {
      console.error('❌ Custom user login failed', data8);
    }

    // 9. Test Curator posting an item
    console.log('\n9. Testing Curator posting an item');
    const res9 = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customToken}`, 'x-csrf-token': csrfToken },
      body: JSON.stringify({ title: 'New Custom Item', description: 'Testing RBAC', location: 'Test Location', type: 'visual' })
    });
    const data9 = await res9.json();
    let newItemId;
    if (res9.ok) {
      console.log('✅ Curator successfully posted an item');
      newItemId = data9.id;
    } else {
      console.error('❌ Curator failed to post item', data9);
    }

    // 10. Test Contributor Login (contrib1 from sampleData)
    console.log('\n10. Testing Login with Contributor (contrib1)');
    let contribToken;
    const res10 = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ username: 'contributor', password: 'contrib123' })
    });
    const data10 = await res10.json();
    if (res10.ok && data10.token) {
      contribToken = data10.token;
    }

    // 11. Test Contributor deleting someone else's item (should fail)
    console.log('\n11. Testing Contributor deleting someone else\'s item (Expect 403)');
    const res11 = await fetch(`${API_BASE}/items/${newItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${contribToken}`, 'x-csrf-token': csrfToken }
    });
    if (res11.status === 403) {
      console.log('✅ Correctly blocked Contributor from deleting someone else\'s item');
    } else {
      console.error('❌ Expected 403, got', res11.status);
    }

    // 12. Test Curator deleting their own item (should succeed)
    console.log('\n12. Testing Curator deleting their own item');
    const res12 = await fetch(`${API_BASE}/items/${newItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customToken}`, 'x-csrf-token': csrfToken }
    });
    if (res12.ok) {
      console.log('✅ Curator successfully deleted their own item');
    } else {
      console.error('❌ Curator failed to delete their item', await res12.text());
    }

    // 13. Test Refresh Token
    console.log('\n13. Testing Refresh Token Exchange');
    const res13 = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ token: customRefreshToken })
    });
    const data13 = await res13.json();
    if (res13.ok && data13.token) {
      console.log('✅ Successfully obtained new access token via refresh token');
    } else {
      console.error('❌ Failed to refresh token', data13);
    }

    // 14. Test Logout (Revoke Refresh Token)
    console.log('\n14. Testing Logout & Token Revocation');
    const res14 = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ token: customRefreshToken })
    });
    if (res14.ok) {
      console.log('✅ Logout successful');
      
      // Try refresh again
      const res15 = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ token: customRefreshToken })
      });
      if (res15.status === 403) {
        console.log('✅ Correctly rejected revoked refresh token (403)');
      } else {
        console.error('❌ Expected 403 for revoked refresh token, got', res15.status);
      }
    }

  } catch (error) {
    console.error('Test Execution Error:', error);
  }
}

const net = require('net');
const client = new net.Socket();
client.setTimeout(1000);
client.connect(3000, '127.0.0.1', function() {
  console.log('Server is already running.');
  client.destroy();
  runTests().then(() => process.exit(0));
});
client.on('error', function(e) {
  console.log('Server is not running. Starting server for tests...');
  require('./server');
  setTimeout(() => {
    runTests().then(() => {
      process.exit(0);
    });
  }, 2000);
});
