const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'trivia:join',
    roomId: 'TEST_ROOM',
    username: 'TestUser'
  }));

  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'trivia:start',
      roomId: 'TEST_ROOM'
    }));
  }, 1000);
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  const msg = JSON.parse(data);
  if (msg.type === 'trivia:question') {
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'trivia:answer',
        roomId: 'TEST_ROOM',
        answerIndex: 1,
        timeTaken: 5000
      }));
    }, 1000);
  } else if (msg.type === 'trivia:state' && msg.state === 'ended') {
    console.log('Game Over. Leaderboard:', msg.leaderboard);
    process.exit(0);
  }
});
