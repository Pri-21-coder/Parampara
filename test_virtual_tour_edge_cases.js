const WebSocket = require('ws');
const assert = require('assert');

const WS_URL = 'ws://localhost:8080';

async function runTests() {
    let failCount = 0;
    console.log('--- 🧪 Testing Virtual Tour Edge Cases 🧪 ---');

    const connect = () => new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => resolve(ws));
    });

    try {
        // Test 1: Participant tries to sync map (Should be ignored by server)
        await new Promise(async (resolve, reject) => {
            const guide = await connect();
            const participant = await connect();
            const roomId = 'edge-tour-1';

            let participantMapSyncReceived = false;

            guide.send(JSON.stringify({ type: 'tour:create', roomId }));
            
            setTimeout(() => {
                participant.send(JSON.stringify({ type: 'tour:join', roomId, username: 'p1' }));
            }, 100);

            participant.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'tour:sync_map') {
                    participantMapSyncReceived = true;
                }
            });

            setTimeout(() => {
                // Participant maliciously tries to sync map
                participant.send(JSON.stringify({
                    type: 'tour:sync_map',
                    roomId,
                    state: { center: [0, 0], zoom: 1 }
                }));

                setTimeout(() => {
                    if (participantMapSyncReceived) {
                        console.error('❌ FAIL: Participant was able to sync map!');
                        failCount++;
                    } else {
                        console.log('✅ PASS: Server ignores map sync from non-guide participants');
                    }
                    guide.close();
                    participant.close();
                    resolve();
                }, 200);
            }, 200);
        });

        // Test 2: Guide leaves, participants are notified
        await new Promise(async (resolve) => {
            const guide = await connect();
            const participant = await connect();
            const roomId = 'edge-tour-2';

            guide.send(JSON.stringify({ type: 'tour:create', roomId }));
            setTimeout(() => {
                participant.send(JSON.stringify({ type: 'tour:join', roomId, username: 'p1' }));
            }, 50);

            let guideLeftReceived = false;
            participant.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'tour:guide_left') {
                    guideLeftReceived = true;
                }
            });

            setTimeout(() => {
                guide.close(); // Guide disconnects
                setTimeout(() => {
                    if (guideLeftReceived) {
                        console.log('✅ PASS: Participants correctly notified when Guide leaves');
                    } else {
                        console.error('❌ FAIL: Participants not notified when Guide leaves');
                        failCount++;
                    }
                    participant.close();
                    resolve();
                }, 100);
            }, 150);
        });

        // Test 3: Join a tour that hasn't been created yet
        await new Promise(async (resolve) => {
            const participant = await connect();
            const roomId = 'edge-tour-3';

            let stateSyncReceived = false;
            participant.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'tour:state_sync') {
                    stateSyncReceived = true;
                }
            });

            participant.send(JSON.stringify({ type: 'tour:join', roomId, username: 'p1' }));

            setTimeout(() => {
                // Should not receive a state sync because the tour doesn't exist
                if (!stateSyncReceived) {
                    console.log('✅ PASS: Joining non-existent tour does not crash server and sends no state');
                } else {
                    console.error('❌ FAIL: Received state sync for non-existent tour');
                    failCount++;
                }
                participant.close();
                resolve();
            }, 150);
        });

        // Test 4: Malformed JSON sent during tour
        await new Promise(async (resolve) => {
            const guide = await connect();
            
            let errorReceived = false;
            guide.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'error') {
                    errorReceived = true;
                }
            });

            // Send raw string instead of JSON
            guide.send("THIS IS NOT JSON");

            setTimeout(() => {
                if (errorReceived) {
                    console.log('✅ PASS: Server handles malformed JSON gracefully');
                } else {
                    console.error('❌ FAIL: Server did not respond with error for malformed JSON (or crashed)');
                    failCount++;
                }
                guide.close();
                resolve();
            }, 100);
        });

        // Test 5 (Custom): Rapid fire map syncs from guide to test server stability and deduplication
        await new Promise(async (resolve) => {
            const guide = await connect();
            const participant = await connect();
            const roomId = 'edge-tour-5';

            let syncCount = 0;
            guide.send(JSON.stringify({ type: 'tour:create', roomId }));
            
            setTimeout(() => {
                participant.send(JSON.stringify({ type: 'tour:join', roomId, username: 'p1' }));
            }, 50);

            participant.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.type === 'tour:sync_map') {
                    syncCount++;
                }
            });

            setTimeout(() => {
                // Guide fires 100 map syncs in 100ms
                for(let i = 0; i < 100; i++) {
                    guide.send(JSON.stringify({
                        type: 'tour:sync_map',
                        roomId,
                        state: { center: [i, i], zoom: 5 }
                    }));
                }

                setTimeout(() => {
                    if (syncCount === 100) {
                        console.log('✅ PASS: Server handled 100 rapid-fire map syncs without dropping or crashing');
                    } else {
                        console.error(`❌ FAIL: Server dropped syncs. Expected 100, got ${syncCount}`);
                        failCount++;
                    }
                    guide.close();
                    participant.close();
                    resolve();
                }, 500);
            }, 150);
        });

    } catch (e) {
        console.error('Test suite error:', e);
        failCount++;
    }

    console.log(`\n📊 Results: ${5 - failCount} Passed, ${failCount} Failed`);
    process.exit(failCount > 0 ? 1 : 0);
}

runTests();
