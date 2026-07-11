const WebSocket = require('ws');

const guideWs = new WebSocket('ws://localhost:8080');
const participantWs = new WebSocket('ws://localhost:8080');

let passed = 0;
const sessionId = 'tour-test123';

guideWs.on('open', () => {
    console.log('Guide connected.');
    guideWs.send(JSON.stringify({
        type: 'tour:create',
        roomId: sessionId
    }));
});

guideWs.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'tour:created') {
        console.log('✅ Guide successfully created tour.');
        passed++;
        
        // Participant joins
        participantWs.send(JSON.stringify({
            type: 'tour:join',
            roomId: sessionId,
            username: 'Tester'
        }));
    } else if (msg.type === 'tour:participant_joined') {
        console.log('✅ Guide received participant join notification.');
        passed++;
        
        // Guide syncs map
        guideWs.send(JSON.stringify({
            type: 'tour:sync_map',
            roomId: sessionId,
            state: { center: [12.34, 56.78], zoom: 10 }
        }));
    }
});

participantWs.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'tour:state_sync') {
        console.log('✅ Participant received initial state sync upon joining.');
        passed++;
    } else if (msg.type === 'tour:sync_map') {
        console.log('✅ Participant received map sync from guide:', msg.state);
        passed++;
        
        if (msg.state.zoom === 10) {
            console.log('✅ All tests passed!');
            process.exit(0);
        }
    }
});

setTimeout(() => {
    console.error('❌ Test timed out. Passed:', passed);
    process.exit(1);
}, 3000);
