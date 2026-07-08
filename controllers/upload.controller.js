const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

// Configurable chunk size (default 2MB)
const CHUNK_SIZE_BYTES = parseInt(process.env.CHUNK_SIZE_MB || 2) * 1024 * 1024;

// Session timeout: 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Max retries info returned to client
const MAX_RETRIES = 3;

// Allowed video MIME types
const ALLOWED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/avi',
  'video/quicktime', 'video/x-matroska', 'video/3gpp'
];

// ============================================================
//  Helper: append to upload log (capped at 500)
// ============================================================
function appendLog(entry) {
  if (!store.uploadLog) store.uploadLog = [];
  store.uploadLog.push({ ...entry, timestamp: new Date().toISOString() });
  if (store.uploadLog.length > 500) store.uploadLog.shift();
}

// ============================================================
//  GET /api/upload/config
//  Returns server chunk size config to browser
// ============================================================
const getConfig = (req, res) => {
  res.json({
    chunkSizeBytes: CHUNK_SIZE_BYTES,
    maxRetries: MAX_RETRIES,
    sessionTimeoutMs: SESSION_TIMEOUT_MS,
    allowedTypes: ALLOWED_TYPES
  });
};

// ============================================================
//  POST /api/upload/init
//  Create a new upload session
// ============================================================
const initSession = (req, res, next) => {
  try {
    const { fileName, fileSize, mimeType, totalChunks } = req.body;

    if (!fileName || !fileSize || !mimeType || !totalChunks) {
      return res.status(400).json({
        error: 'fileName, fileSize, mimeType, and totalChunks are required'
      });
    }

    if (!fileName.trim()) {
      return res.status(400).json({ error: 'fileName cannot be blank or whitespace only' });
    }

    if (typeof totalChunks !== 'number' || totalChunks < 1 || !Number.isInteger(totalChunks)) {
      return res.status(400).json({ error: 'totalChunks must be a positive integer' });
    }

    if (typeof fileSize !== 'number' || fileSize <= 0) {
      return res.status(400).json({ error: 'fileSize must be a positive number' });
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: `Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_TYPES.join(', ')}`
      });
    }

    const sessionId = uuidv4();
    const session = {
      sessionId,
      fileName: fileName.trim(),
      fileSize,
      mimeType,
      totalChunks,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
      receivedChunks: {},   // index -> Buffer
      receivedCount: 0,
      status: 'active',     // active | complete | expired
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString(),
      completedAt: null,
      assembledSize: null
    };

    store.uploadSessions.set(sessionId, session);
    appendLog({ event: 'session:init', sessionId, fileName: session.fileName, totalChunks });

    res.status(201).json({
      sessionId,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
      totalChunks,
      expiresAt: session.expiresAt
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  POST /api/upload/chunk/:sessionId/:chunkIndex
//  Receive a single chunk as raw binary
// ============================================================
const uploadChunk = (req, res, next) => {
  try {
    const { sessionId, chunkIndex } = req.params;
    const index = parseInt(chunkIndex, 10);

    // Validate session
    const session = store.uploadSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Upload session not found or expired' });
    }

    if (session.status !== 'active') {
      return res.status(409).json({ error: `Session is already ${session.status}` });
    }

    // Check timeout
    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      store.uploadSessions.set(sessionId, session);
      return res.status(410).json({ error: 'Upload session has expired. Please start a new upload.' });
    }

    // Validate chunk index
    if (isNaN(index) || index < 0 || index >= session.totalChunks) {
      return res.status(400).json({
        error: `Invalid chunkIndex ${chunkIndex}. Must be 0 to ${session.totalChunks - 1}`
      });
    }

    // Prevent duplicate chunks
    if (session.receivedChunks[index] !== undefined) {
      return res.status(409).json({
        error: `Chunk ${index} already received`,
        receivedCount: session.receivedCount
      });
    }

    // express.raw() has already parsed the body into req.body (a Buffer)
    const chunkBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');

    if (!chunkBuffer || chunkBuffer.length === 0) {
      return res.status(400).json({ error: 'Chunk body is empty (zero bytes received)' });
    }

    const isLastChunk = index === session.totalChunks - 1;
    const remainingBytes = session.fileSize - (index * session.chunkSizeBytes);
    const maxChunkSize = isLastChunk
      ? Math.min(session.chunkSizeBytes, remainingBytes)
      : session.chunkSizeBytes;

    if (chunkBuffer.length > maxChunkSize) {
      return res.status(400).json({
        error: `Chunk ${index} exceeds the allowed size of ${maxChunkSize} bytes`,
        receivedBytes: chunkBuffer.length,
        maxAllowedBytes: maxChunkSize
      });
    }

    // Store chunk
    session.receivedChunks[index] = chunkBuffer;
    session.receivedCount += 1;

    // Update session
    store.uploadSessions.set(sessionId, session);
    appendLog({ event: 'chunk:received', sessionId, chunkIndex: index, bytes: chunkBuffer.length });

    return res.status(200).json({
      sessionId,
      chunkIndex: index,
      receivedCount: session.receivedCount,
      totalChunks: session.totalChunks,
      progress: Math.round((session.receivedCount / session.totalChunks) * 100)
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  POST /api/upload/complete/:sessionId
//  Verify all chunks received, assemble final file
// ============================================================
const completeUpload = (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = store.uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Upload session not found or expired' });
    }

    if (session.status === 'complete') {
      return res.status(409).json({ error: 'Upload already completed', sessionId });
    }

    if (session.status === 'expired') {
      return res.status(410).json({ error: 'Session expired' });
    }

    // Verify all chunks are present
    const missing = [];
    for (let i = 0; i < session.totalChunks; i++) {
      if (!session.receivedChunks[i]) missing.push(i);
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing chunks: [${missing.join(', ')}]. Cannot assemble yet.`,
        missingChunks: missing,
        receivedCount: session.receivedCount,
        totalChunks: session.totalChunks
      });
    }

    // Assemble chunks in order
    const orderedBuffers = [];
    for (let i = 0; i < session.totalChunks; i++) {
      orderedBuffers.push(session.receivedChunks[i]);
    }
    const assembledBuffer = Buffer.concat(orderedBuffers);

    // Update session
    session.status = 'complete';
    session.assembledSize = assembledBuffer.length;
    session.assembledBuffer = assembledBuffer; // stored in-memory
    session.completedAt = new Date().toISOString();
    store.uploadSessions.set(sessionId, session);

    appendLog({
      event: 'upload:complete',
      sessionId,
      fileName: session.fileName,
      assembledSize: assembledBuffer.length
    });

    res.status(200).json({
      message: 'Upload complete',
      sessionId,
      fileName: session.fileName,
      mimeType: session.mimeType,
      assembledSize: assembledBuffer.length,
      totalChunks: session.totalChunks,
      completedAt: session.completedAt
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/upload/status/:sessionId
//  Returns progress — used by browser for auto-resume
// ============================================================
const getSessionStatus = (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = store.uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const receivedIndexes = Object.keys(session.receivedChunks).map(Number);

    res.status(200).json({
      sessionId,
      fileName: session.fileName,
      fileSize: session.fileSize,
      mimeType: session.mimeType,
      totalChunks: session.totalChunks,
      receivedCount: session.receivedCount,
      receivedIndexes,
      status: session.status,
      progress: Math.round((session.receivedCount / session.totalChunks) * 100),
      expiresAt: session.expiresAt,
      completedAt: session.completedAt
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  Cleanup: remove expired/complete sessions older than 30 min
// ============================================================
const cleanupSessions = () => {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, session] of store.uploadSessions.entries()) {
    if (new Date(session.expiresAt) < now || session.status === 'expired') {
      store.uploadSessions.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    appendLog({ event: 'cleanup:sessions', count: cleaned });
    console.log(`[Upload] Cleaned ${cleaned} expired sessions`);
  }
};

module.exports = {
  getConfig,
  initSession,
  uploadChunk,
  completeUpload,
  getSessionStatus,
  cleanupSessions
};
