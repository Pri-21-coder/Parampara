document.addEventListener('DOMContentLoaded', () => {
  let ws = null;
  let currentRoomId = null;
  let username = null;
  let timerInterval = null;
  let myScore = 0;
  let hasAnswered = false;
  let questionStartTime = 0;

  // DOM Elements
  const screens = {
    lobby: document.getElementById('screen-lobby'),
    waiting: document.getElementById('screen-waiting'),
    game: document.getElementById('screen-game'),
    intermission: document.getElementById('screen-intermission'),
    ended: document.getElementById('screen-ended')
  };

  function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
  }

  // WS Connection Setup
  function connectWebSocket() {
    const wsUrl = window.location.protocol === 'https:' 
      ? `wss://${window.location.hostname}:8080`
      : `ws://${window.location.hostname}:8080`;
      
    ws = new ResilientWebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to Trivia Server');
      // Join Room
      ws.send(JSON.stringify({
        type: 'trivia:join',
        roomId: currentRoomId,
        username: username
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleServerMessage(msg);
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      alert('Connection lost. Please refresh.');
    };
  }

  // Handle Incoming Messages
  function handleServerMessage(msg) {
    switch (msg.type) {
      case 'trivia:state':
        updateLobby(msg.leaderboard);
        if (msg.state === 'waiting') switchScreen('waiting');
        if (msg.state === 'ended') {
          updateLeaderboard('final-leaderboard', msg.leaderboard);
          switchScreen('ended');
        }
        break;

      case 'trivia:question':
        startQuestion(msg);
        break;

      case 'trivia:round_end':
        showRoundEnd(msg);
        break;
    }
  }

  // Lobby Logic
  document.getElementById('btn-join').addEventListener('click', () => {
    const userIn = document.getElementById('username').value.trim();
    const roomIn = document.getElementById('room-id').value.trim().toUpperCase();

    if (!userIn || !roomIn) return alert('Please enter both name and room code');

    username = userIn;
    currentRoomId = roomIn;
    document.getElementById('waiting-room-title').innerText = `Room: ${currentRoomId}`;
    connectWebSocket();
  });

  document.getElementById('btn-start').addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'trivia:start', roomId: currentRoomId }));
    }
  });

  function updateLobby(leaderboard) {
    const ul = document.getElementById('lobby-players');
    ul.innerHTML = '';
    leaderboard.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<span>👤 ${p.username}</span> <span>Ready</span>`;
      ul.appendChild(li);
    });
  }

  // Gameplay Logic
  function startQuestion(msg) {
    hasAnswered = false;
    switchScreen('game');
    
    document.getElementById('question-counter').innerText = `Question ${msg.questionNumber}/${msg.totalQuestions}`;
    document.getElementById('question-text').innerText = msg.question.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    msg.question.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerText = opt;
      btn.dataset.index = index;
      btn.onclick = () => submitAnswer(index, btn);
      optionsContainer.appendChild(btn);
    });

    // Start Timer UI
    startTimer(msg.question.time);
  }

  function submitAnswer(index, btnElement) {
    if (hasAnswered || !ws) return;
    hasAnswered = true;
    
    btnElement.classList.add('selected');
    
    // Disable all options
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    const timeTaken = Date.now() - questionStartTime;

    ws.send(JSON.stringify({
      type: 'trivia:answer',
      roomId: currentRoomId,
      answerIndex: index,
      timeTaken: timeTaken
    }));
  }

  function startTimer(seconds) {
    questionStartTime = Date.now();
    const bar = document.getElementById('timer-bar');
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(1)';
    
    // Force reflow
    void bar.offsetWidth;

    bar.style.transition = `transform ${seconds}s linear`;
    bar.style.transform = 'scaleX(0)';
  }

  function showRoundEnd(msg) {
    switchScreen('intermission');
    
    const correctAnsText = document.querySelector(`.option-btn[data-index="${msg.correctAnswer}"]`)?.innerText || 'Unknown';
    document.getElementById('correct-answer-display').innerHTML = `Correct Answer:<br><strong>${correctAnsText}</strong>`;
    
    updateLeaderboard('intermission-leaderboard', msg.scores);

    // Update local score for UI
    const myData = msg.scores.find(s => s.username === username);
    if (myData) {
      document.getElementById('score-display').innerText = `Score: ${myData.score}`;
    }
  }

  function updateLeaderboard(elementId, scores) {
    const ul = document.getElementById(elementId);
    ul.innerHTML = '';
    scores.forEach((p, i) => {
      const li = document.createElement('li');
      let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
      li.innerHTML = `<span>${medal} ${p.username}</span> <strong>${p.score} pts</strong>`;
      ul.appendChild(li);
    });
  }

  document.getElementById('btn-play-again').addEventListener('click', () => {
    switchScreen('lobby');
    if (ws) ws.close();
  });
});
