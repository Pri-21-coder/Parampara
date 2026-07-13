const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CHUNK_SIZE_BYTES = parseInt(process.env.CHUNK_SIZE_MB || 2) * 1024 * 1024;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_RETRIES = 3;
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_SESSIONS_PER_USER = 10;

const ALLOWED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/avi',
  'video/quicktime', 'video/x-matroska', 'video/3gpp',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/bmp', 'image/tiff',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/csv', 'application/json'
];

const ALLOWED_EXTENSIONS = [
  '.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv', '.3gp',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff',
  '.mp3', '.wav', '.ogg', '.webm',
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.json'
];

const UPLOAD_DIR = path.join(__dirname, '../uploads');

function appendLog(entry) {
  if (!store.uploadLog) store.uploadLog = [];
  store.uploadLog.push({ ...entry, timestamp: new Date().toISOString() });
  if (store.uploadLog.length > 500) store.uploadLog.shift();
}

function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  const base = path.basename(filename);
  const sanitized = base
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 255);
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Filename contains no valid characters');
  }
  return sanitized;
}

function generateSafeFileName(originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

function validateFileType(filename) {
  const ext = path.extname(filename || '').toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File extension "${ext}" is not allowed`);
  }
  return true;
}

function checkDiskSpace(directory) {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const stats = fs.statfsSync(directory);
    const available = stats.bavail * stats.bsize;
    const minRequired = 10 * 1024 * 1024;
    return available > minRequired;
  } catch (error) {
    logger.warn('Disk space check failed:', error.message);
    return true;
  }
}

function validateSessionLimit(userId) {
  if (!userId) return true;
  let userSessionCount = 0;
  for (const [id, session] of store.uploadSessions.entries()) {
    if (session.userId === userId && session.status === 'active') {
      userSessionCount++;
    }
  }
  return userSessionCount < MAX_SESSIONS_PER_USER;
}

const getConfig = (req, res) => {
  res.json({
    chunkSizeBytes: CHUNK_SIZE_BYTES,
    maxRetries: MAX_RETRIES,
    sessionTimeoutMs: SESSION_TIMEOUT_MS,
    allowedTypes: ALLOWED_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: Math.round(MAX_FILE_SIZE / (1024 * 1024))
  });
};

const initSession = (req, res, next) => {
  try {
    const { fileName, fileSize, mimeType, totalChunks, userId } = req.body;

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

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size exceeds maximum of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
      });
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: `Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_TYPES.join(', ')}`
      });
    }

    try {
      validateFileType(fileName);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    if (userId && !validateSessionLimit(userId)) {
      return res.status(429).json({
        error: `Maximum ${MAX_SESSIONS_PER_USER} active upload sessions per user`
      });
    }

    if (!checkDiskSpace(UPLOAD_DIR)) {
      return res.status(507).json({
        error: 'Insufficient disk space for upload'
      });
    }

    const sessionId = uuidv4();
    const session = {
      sessionId,
      userId: userId || null,
      fileName: fileName.trim(),
      fileSize,
      mimeType,
      totalChunks,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
      receivedChunks: {},
      receivedCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString(),
      completedAt: null,
      assembledSize: null,
      retryCount: 0
    };

    store.uploadSessions.set(sessionId, session);
    appendLog({ event: 'session:init', sessionId, fileName: session.fileName, totalChunks, userId });

    res.status(201).json({
      sessionId,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
      totalChunks,
      expiresAt: session.expiresAt,
      maxRetries: MAX_RETRIES
    });
  } catch (err) {
    next(err);
  }
};

const uploadChunk = (req, res, next) => {
  try {
    const { sessionId, chunkIndex } = req.params;
    const index = parseInt(chunkIndex, 10);

    const session = store.uploadSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Upload session not found or expired' });
    }

    if (session.status !== 'active') {
      return res.status(409).json({ error: `Session is already ${session.status}` });
    }

    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      store.uploadSessions.set(sessionId, session);
      return res.status(410).json({ error: 'Upload session has expired. Please start a new upload.' });
    }

    if (isNaN(index) || index < 0 || index >= session.totalChunks) {
      return res.status(400).json({
        error: `Invalid chunkIndex ${chunkIndex}. Must be 0 to ${session.totalChunks - 1}`
      });
    }

    if (session.receivedChunks[index] !== undefined) {
      return res.status(409).json({
        error: `Chunk ${index} already received`,
        receivedCount: session.receivedCount
      });
    }

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

    session.receivedChunks[index] = chunkBuffer;
    session.receivedCount += 1;
    session.retryCount = 0;

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

    const orderedBuffers = [];
    for (let i = 0; i < session.totalChunks; i++) {
      orderedBuffers.push(session.receivedChunks[i]);
    }
    const assembledBuffer = Buffer.concat(orderedBuffers);

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const safeName = sanitizeFilename(session.fileName);
    const finalName = generateSafeFileName(safeName);
    const filePath = path.join(UPLOAD_DIR, finalName);

    fs.writeFileSync(filePath, assembledBuffer);

    session.status = 'complete';
    session.assembledSize = assembledBuffer.length;
    session.completedAt = new Date().toISOString();
    session.filePath = filePath;
    session.finalName = finalName;

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
      finalName: finalName,
      mimeType: session.mimeType,
      assembledSize: assembledBuffer.length,
      totalChunks: session.totalChunks,
      completedAt: session.completedAt,
      fileUrl: `/uploads/${finalName}`
    });
  } catch (err) {
    next(err);
  }
};

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

const cancelUpload = (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = store.uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'complete') {
      return res.status(409).json({ error: 'Cannot cancel completed upload' });
    }

    session.status = 'cancelled';
    session.receivedChunks = {};
    session.receivedCount = 0;
    store.uploadSessions.set(sessionId, session);

    appendLog({ event: 'upload:cancelled', sessionId });

    res.status(200).json({
      success: true,
      message: 'Upload cancelled successfully',
      sessionId
    });
  } catch (err) {
    next(err);
  }
};

const retryChunk = (req, res, next) => {
  try {
    const { sessionId, chunkIndex } = req.params;
    const index = parseInt(chunkIndex, 10);

    const session = store.uploadSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(409).json({ error: `Session is already ${session.status}` });
    }

    if (session.retryCount >= MAX_RETRIES) {
      return res.status(429).json({
        error: `Maximum retries (${MAX_RETRIES}) exceeded for this session`
      });
    }

    if (session.receivedChunks[index] !== undefined) {
      return res.status(409).json({ error: `Chunk ${index} already received` });
    }

    session.retryCount += 1;
    store.uploadSessions.set(sessionId, session);

    res.status(200).json({
      success: true,
      message: `Retry ${session.retryCount}/${MAX_RETRIES} available for chunk ${index}`,
      sessionId,
      chunkIndex: index,
      retryCount: session.retryCount,
      maxRetries: MAX_RETRIES
    });
  } catch (err) {
    next(err);
  }
};

const cleanupSessions = () => {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, session] of store.uploadSessions.entries()) {
    if (new Date(session.expiresAt) < now || session.status === 'expired' || session.status === 'cancelled') {
      if (session.filePath && fs.existsSync(session.filePath)) {
        try {
          fs.unlinkSync(session.filePath);
        } catch (error) {
          logger.warn(`Failed to delete file: ${session.filePath}`);
        }
      }
      store.uploadSessions.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    appendLog({ event: 'cleanup:sessions', count: cleaned });
    logger.info(`[Upload] Cleaned ${cleaned} expired sessions`);
  }
};

setInterval(cleanupSessions, 5 * 60 * 1000);

module.exports = {
  getConfig,
  initSession,
  uploadChunk,
  completeUpload,
  getSessionStatus,
  cancelUpload,
  retryChunk,
  cleanupSessions,
  sanitizeFilename,
  validateFileType,
  checkDiskSpace,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE
};