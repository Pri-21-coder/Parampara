const WebSocket = require('ws');
const assert = require('assert');

const WS_URL = 'ws://localhost:8080';

async function runSyncEdgeCaseTests() {
    console.log('🧪 Starting WebRTC Sync Signaling Edge Case Tests...\n');
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

    // Helper to connect a mock client
    function connectClient() {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(WS_URL);
            let clientId = null;
            
            ws.on('open', () => {
                // Wait for init message to get our ID
            });
            
            ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    if (msg.type === 'init') {
                        clientId = msg.userId;
                        resolve({ ws, clientId });
                    }
                } catch (e) {}
            });
            
            ws.on('error', reject);
        });
    }

    try {
        const client1 = await connectClient();
        const client2 = await connectClient();
        
        // --- Test 1: sync:join and peer discovery ---
        let peerJoinedFired = false;
        client1.ws.on('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.type === 'sync:peer-joined' && msg.userId === client2.clientId) {
                peerJoinedFired = true;
            }
        });
        
        client1.ws.send(JSON.stringify({ type: 'sync:join' }));
        await new Promise(r => setTimeout(r, 100)); // wait a bit
        
        // Client 2 joins, Client 1 should be notified
        client2.ws.send(JSON.stringify({ type: 'sync:join' }));
        await new Promise(r => setTimeout(r, 200)); 
        
        assertTest(peerJoinedFired, 'Peer discovery correctly broadcasts sync:peer-joined to existing nodes');

        // --- Test 2: WebRTC Signaling Routing ---
        let offerReceived = false;
        client2.ws.on('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.type === 'webrtc:offer' && msg.sourceId === client1.clientId && msg.offer === 'MOCK_OFFER') {
                offerReceived = true;
            }
        });
        
        client1.ws.send(JSON.stringify({
            type: 'webrtc:offer',
            targetId: client2.clientId,
            offer: 'MOCK_OFFER'
        }));
        await new Promise(r => setTimeout(r, 200));
        
        assertTest(offerReceived, 'Signaling server successfully and securely routes P2P WebRTC offers based on targetId');

        // --- Test 3: Missing targetId (Edge Case) ---
        // Should not crash the server
        let serverCrashed = false;
        client1.ws.send(JSON.stringify({
            type: 'webrtc:offer',
            offer: 'ORPHAN_OFFER'
        }));
        await new Promise(r => setTimeout(r, 100));
        assertTest(client1.ws.readyState === WebSocket.OPEN, 'Server handles missing targetId without crashing');

        // --- Test 4: Invalid targetId (Edge Case) ---
        client1.ws.send(JSON.stringify({
            type: 'webrtc:answer',
            targetId: 'non-existent-user-id',
            answer: 'GHOST_ANSWER'
        }));
        await new Promise(r => setTimeout(r, 100));
        assertTest(client1.ws.readyState === WebSocket.OPEN, 'Server handles invalid/disconnected targetId gracefully');

        // --- Test 5: Malformed JSON (Security/Edge Case) ---
        let errorMessageReceived = false;
        client1.ws.on('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.type === 'error' && msg.message === 'Invalid message format') {
                errorMessageReceived = true;
            }
        });
        client1.ws.send('THIS IS NOT VALID JSON {[');
        await new Promise(r => setTimeout(r, 200));
        assertTest(errorMessageReceived, 'Server catches malformed JSON and returns standard error message without crashing');

        // --- Test 6: Extreme Payload Size (Buffer/Memory Edge Case) ---
        const hugePayload = 'A'.repeat(500000); // 500KB mock candidate
        client1.ws.send(JSON.stringify({
            type: 'webrtc:candidate',
            targetId: client2.clientId,
            candidate: hugePayload
        }));
        await new Promise(r => setTimeout(r, 200));
        assertTest(client1.ws.readyState === WebSocket.OPEN, 'Server handles extremely large signaling payloads without crashing');

        // Clean up
        client1.ws.close();
        client2.ws.close();

    } catch (err) {
        console.error('Test script encountered an unexpected error:', err);
        failCount++;
    }

    console.log(`\n📊 Sync Edge Case Results: ${passCount} Passed, ${failCount} Failed\n`);
    if (failCount > 0) process.exit(1);
}

runSyncEdgeCaseTests();
