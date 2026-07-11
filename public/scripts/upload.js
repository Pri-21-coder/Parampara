// public/scripts/upload.js
(function () {
  'use strict';

  // ── Config ───────────────────────────────────────────────────
  const API = '/api/upload';
  const LS_KEY = 'parampara_upload_session';
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  // ── State ────────────────────────────────────────────────────
  let chunkSizeBytes = 2 * 1024 * 1024; // fallback 2MB, overridden by server config
  let selectedFile = null;
  let sessionId = null;
  let totalChunks = 0;
  let receivedChunks = new Set();
  let isPaused = false;
  let isCancelled = false;
  let isUploading = false;
  let csrfToken = '';

  // ── DOM ──────────────────────────────────────────────────────
  const dropZone      = document.getElementById('drop-zone');
  const fileInput     = document.getElementById('file-input');
  const fileInfoCard  = document.getElementById('file-info-card');
  const fiName        = document.getElementById('fi-name');
  const fiSize        = document.getElementById('fi-size');
  const fiType        = document.getElementById('fi-type');
  const clearBtn      = document.getElementById('clear-btn');
  const startBtn      = document.getElementById('start-btn');
  const pauseBtn      = document.getElementById('pause-btn');
  const resumeBtn     = document.getElementById('resume-btn');
  const cancelBtn     = document.getElementById('cancel-btn');
  const progressSec   = document.getElementById('progress-section');
  const progressBar   = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const progressPct   = document.getElementById('progress-pct');
  const chunkInfo     = document.getElementById('chunk-info');
  const chunkGrid     = document.getElementById('chunk-grid');
  const resumeBanner  = document.getElementById('resume-banner');
  const resumeChunk   = document.getElementById('resume-chunk');
  const resumeInfo    = document.getElementById('resume-info');
  const resumeSessionBtn  = document.getElementById('resume-session-btn');
  const discardSessionBtn = document.getElementById('discard-session-btn');
  const historyList   = document.getElementById('history-list');
  const netDot        = document.getElementById('net-dot');
  const netStatusText = document.getElementById('net-status-text');

  // ── Helpers ──────────────────────────────────────────────────
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function fetchCsrf() {
    try {
      const r = await fetch('/api/csrf-token');
      const d = await r.json();
      csrfToken = d.csrfToken || '';
    } catch { csrfToken = ''; }
  }

  async function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify(body)
    });
  }

  // ── Network Monitor ──────────────────────────────────────────
  function updateNetworkStatus() {
    if (navigator.onLine) {
      netDot.className = 'net-dot online';
      netStatusText.textContent = 'Online';
    } else {
      netDot.className = 'net-dot offline';
      netStatusText.textContent = 'Offline — upload paused';
      if (isUploading && !isPaused) pauseUpload();
    }
  }
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // ── Fetch Server Config ──────────────────────────────────────
  async function loadConfig() {
    try {
      const r = await fetch(`${API}/config`);
      const d = await r.json();
      chunkSizeBytes = d.chunkSizeBytes || chunkSizeBytes;
    } catch { /* use fallback */ }
  }

  // ── File Selection ───────────────────────────────────────────
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) selectFile(fileInput.files[0]);
  });

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  });

  function selectFile(file) {
    selectedFile = file;
    totalChunks = Math.ceil(file.size / chunkSizeBytes);

    fiName.textContent = file.name;
    fiSize.textContent = formatSize(file.size);
    fiType.textContent = file.type || 'unknown';
    fileInfoCard.classList.remove('hidden');
    startBtn.disabled = false;

    // Build chunk grid
    buildChunkGrid(totalChunks);
    progressSec.classList.remove('hidden');
    updateProgress(0);
  }

  clearBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfoCard.classList.add('hidden');
    progressSec.classList.add('hidden');
    startBtn.disabled = true;
    receivedChunks.clear();
  });

  // ── Chunk Grid ───────────────────────────────────────────────
  function buildChunkGrid(count) {
    chunkGrid.innerHTML = '';
    const max = Math.min(count, 200); // render max 200 cells
    for (let i = 0; i < max; i++) {
      const cell = document.createElement('div');
      cell.className = 'chunk-cell';
      cell.id = `chunk-cell-${i}`;
      cell.title = `Chunk ${i}`;
      chunkGrid.appendChild(cell);
    }
  }

  function markChunkCell(index, state) {
    const cell = document.getElementById(`chunk-cell-${index}`);
    if (cell) cell.className = `chunk-cell ${state}`;
  }

  // ── Progress ─────────────────────────────────────────────────
  function updateProgress(done) {
    const pct = totalChunks > 0 ? Math.round((done / totalChunks) * 100) : 0;
    progressBar.style.width = pct + '%';
    progressPct.textContent = pct + '%';
    chunkInfo.textContent = `Chunk ${done} of ${totalChunks}`;
  }

  // ── Upload Flow ──────────────────────────────────────────────
  startBtn.addEventListener('click', startUpload);
  pauseBtn.addEventListener('click', pauseUpload);
  resumeBtn.addEventListener('click', () => { isPaused = false; resumeBtn.classList.add('hidden'); pauseBtn.classList.remove('hidden'); continueUpload(); });
  cancelBtn.addEventListener('click', cancelUpload);

  async function startUpload() {
    if (!selectedFile) return;
    isCancelled = false;
    isPaused = false;
    isUploading = true;
    receivedChunks.clear();

    // Init session
    progressLabel.textContent = 'Initialising...';
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');

    try {
      const res = await postJson(`${API}/init`, {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type || 'video/mp4',
        totalChunks
      });
      const data = await res.json();
      if (!res.ok) { showError(data.error); return resetUI(); }

      sessionId = data.sessionId;
      localStorage.setItem(LS_KEY, JSON.stringify({
        sessionId, fileName: selectedFile.name, fileSize: selectedFile.size,
        mimeType: selectedFile.type, totalChunks
      }));

      await continueUpload();
    } catch (e) {
      showError('Network error: ' + e.message);
      resetUI();
    }
  }

  async function continueUpload() {
    isUploading = true;
    progressLabel.textContent = 'Uploading...';

    for (let i = 0; i < totalChunks; i++) {
      if (isCancelled) return;
      if (isPaused) { progressLabel.textContent = 'Paused'; return; }
      if (receivedChunks.has(i)) { markChunkCell(i, 'done'); continue; }

      markChunkCell(i, 'active');
      const success = await uploadChunkWithRetry(i);

      if (!success) {
        markChunkCell(i, 'failed');
        showError(`Failed to upload chunk ${i} after ${MAX_RETRIES} retries. Upload paused.`);
        isPaused = true;
        pauseBtn.classList.add('hidden');
        resumeBtn.classList.remove('hidden');
        progressLabel.textContent = 'Paused — chunk failed';
        return;
      }

      receivedChunks.add(i);
      markChunkCell(i, 'done');
      updateProgress(receivedChunks.size);
    }

    // All chunks done — complete upload
    await finaliseUpload();
  }

  async function uploadChunkWithRetry(index) {
    const start = index * chunkSizeBytes;
    const end = Math.min(start + chunkSizeBytes, selectedFile.size);
    const slice = selectedFile.slice(start, end);
    const buffer = await slice.arrayBuffer();

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (isCancelled) return false;
      try {
        const res = await fetch(`${API}/chunk/${sessionId}/${index}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
          body: buffer
        });
        if (res.ok || res.status === 409) return true; // 409 = already received, treat as success
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS * (attempt + 1));
      } catch {
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
    return false;
  }

  async function finaliseUpload() {
    progressLabel.textContent = 'Assembling...';
    try {
      const res = await postJson(`${API}/complete/${sessionId}`, {});
      const data = await res.json();

      if (res.ok) {
        progressLabel.textContent = '✅ Upload Complete!';
        progressPct.textContent = '100%';
        progressBar.style.width = '100%';
        localStorage.removeItem(LS_KEY);
        addHistoryItem(data.fileName, data.assembledSize, 'complete');
        pauseBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        startBtn.textContent = '⬆ Upload Another';
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
        startBtn.onclick = () => { clearBtn.click(); startBtn.onclick = startUpload; startBtn.textContent = 'Start Upload'; };
        isUploading = false;
      } else {
        showError(data.error);
        resetUI();
      }
    } catch (e) {
      showError('Assembly failed: ' + e.message);
      resetUI();
    }
  }

  function pauseUpload() {
    isPaused = true;
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    progressLabel.textContent = 'Paused';
  }

  function cancelUpload() {
    isCancelled = true;
    isUploading = false;
    localStorage.removeItem(LS_KEY);
    progressLabel.textContent = 'Cancelled';
    addHistoryItem(selectedFile?.name || 'Unknown', 0, 'failed');
    resetUI();
  }

  function resetUI() {
    isUploading = false;
    startBtn.classList.remove('hidden');
    startBtn.disabled = !selectedFile;
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
  }

  function showError(msg) {
    progressLabel.textContent = '⚠ ' + msg;
    progressLabel.style.color = '#dc3545';
    setTimeout(() => { progressLabel.style.color = ''; }, 5000);
  }

  // ── History ──────────────────────────────────────────────────
  function addHistoryItem(name, size, status) {
    const emptyHint = historyList.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();

    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <span class="hi-name">${name}<span class="hi-badge ${status}">${status}</span></span>
      <span class="hi-meta">${size ? formatSize(size) : ''} · ${new Date().toLocaleTimeString()}</span>
    `;
    historyList.prepend(li);
  }

  // ── Auto-resume on page reload ────────────────────────────────
  async function checkForResumableSession() {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;

    let parsed;
    try { parsed = JSON.parse(saved); } catch { localStorage.removeItem(LS_KEY); return; }

    // Query server for session status
    try {
      const r = await fetch(`${API}/status/${parsed.sessionId}`);
      if (!r.ok) { localStorage.removeItem(LS_KEY); return; }
      const status = await r.json();

      if (status.status !== 'active') { localStorage.removeItem(LS_KEY); return; }

      // Show resume banner
      sessionId = parsed.sessionId;
      totalChunks = status.totalChunks;
      status.receivedIndexes.forEach(i => receivedChunks.add(i));

      resumeChunk.textContent = status.receivedCount;
      resumeInfo.innerHTML = `"${status.fileName}" — ${status.receivedCount}/${status.totalChunks} chunks done`;
      resumeBanner.classList.remove('hidden');

      resumeSessionBtn.onclick = async () => {
        resumeBanner.classList.add('hidden');
        // User needs to re-select the file (browser can't re-open FileReader from localStorage)
        alert(`Please re-select the file "${status.fileName}" to resume the upload.`);
        fileInput.click();
        fileInput.onchange = () => {
          const f = fileInput.files[0];
          if (f && f.name === status.fileName) {
            selectedFile = f;
            selectFile(f);
            // Mark already done chunks
            status.receivedIndexes.forEach(i => { receivedChunks.add(i); markChunkCell(i, 'done'); });
            updateProgress(receivedChunks.size);
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            isUploading = true;
            continueUpload();
          } else {
            alert('File name does not match. Starting fresh.');
            localStorage.removeItem(LS_KEY);
          }
        };
      };

      discardSessionBtn.onclick = () => {
        localStorage.removeItem(LS_KEY);
        resumeBanner.classList.add('hidden');
      };
    } catch { localStorage.removeItem(LS_KEY); }
  }

  // ── Init ─────────────────────────────────────────────────────
  (async () => {
    await loadConfig();
    await fetchCsrf();
    await checkForResumableSession();
  })();

})();
