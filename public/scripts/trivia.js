/**
 * trivia.js — Parampara Cultural Trivia
 *
 * Architecture:
 *   • SoloEngine   — self-contained single-player quiz (no WebSocket)
 *   • MultiEngine  — existing multiplayer WebSocket logic (preserved)
 *   • Shared UI    — screen router, option renderer, ring timer
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════════════
     TRIVIA DATA  (inline — same questions as config/triviaData.js)
     Kept here so Solo mode works purely client-side with no
     additional HTTP request. Extend this array to add questions.
  ═══════════════════════════════════════════════════════════ */
  const QUESTIONS = [
    {
      id: 'q1',
      question: 'Which ancient Indian text is considered the oldest surviving text in any Indo-European language?',
      options: ['Mahabharata', 'Rigveda', 'Ramayana', 'Upanishads'],
      correct: 1,
      explanation: 'The Rigveda, composed around 1500–1200 BCE, is the oldest known Vedic text and Indo-European literary work.'
    },
    {
      id: 'q2',
      question: 'The famous "Dancing Girl" bronze statue was discovered in which ancient Indus Valley site?',
      options: ['Harappa', 'Lothal', 'Mohenjo-Daro', 'Dholavira'],
      correct: 2,
      explanation: 'The bronze Dancing Girl (~2500 BCE) was unearthed at Mohenjo-Daro in 1926.'
    },
    {
      id: 'q3',
      question: 'Which Indian classical dance form originated in the temples of Tamil Nadu?',
      options: ['Kathak', 'Bharatanatyam', 'Odissi', 'Manipuri'],
      correct: 1,
      explanation: 'Bharatanatyam originated as Sadir in Tamil Nadu temples and was revived in the 20th century by Rukmini Devi Arundale.'
    },
    {
      id: 'q4',
      question: 'The Ajanta Caves, known for their exquisite Buddhist mural paintings, are located in which state?',
      options: ['Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Gujarat'],
      correct: 1,
      explanation: 'The Ajanta Caves are located near Aurangabad, Maharashtra, and are a UNESCO World Heritage Site.'
    },
    {
      id: 'q5',
      question: 'Which traditional Indian art form involves creating intricate patterns on the floor using colored powders or rice?',
      options: ['Warli', 'Madhubani', 'Rangoli/Kolam', 'Pattachitra'],
      correct: 2,
      explanation: 'Rangoli (North India) and Kolam (South India) are floor-art traditions using colored powders, rice, or flower petals.'
    },
    {
      id: 'q6',
      question: 'The architectural style of the Khajuraho temples is best described as:',
      options: ['Dravidian', 'Nagara', 'Vesara', 'Indo-Islamic'],
      correct: 1,
      explanation: 'The Khajuraho temples follow the Nagara (North Indian) style, characterized by towering shikhara spires.'
    },
    {
      id: 'q7',
      question: 'Which UNESCO World Heritage Site in India features the massive "Chariot Temple"?',
      options: ['Hampi', 'Konark Sun Temple', 'Mahabalipuram', 'Brihadisvara Temple'],
      correct: 0,
      explanation: 'The iconic stone chariot (Garuda Ratha) is at Hampi, the ruined capital of the Vijayanagara Empire in Karnataka.'
    },
    {
      id: 'q8',
      question: 'What is the traditional tie-and-dye craft from Rajasthan and Gujarat called?',
      options: ['Ikat', 'Kalamkari', 'Bandhani', 'Chikankari'],
      correct: 2,
      explanation: 'Bandhani (from Sanskrit "bandha" = to tie) is a tie-dye textile art dating back over 5,000 years in Rajasthan and Gujarat.'
    },
    {
      id: 'q9',
      question: 'Which Indian festival is specifically dedicated to celebrating the bond between brothers and sisters?',
      options: ['Holi', 'Raksha Bandhan', 'Diwali', 'Navratri'],
      correct: 1,
      explanation: 'Raksha Bandhan (Sanskrit: "bond of protection") is celebrated on the full moon of Shravana, with sisters tying a rakhi on their brothers.'
    },
    {
      id: 'q10',
      question: 'The famous "Sanchi Stupa" was originally commissioned by which Indian emperor?',
      options: ['Chandragupta Maurya', 'Ashoka', 'Harsha', 'Kanishka'],
      correct: 1,
      explanation: 'Ashoka commissioned the Sanchi Stupa in the 3rd century BCE to enshrine Buddhist relics. It is India\'s oldest stone structure.'
    }
  ];

  /* ═══════════════════════════════════════════════════════════
     SHARED SCREEN ROUTER
  ═══════════════════════════════════════════════════════════ */
  const SCREEN_IDS = ['screen-mode', 'screen-lobby', 'screen-waiting',
                      'screen-game', 'screen-intermission', 'screen-ended',
                      'screen-results'];

  const screens = {};
  SCREEN_IDS.forEach(id => { screens[id] = document.getElementById(id); });

  function showScreen(id) {
    SCREEN_IDS.forEach(sid => {
      if (screens[sid]) screens[sid].classList.remove('active');
    });
    if (screens[id]) screens[id].classList.add('active');
  }

  /* ═══════════════════════════════════════════════════════════
     CIRCULAR RING TIMER UTILITY
  ═══════════════════════════════════════════════════════════ */
  const CIRCUMFERENCE = 2 * Math.PI * 22; // 138.23
  const ringCircle  = document.getElementById('timer-ring-circle');
  const timerText   = document.getElementById('timer-text');
  let ringInterval  = null;

  function startRingTimer(seconds, onExpire) {
    clearInterval(ringInterval);
    // Reset classes
    ringCircle.classList.remove('warning', 'danger');
    ringCircle.style.strokeDashoffset = '0';
    timerText.textContent = seconds;

    let remaining = seconds;
    const step = CIRCUMFERENCE / seconds;

    ringInterval = setInterval(() => {
      remaining--;
      timerText.textContent = remaining;
      ringCircle.style.strokeDashoffset = String((seconds - remaining) * step);

      // Color changes
      const pct = remaining / seconds;
      if (pct <= 0.25) {
        ringCircle.classList.add('danger');
        ringCircle.classList.remove('warning');
      } else if (pct <= 0.5) {
        ringCircle.classList.add('warning');
      }

      if (remaining <= 0) {
        clearInterval(ringInterval);
        onExpire();
      }
    }, 1000);
  }

  function stopRingTimer() {
    clearInterval(ringInterval);
  }

  /* ═══════════════════════════════════════════════════════════
     SOLO ENGINE
  ═══════════════════════════════════════════════════════════ */
  const Solo = (() => {
    // Config
    const DIFF_SECONDS = { easy: 20, medium: 15, hard: 10 };
    const LS_KEY = 'parampara_trivia_highscore';

    // State
    let questions    = [];
    let qIndex       = 0;
    let score        = 0;
    let answered     = false;
    let qStartTime   = 0;
    let streak       = 0;
    let bestStreak   = 0;
    let timings      = []; // ms per answered question
    let history      = []; // { q, chosen, correct, skipped }
    let diffSeconds  = 15;
    let playerName   = 'Player';

    // DOM refs
    const elCounter   = document.getElementById('question-counter');
    const elScore     = document.getElementById('score-display');
    const elQuestion  = document.getElementById('question-text');
    const elOptions   = document.getElementById('options-container');
    const elFeedback  = document.getElementById('answer-feedback');
    const elProgress  = document.getElementById('progress-fill');
    const elStreak    = document.getElementById('streak-bar');

    // Results DOM refs
    const elTrophy    = document.getElementById('results-trophy');
    const elHeadline  = document.getElementById('results-headline');
    const elTagline   = document.getElementById('results-tagline');
    const elResScore  = document.getElementById('results-score');
    const elDonut     = document.getElementById('donut-progress');
    const elStatC     = document.getElementById('stat-correct');
    const elStatW     = document.getElementById('stat-wrong');
    const elStatS     = document.getElementById('stat-skipped');
    const elStatStr   = document.getElementById('stat-streak');
    const elStatTime  = document.getElementById('stat-time');
    const elStatAcc   = document.getElementById('stat-accuracy');
    const elReviewBtn = document.getElementById('btn-review-toggle');
    const elReviewList= document.getElementById('review-list');
    const elHSBanner  = document.getElementById('highscore-banner');

    // ── Public: start ──
    function start(config) {
      diffSeconds = DIFF_SECONDS[config.difficulty] || 15;
      playerName  = config.name || 'Player';
      const count = parseInt(config.count, 10) || 10;

      // Shuffle & slice
      questions = shuffle([...QUESTIONS]).slice(0, count);

      // Reset state
      qIndex = score = streak = bestStreak = 0;
      answered = false;
      timings = [];
      history = [];

      showScreen('screen-game');
      renderQuestion();
    }

    // ── Render question ──
    function renderQuestion() {
      if (qIndex >= questions.length) { endGame(); return; }

      answered = false;
      qStartTime = Date.now();
      const q = questions[qIndex];
      const total = questions.length;

      // Counter & score
      elCounter.textContent = `Question ${qIndex + 1} / ${total}`;
      elScore.textContent   = `Score: ${score}`;

      // Progress bar
      const pct = (qIndex / total) * 100;
      elProgress.style.width = `${pct}%`;
      elProgress.parentElement.setAttribute('aria-valuenow', Math.round(pct));

      // Streak indicator
      if (streak >= 2) {
        elStreak.textContent = `🔥 ${streak} in a row!`;
        elStreak.classList.remove('hidden');
      } else {
        elStreak.classList.add('hidden');
      }

      // Question text — animate in
      elQuestion.style.opacity = '0';
      elQuestion.style.transform = 'translateY(8px)';
      elQuestion.textContent = q.question;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          elQuestion.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          elQuestion.style.opacity = '1';
          elQuestion.style.transform = 'translateY(0)';
        });
      });

      // Feedback hidden
      elFeedback.className = 'answer-feedback hidden';
      elFeedback.textContent = '';

      // Options
      elOptions.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.dataset.index = i;
        btn.addEventListener('click', () => choose(i, btn));
        elOptions.appendChild(btn);
      });

      // Ring timer
      startRingTimer(diffSeconds, () => onTimeout());
    }

    // ── User chose an option ──
    function choose(index, btnEl) {
      if (answered) return;
      answered = true;
      stopRingTimer();

      const elapsed = Date.now() - qStartTime;
      timings.push(elapsed);

      const q = questions[qIndex];
      const isCorrect = (index === q.correct);

      // Disable all buttons
      elOptions.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; });

      // Highlight correct & chosen
      elOptions.querySelectorAll('.option-btn').forEach(b => {
        if (parseInt(b.dataset.index) === q.correct) b.classList.add('correct');
      });
      if (!isCorrect) btnEl.classList.add('wrong');

      // Score: base points + speed bonus
      let pointsEarned = 0;
      if (isCorrect) {
        const timeBonus = Math.max(0, Math.floor((diffSeconds * 1000 - elapsed) / 200));
        pointsEarned = 100 + timeBonus;
        score += pointsEarned;
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 0;
      }

      elScore.textContent = `Score: ${score}`;

      // Feedback
      showFeedback(isCorrect, q, pointsEarned, false);

      // Record history
      history.push({ q, chosen: index, correct: q.correct, skipped: false, isCorrect });

      // Next question after delay
      setTimeout(() => nextQuestion(), 1800);
    }

    // ── Timer expired ──
    function onTimeout() {
      if (answered) return;
      answered = true;

      const q = questions[qIndex];

      elOptions.querySelectorAll('.option-btn').forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.index) === q.correct) b.classList.add('correct');
      });

      streak = 0;
      showFeedback(false, q, 0, true);
      history.push({ q, chosen: -1, correct: q.correct, skipped: true, isCorrect: false });

      setTimeout(() => nextQuestion(), 1800);
    }

    // ── Show inline feedback ──
    function showFeedback(isCorrect, q, pts, timedOut) {
      elFeedback.className = 'answer-feedback'; // remove hidden + old class
      if (timedOut) {
        elFeedback.classList.add('timeout-fb');
        elFeedback.innerHTML = `⏰ Time's up! The answer was: <strong>${q.options[q.correct]}</strong>`;
      } else if (isCorrect) {
        elFeedback.classList.add('correct-fb');
        elFeedback.innerHTML = `✅ Correct! +${pts} pts &nbsp;—&nbsp; <em>${q.explanation}</em>`;
      } else {
        elFeedback.classList.add('wrong-fb');
        elFeedback.innerHTML = `❌ Wrong. Correct answer: <strong>${q.options[q.correct]}</strong> &nbsp;—&nbsp; <em>${q.explanation}</em>`;
      }
    }

    // ── Advance ──
    function nextQuestion() {
      qIndex++;
      renderQuestion();
    }

    // ── End game → results ──
    function endGame() {
      stopRingTimer();

      // Progress to 100%
      elProgress.style.width = '100%';

      // Statistics
      const total   = questions.length;
      const correct = history.filter(h => h.isCorrect).length;
      const wrong   = history.filter(h => !h.isCorrect && !h.skipped).length;
      const skipped = history.filter(h => h.skipped).length;
      const accuracy= total > 0 ? Math.round((correct / total) * 100) : 0;
      const avgTime = timings.length
        ? (timings.reduce((a, b) => a + b, 0) / timings.length / 1000).toFixed(1)
        : '—';

      // Grade
      const grade = getGrade(accuracy);
      elTrophy.textContent   = grade.trophy;
      elHeadline.textContent = grade.headline;
      elTagline.textContent  = grade.tagline;

      // Score donut animation
      const DONUT_C = 314.16; // 2π × 50
      elResScore.textContent = score;
      const maxScore = total * (100 + Math.floor((diffSeconds * 1000) / 200)); // rough max
      const filled   = DONUT_C - (DONUT_C * Math.min(accuracy / 100, 1));
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          elDonut.style.strokeDashoffset = String(filled);
        });
      });

      // Stats
      elStatC.textContent   = correct;
      elStatW.textContent   = wrong;
      elStatS.textContent   = skipped;
      elStatStr.textContent = bestStreak;
      elStatTime.textContent= `${avgTime}s`;
      elStatAcc.textContent = `${accuracy}%`;

      // High score
      const prevHigh = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
      if (score > prevHigh) {
        localStorage.setItem(LS_KEY, String(score));
        elHSBanner.classList.remove('hidden');
      } else {
        elHSBanner.classList.add('hidden');
      }

      // Review list
      buildReviewList();

      showScreen('screen-results');
    }

    // ── Grade system ──
    function getGrade(pct) {
      if (pct === 100) return { trophy: '🏆', headline: 'Perfect Score!',       tagline: 'A true cultural heritage expert!' };
      if (pct >= 80)   return { trophy: '🥇', headline: 'Outstanding!',          tagline: 'Your knowledge of Indian heritage is impressive.' };
      if (pct >= 60)   return { trophy: '🥈', headline: 'Well Done!',            tagline: 'A solid performance — keep exploring!' };
      if (pct >= 40)   return { trophy: '🥉', headline: 'Good Effort!',          tagline: 'Every quiz makes you wiser. Try again!' };
      return               { trophy: '📚', headline: 'Keep Learning!',          tagline: 'India has so much heritage to discover. Give it another go!' };
    }

    // ── Build review accordion ──
    function buildReviewList() {
      elReviewList.innerHTML = '';
      history.forEach((h, i) => {
        const li = document.createElement('li');
        li.className = 'review-item ' + (
          h.skipped ? 'ri-skipped' : h.isCorrect ? 'ri-correct' : 'ri-wrong'
        );

        const chosenLabel = h.skipped
          ? '— (timed out)'
          : h.q.options[h.chosen];

        li.innerHTML = `
          <div class="review-q">${i + 1}. ${h.q.question}</div>
          <div class="review-your">Your answer: <strong>${chosenLabel}</strong></div>
          <div class="review-ans">✓ Correct: <strong>${h.q.options[h.correct]}</strong></div>
        `;
        elReviewList.appendChild(li);
      });
    }

    // ── Replay ──
    function replay() {
      // Re-use same config from previous run
      const config = {
        difficulty: Object.keys(DIFF_SECONDS).find(k => DIFF_SECONDS[k] === diffSeconds) || 'medium',
        count: String(questions.length),
        name: playerName
      };
      start(config);
    }

    // ── Review toggle ──
    if (elReviewBtn) {
      elReviewBtn.addEventListener('click', () => {
        const expanded = elReviewBtn.getAttribute('aria-expanded') === 'true';
        elReviewBtn.setAttribute('aria-expanded', String(!expanded));
        elReviewList.classList.toggle('hidden', expanded);
      });
    }

    // ── Utility: shuffle ──
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    return { start, replay };
  })();

  /* ═══════════════════════════════════════════════════════════
     MODE SELECTION UI
  ═══════════════════════════════════════════════════════════ */
  const btnSolo       = document.getElementById('btn-solo');
  const btnMulti      = document.getElementById('btn-multiplayer');
  const soloConfig    = document.getElementById('solo-config');
  const btnStartSolo  = document.getElementById('btn-start-solo');
  const btnRetrySolo  = document.getElementById('btn-retry-solo');
  const btnChangeConf = document.getElementById('btn-change-config');
  const btnShare      = document.getElementById('btn-share-result');
  const btnBackMode   = document.getElementById('btn-back-to-mode');

  // Solo button → show config panel
  if (btnSolo) {
    btnSolo.addEventListener('click', () => {
      btnSolo.classList.add('selected');
      if (btnMulti) btnMulti.classList.remove('selected');
      soloConfig.classList.remove('hidden');
      soloConfig.removeAttribute('aria-hidden');
      soloConfig.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // Multiplayer button → go to lobby
  if (btnMulti) {
    btnMulti.addEventListener('click', () => {
      showScreen('screen-lobby');
    });
  }

  // Back button in lobby
  if (btnBackMode) {
    btnBackMode.addEventListener('click', () => showScreen('screen-mode'));
  }

  // Start solo quiz
  if (btnStartSolo) {
    btnStartSolo.addEventListener('click', () => {
      const difficulty = document.getElementById('solo-difficulty')?.value || 'medium';
      const count      = document.getElementById('solo-count')?.value      || '10';
      const name       = document.getElementById('solo-username')?.value.trim() || 'Player';
      Solo.start({ difficulty, count, name });
    });
  }

  // Play again (same config)
  if (btnRetrySolo) {
    btnRetrySolo.addEventListener('click', () => Solo.replay());
  }

  // Change settings → back to mode screen
  if (btnChangeConf) {
    btnChangeConf.addEventListener('click', () => {
      showScreen('screen-mode');
      // Scroll config into view if Solo was selected
      if (soloConfig && !soloConfig.classList.contains('hidden')) {
        soloConfig.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Share score
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const scoreEl = document.getElementById('results-score');
      const total   = document.getElementById('solo-count')?.value || '10';
      const text    = `🏛️ I scored ${scoreEl?.textContent || '?'} pts on the Parampara Cultural Heritage Trivia! Can you beat me? 🎯`;

      if (navigator.share) {
        try {
          await navigator.share({ title: 'Parampara Trivia', text });
        } catch (_) { /* user cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(text);
          btnShare.textContent = '✅ Copied!';
          setTimeout(() => { btnShare.textContent = '📤 Share Score'; }, 2000);
        } catch (_) {
          alert(text);
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     MULTIPLAYER ENGINE  (original logic, untouched)
  ═══════════════════════════════════════════════════════════ */
  let ws = null;
  let currentRoomId = null;
  let username = null;
  let hasAnswered = false;
  let questionStartTime = 0;

  // Multiplayer screen helpers (reuse same #screen-game DOM)
  function switchScreenMulti(name) {
    const map = {
      waiting:      'screen-waiting',
      game:         'screen-game',
      intermission: 'screen-intermission',
      ended:        'screen-ended'
    };
    showScreen(map[name] || name);
  }

  function connectWebSocket() {
    const wsUrl = window.location.protocol === 'https:'
      ? `wss://${window.location.hostname}:8080`
      : `ws://${window.location.hostname}:8080`;

    ws = new ResilientWebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'trivia:join', roomId: currentRoomId, username }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleServerMessage(msg);
    };

    ws.onclose = () => {
      alert('Connection lost. Please refresh.');
    };
  }

  function handleServerMessage(msg) {
    switch (msg.type) {
      case 'trivia:state':
        updateLobbyPlayers(msg.leaderboard);
        if (msg.state === 'waiting') switchScreenMulti('waiting');
        if (msg.state === 'ended') {
          updateLeaderboard('final-leaderboard', msg.leaderboard);
          switchScreenMulti('ended');
        }
        break;
      case 'trivia:question':
        startMultiQuestion(msg);
        break;
      case 'trivia:round_end':
        showRoundEnd(msg);
        break;
    }
  }

  const btnJoin  = document.getElementById('btn-join');
  const btnStart = document.getElementById('btn-start');

  if (btnJoin) {
    btnJoin.addEventListener('click', () => {
      const userIn = document.getElementById('username')?.value.trim();
      const roomIn = document.getElementById('room-id')?.value.trim().toUpperCase();
      if (!userIn || !roomIn) return alert('Please enter both name and room code');
      username = userIn;
      currentRoomId = roomIn;
      const waitTitle = document.getElementById('waiting-room-title');
      if (waitTitle) waitTitle.innerText = `Room: ${currentRoomId}`;
      connectWebSocket();
    });
  }

  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'trivia:start', roomId: currentRoomId }));
      }
    });
  }

  function updateLobbyPlayers(leaderboard) {
    const ul = document.getElementById('lobby-players');
    if (!ul) return;
    ul.innerHTML = '';
    leaderboard.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<span>👤 ${p.username}</span> <span>Ready</span>`;
      ul.appendChild(li);
    });
  }

  function startMultiQuestion(msg) {
    hasAnswered = false;
    switchScreenMulti('game');

    const elC = document.getElementById('question-counter');
    const elQ = document.getElementById('question-text');
    const elO = document.getElementById('options-container');

    if (elC) elC.innerText = `Question ${msg.questionNumber}/${msg.totalQuestions}`;
    if (elQ) elQ.innerText = msg.question.question;
    if (elO) {
      elO.innerHTML = '';
      msg.question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.dataset.index = index;
        btn.onclick = () => submitMultiAnswer(index, btn);
        elO.appendChild(btn);
      });
    }

    // Use ring timer for multiplayer too
    startRingTimer(msg.question.time || 15, () => {});
    questionStartTime = Date.now();
  }

  function submitMultiAnswer(index, btnElement) {
    if (hasAnswered || !ws) return;
    hasAnswered = true;
    btnElement.classList.add('selected');
    document.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; });
    const timeTaken = Date.now() - questionStartTime;
    ws.send(JSON.stringify({
      type: 'trivia:answer',
      roomId: currentRoomId,
      answerIndex: index,
      timeTaken
    }));
  }

  function showRoundEnd(msg) {
    switchScreenMulti('intermission');
    const correctAnsText = document.querySelector(`.option-btn[data-index="${msg.correctAnswer}"]`)?.innerText || 'Unknown';
    const cadEl = document.getElementById('correct-answer-display');
    if (cadEl) cadEl.innerHTML = `Correct Answer:<br><strong>${correctAnsText}</strong>`;
    updateLeaderboard('intermission-leaderboard', msg.scores);
    const myData = msg.scores.find(s => s.username === username);
    if (myData) {
      const sd = document.getElementById('score-display');
      if (sd) sd.innerText = `Score: ${myData.score}`;
    }
  }

  function updateLeaderboard(elementId, scores) {
    const ul = document.getElementById(elementId);
    if (!ul) return;
    ul.innerHTML = '';
    scores.forEach((p, i) => {
      const li = document.createElement('li');
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
      li.innerHTML = `<span>${medal} ${p.username}</span> <strong>${p.score} pts</strong>`;
      ul.appendChild(li);
    });
  }

  const btnPlayAgain = document.getElementById('btn-play-again');
  if (btnPlayAgain) {
    btnPlayAgain.addEventListener('click', () => {
      showScreen('screen-lobby');
      if (ws) ws.close();
    });
  }

}); // DOMContentLoaded
