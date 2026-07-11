// public/scripts/moderation.js

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────
  let myPeerId = null;
  let mySecret = null;
  let myUsername = null;
  let ws = null;
  let csrfToken = '';
  let currentFilter = 'pending';
  let votedItems = new Set(); // itemIds this session peer has voted on

  const WS_URL = `ws://${location.hostname}:8080`;
  const API = '/api/moderation';

  // ── DOM ─────────────────────────────────────────────────────────
  const registerBtn  = document.getElementById('register-btn');
  const submitBtn    = document.getElementById('submit-btn');
  const peerUnreg    = document.getElementById('peer-unregistered');
  const peerReg      = document.getElementById('peer-registered');
  const myPeerName   = document.getElementById('my-peer-name');
  const myPeerIdEl   = document.getElementById('my-peer-id');
  const wsStatusEl   = document.getElementById('ws-status');
  const peersListEl  = document.getElementById('peers-list');
  const queueListEl  = document.getElementById('queue-list');
  const activityFeed = document.getElementById('activity-feed');
  const filterBtns   = document.querySelectorAll('.filter-btn');

  // ── Helpers ─────────────────────────────────────────────────────
  function generatePeerId() {
    return 'peer-' + crypto.randomUUID().slice(0, 12);
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString();
  }

  function addFeedItem(text) {
    const li = document.createElement('li');
    li.className = 'feed-item';
    li.innerHTML = `<span>${text}</span><span class="feed-time">${new Date().toLocaleTimeString()}</span>`;
    if (activityFeed.querySelector('.hint-text')) activityFeed.innerHTML = '';
    activityFeed.prepend(li);
    // Keep feed at max 30 items
    while (activityFeed.children.length > 30) {
      activityFeed.removeChild(activityFeed.lastChild);
    }
  }

  // ── HMAC-SHA256 via SubtleCrypto ────────────────────────────────
  async function signPayload(payload, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── CSRF token fetch ────────────────────────────────────────────
  async function fetchCsrfToken() {
    try {
      const res = await fetch('/api/csrf-token');
      const data = await res.json();
      csrfToken = data.csrfToken || '';
    } catch { csrfToken = ''; }
  }

  // ── POST helper ─────────────────────────────────────────────────
  async function post(url, body) {
    if (!csrfToken) await fetchCsrfToken();
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify(body)
    });
  }

  // ── Register peer ────────────────────────────────────────────────
  registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('peer-username').value.trim();
    const secret   = document.getElementById('peer-secret').value.trim();

    if (!username) return alert('Please enter your name.');
    if (secret.length < 16) return alert('Secret must be at least 16 characters.');

    myPeerId   = generatePeerId();
    mySecret   = secret;
    myUsername = username;

    try {
      const res = await post(`${API}/register-peer`, { peerId: myPeerId, secret, username });
      if (!res.ok) {
        const err = await res.json();
        return alert('Registration failed: ' + err.error);
      }

      // Update UI
      peerUnreg.classList.add('hidden');
      peerReg.classList.remove('hidden');
      myPeerName.textContent = username;
      myPeerIdEl.textContent = myPeerId;
      submitBtn.disabled = false;

      addFeedItem(`✅ Registered as ${username}`);

      // Connect WebSocket
      connectWebSocket();
      // Load existing queue
      loadQueue();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  });

  // ── WebSocket ────────────────────────────────────────────────────
  function connectWebSocket() {
    setWsStatus('connecting');
    ws = new ResilientWebSocket(WS_URL);

    ws.onopen = () => {
      setWsStatus('connected');
      addFeedItem('🔌 Connected to moderation network');
      ws.send(JSON.stringify({ type: 'moderation:join', username: myUsername }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleWsMessage(msg);
      } catch (e) { console.error('WS parse error', e); }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      addFeedItem('🔴 Disconnected from network. Reconnecting in 3s...');
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => setWsStatus('disconnected');
  }

  function setWsStatus(status) {
    const dot = wsStatusEl.querySelector('.status-dot');
    dot.className = `status-dot ${status}`;
    wsStatusEl.childNodes[1].textContent = ' ' + status.charAt(0).toUpperCase() + status.slice(1);
  }

  function handleWsMessage(msg) {
    switch (msg.type) {
      case 'moderation:joined':
        // Update peer list with existing moderators
        msg.peers.forEach(p => addPeerToList(p.userId, p.username));
        addFeedItem(`👥 ${msg.peers.length} moderator(s) online`);
        break;

      case 'moderation:peer-joined':
        addPeerToList(msg.userId, msg.username);
        addFeedItem(`👤 ${msg.username} joined as moderator`);
        break;

      case 'moderation:new-item':
        addFeedItem(`📥 New submission: "${msg.data.title}" by ${msg.data.submittedBy}`);
        loadQueue(); // reload queue from API
        break;

      case 'moderation:vote-update':
        addFeedItem(`🗳️ Vote cast on "${msg.data.title}": ${msg.data.decision} (${msg.data.approvals}/${msg.data.threshold})`);
        loadQueue();
        break;

      default:
        break;
    }
  }

  function addPeerToList(userId, username) {
    // Avoid duplicates
    if (document.querySelector(`[data-peer-id="${userId}"]`)) return;
    const emptyHint = peersListEl.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();

    const li = document.createElement('li');
    li.className = 'peer-item';
    li.dataset.peerId = userId;
    li.textContent = username;
    peersListEl.appendChild(li);
  }

  // ── Submit content ───────────────────────────────────────────────
  submitBtn.addEventListener('click', async () => {
    const title   = document.getElementById('sub-title').value.trim();
    const content = document.getElementById('sub-content').value.trim();
    const type    = document.getElementById('sub-type').value;

    if (!title || !content) return alert('Title and content are required.');

    try {
      const res = await post(`${API}/submit`, {
        type, title, content, submittedBy: myUsername
      });
      const data = await res.json();
      if (!res.ok) return alert('Submit failed: ' + data.error);

      addFeedItem(`📤 Submitted "${title}" for review (ID: ${data.itemId.slice(0,8)}...)`);
      document.getElementById('sub-title').value = '';
      document.getElementById('sub-content').value = '';

      // Broadcast via WebSocket so other moderators see it instantly
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'moderation:request',
          data: { itemId: data.itemId, title, content, submittedBy: myUsername }
        }));
      }

      loadQueue();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  });

  // ── Load queue ───────────────────────────────────────────────────
  async function loadQueue() {
    try {
      const res = await fetch(`${API}/queue?status=${currentFilter}`);
      const items = await res.json();
      renderQueue(items);
    } catch (e) {
      console.error('Failed to load queue', e);
    }
  }

  function renderQueue(items) {
    if (!items.length) {
      queueListEl.innerHTML = `<div class="empty-state"><i class="ti ti-inbox"></i><p>No ${currentFilter} items.</p></div>`;
      return;
    }

    queueListEl.innerHTML = '';
    items.forEach(item => {
      const pct = item.threshold > 0 ? Math.round((item.approvals / item.threshold) * 100) : 0;
      const rPct = item.threshold > 0 ? Math.round((item.rejections / item.threshold) * 100) : 0;
      const hasVoted = votedItems.has(item.id);
      const isPending = item.status === 'pending';

      const card = document.createElement('div');
      card.className = `queue-item glass-card ${item.status}`;
      card.innerHTML = `
        <div class="qi-header">
          <span class="qi-title">${item.title}</span>
          <span class="qi-type-badge">${item.type}</span>
        </div>
        <p class="qi-content">${item.content}</p>
        <p class="qi-meta">By <strong>${item.submittedBy}</strong> · ${formatTime(item.submittedAt)} · Expires ${formatTime(item.expiresAt)}</p>
        <div class="qi-status-badge ${item.status}">${item.status.toUpperCase()} · ${item.voterCount} vote(s)</div>
        <div class="vote-progress">
          <div class="vote-bar-wrap">
            <span class="vote-bar-label">Approvals</span>
            <div class="vote-bar-bg"><div class="vote-bar-fill approve" style="width:${Math.min(pct,100)}%"></div></div>
            <span class="vote-count">${item.approvals}/${item.threshold}</span>
          </div>
          <div class="vote-bar-wrap">
            <span class="vote-bar-label">Rejections</span>
            <div class="vote-bar-bg"><div class="vote-bar-fill reject" style="width:${Math.min(rPct,100)}%"></div></div>
            <span class="vote-count">${item.rejections}/${item.threshold}</span>
          </div>
        </div>
        ${isPending && !hasVoted ? `
        <div class="qi-actions">
          <button class="vote-approve-btn" data-id="${item.id}" data-title="${item.title}">
            <i class="ti ti-thumb-up"></i> Approve
          </button>
          <button class="vote-reject-btn" data-id="${item.id}" data-title="${item.title}">
            <i class="ti ti-thumb-down"></i> Reject
          </button>
        </div>` : isPending && hasVoted ? `<p class="hint-text" style="margin:0">✅ You have already voted on this item.</p>` : ''}
      `;

      queueListEl.appendChild(card);
    });

    // Attach vote listeners
    queueListEl.querySelectorAll('.vote-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => castVote(btn.dataset.id, btn.dataset.title, 'approve'));
    });
    queueListEl.querySelectorAll('.vote-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => castVote(btn.dataset.id, btn.dataset.title, 'reject'));
    });
  }

  // ── Cast vote ────────────────────────────────────────────────────
  async function castVote(itemId, title, decision) {
    if (!myPeerId || !mySecret) return alert('You must register first.');

    try {
      // Generate HMAC signature
      const payload = `${itemId}:${myPeerId}:${decision}`;
      const signature = await signPayload(payload, mySecret);

      const res = await post(`${API}/vote`, {
        itemId, peerId: myPeerId, decision, signature, secret: mySecret
      });
      const data = await res.json();

      if (!res.ok) {
        addFeedItem(`❌ Vote rejected: ${data.error}`);
        return alert(data.error);
      }

      votedItems.add(itemId);
      addFeedItem(`🗳️ Voted "${decision}" on "${title}" (${data.approvals}/${data.threshold} approvals)`);

      // Broadcast the vote to other peers for real-time UI update
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'moderation:vote-broadcast',
          data: { itemId, title, decision, approvals: data.approvals, rejections: data.rejections, threshold: data.threshold }
        }));
      }

      loadQueue();
    } catch (e) {
      alert('Error casting vote: ' + e.message);
    }
  }

  // ── Filter buttons ────────────────────────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.status;
      loadQueue();
    });
  });

  // ── Init ─────────────────────────────────────────────────────────
  fetchCsrfToken();

})();