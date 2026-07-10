process.env.WS_PORT = 0; // Use random port for WebSocket server
process.env.PORT = 0; // Use random port for HTTP server
const http = require('http');
const { app, wsServer } = require('./server'); // Import express app
const notificationService = require('./server/services/notificationService');
const store = require('./data/store');
const { generateToken } = require('./utils/jwt');

// Use a dynamic port for testing
const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;
let serverInstance;

// Simple SSE Client for Node.js
class TestSSEClient {
  constructor(url) {
    this.url = url;
    this.events = [];
    this.req = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.req = http.get(this.url, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Status Code: ${res.statusCode}`));
        }

        let buffer = '';
        res.on('data', (chunk) => {
          buffer += chunk.toString();
          let parts = buffer.split('\n\n');
          buffer = parts.pop(); // Keep incomplete chunk

          for (const line of parts) {
            if (!line.trim()) continue;
            const eventMatch = line.match(/event:\s*([^\n]+)/);
            const dataMatch = line.match(/data:\s*([^\n]+)/);
            if (eventMatch && dataMatch) {
              const eventType = eventMatch[1].trim();
              const eventData = JSON.parse(dataMatch[1].trim());
              this.events.push({ type: eventType, data: eventData });
            }
          }
        });

        // Resolve once connected and first initial event is received
        setTimeout(() => resolve(res), 200);
      });

      this.req.on('error', reject);
    });
  }

  disconnect() {
    if (this.req) {
      this.req.destroy();
    }
  }
}

async function runTests() {
  console.log('--- Starting Advanced SSE Edge Cases Test ---');

  serverInstance = http.createServer(app).listen(PORT);
  console.log(`Test server running on port ${PORT}`);

  try {
    // Generate Auth Tokens for User A and User B
    const tokenA = generateToken({ id: 'userA', role: 'Contributor' });
    const tokenB = generateToken({ id: 'userB', role: 'Contributor' });
    const adminToken = generateToken({ id: 'adminUser', role: 'Administrator' });

    // Fetch CSRF Token
    const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    console.log(`✅ Fetched CSRF Token: ${csrfToken.substring(0, 5)}...`);

    // 1. Test Authenticated Connections (Channels)
    console.log('\n[Test 1] Authenticated Client Connections (Channels)');
    
    const clientA = new TestSSEClient(`${BASE_URL}/api/notifications/stream?token=${tokenA}`);
    const clientB = new TestSSEClient(`${BASE_URL}/api/notifications/stream?token=${tokenB}`);
    const clientAnon = new TestSSEClient(`${BASE_URL}/api/notifications/stream`);

    await Promise.all([clientA.connect(), clientB.connect(), clientAnon.connect()]);

    if (notificationService.clients.size === 3) {
      console.log('✅ All 3 clients connected successfully');
    } else {
      throw new Error(`Expected 3 clients, found ${notificationService.clients.size}`);
    }

    // Verify channel subscriptions
    const clientAChannels = clientA.events.find(e => e.type === 'connected').data.channels;
    if (clientAChannels.includes('global') && clientAChannels.includes('user_userA')) {
      console.log('✅ Client A subscribed to correct personalized channels');
    } else {
      throw new Error('Client A channel mapping incorrect');
    }

    // 2. Test Direct Messaging (Personalized Alerts)
    console.log('\n[Test 2] Direct (Personalized) Delivery');
    
    // Broadcast a direct alert to user A
    notificationService.sendDirectNotification('userA', 'alert', { message: 'Warning to User A' }, 'alert');
    await new Promise(resolve => setTimeout(resolve, 300)); // wait for network

    if (clientA.events.find(e => e.type === 'alert' && e.data.data.message === 'Warning to User A')) {
      console.log('✅ Client A received direct alert');
    } else {
      throw new Error('Client A failed to receive direct alert');
    }

    if (!clientB.events.find(e => e.type === 'alert')) {
      console.log('✅ Client B correctly DID NOT receive Client A\'s alert');
    } else {
      throw new Error('Privacy leak: Client B received Client A alert');
    }

    if (!clientAnon.events.find(e => e.type === 'alert')) {
      console.log('✅ Anonymous Client correctly DID NOT receive personalized alert');
    } else {
      throw new Error('Privacy leak: Anon Client received Client A alert');
    }

    // 3. Test Global Categorized Delivery (Item Creation)
    console.log('\n[Test 3] Global Categorized Delivery (Item Creation)');
    
    const newItemResponse = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ title: 'Categorized Asset', type: 'visual', location: 'Test Village' })
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    const itemEventA = clientA.events.find(e => e.type === 'new_item');
    const itemEventB = clientB.events.find(e => e.type === 'new_item');
    const itemEventAnon = clientAnon.events.find(e => e.type === 'new_item');

    if (itemEventA && itemEventB && itemEventAnon && itemEventA.data.category === 'community') {
      console.log('✅ All clients received global categorized broadcast successfully');
    } else {
      throw new Error('Global categorized broadcast failed');
    }

    // 4. Test Backend Synchronized Read States
    console.log('\n[Test 4] Backend Read State Synchronization');
    
    const notificationId = itemEventA.data.id;
    const readResponse = await fetch(`${BASE_URL}/api/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ notificationIds: [notificationId] })
    });
    
    const readData = await readResponse.json();
    if (readData.success && store.userNotifications['userA'].readIds.has(notificationId)) {
      console.log('✅ User A read state successfully synced to backend memory');
    } else {
      throw new Error('Backend read sync failed');
    }

    // 5. Test History Endpoint incorporates synced Read States
    console.log('\n[Test 5] History API Returns Synced Read States');
    const historyResponse = await fetch(`${BASE_URL}/api/notifications/history`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const historyData = await historyResponse.json();

    if (historyData.readIds.includes(notificationId)) {
      console.log('✅ History API properly merges backend read states for authenticated users');
    } else {
      throw new Error('History API did not return synced read states');
    }

    // Cleanup
    clientA.disconnect();
    clientB.disconnect();
    clientAnon.disconnect();

    console.log('\n🎉 ALL ADVANCED SSE TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    if (serverInstance) serverInstance.close();
    if (wsServer && wsServer.wss) wsServer.wss.close();
    console.log('\nServer shut down.');
  }
}

runTests();
