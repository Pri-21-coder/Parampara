const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

function resolveConsensusThreshold(rawValue) {
  const DEFAULT_THRESHOLD = 2;

  if (typeof rawValue !== 'string') {
    return DEFAULT_THRESHOLD;
  }

  const normalizedValue = rawValue.trim();

  // Only allow whole positive integers like "1", "2", "10"
  if (!/^\d+$/.test(normalizedValue)) {
    return DEFAULT_THRESHOLD;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return DEFAULT_THRESHOLD;
  }

  return parsedValue;
}

// Configurable consensus threshold (number of approvals needed to publish)
const CONSENSUS_THRESHOLD = resolveConsensusThreshold(process.env.MODERATION_THRESHOLD);

// Moderation timeout: 10 minutes
const MODERATION_TIMEOUT_MS = 10 * 60 * 1000;
// ============================================================
//  Helper: HMAC-SHA256 signature verification
// ============================================================
function verifyHmac(payload, signature, secret) {
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

// ============================================================
//  Helper: append to moderation audit log (capped at 500)
// ============================================================
function appendLog(entry) {
  store.moderationLog.push({ ...entry, timestamp: new Date().toISOString() });
  if (store.moderationLog.length > 500) store.moderationLog.shift();
}

// ============================================================
//  POST /api/moderation/register-peer
//  Register a trusted peer with their HMAC secret (hashed for storage)
// ============================================================
const registerPeer = (req, res, next) => {
  try {
    const { peerId, secret, username } = req.body;

    if (!peerId || !secret || !username) {
      return res.status(400).json({ error: 'peerId, secret, and username are required' });
    }

    if (secret.length < 16) {
      return res.status(400).json({ error: 'Secret must be at least 16 characters' });
    }

    // Store a SHA-256 hash of the secret, not the plaintext
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    store.trustedPeers.set(peerId, {
      secretHash,
      username,
      registeredAt: new Date().toISOString()
    });

    appendLog({ event: 'peer:registered', peerId, username });

    res.status(200).json({ message: 'Peer registered successfully', peerId });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  POST /api/moderation/submit
//  Submit content for community moderation review
// ============================================================
const submitForModeration = (req, res, next) => {
  try {
    const { type, title, content, submittedBy, metadata } = req.body;

    if (!type || !title?.trim() || !content?.trim() || !submittedBy?.trim()) {
      return res.status(400).json({ error: 'type, title, content, and submittedBy are required and cannot be blank' });
    }

    const itemId = uuidv4();
    const item = {
      id: itemId,
      type,           // 'villagePost' | 'culturalItem' | etc.
      title,
      content,
      submittedBy,
      metadata: metadata || {},
      status: 'pending',
      votes: {},      // peerId -> { decision: 'approve'|'reject', timestamp }
      approvals: 0,
      rejections: 0,
      threshold: CONSENSUS_THRESHOLD,
      submittedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + MODERATION_TIMEOUT_MS).toISOString()
    };

    store.moderationQueue.set(itemId, item);
    appendLog({ event: 'item:submitted', itemId, type, title, submittedBy });

    res.status(201).json({
      message: 'Submitted for moderation',
      itemId,
      threshold: CONSENSUS_THRESHOLD,
      expiresAt: item.expiresAt
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  POST /api/moderation/vote
//  Cast a cryptographically signed vote on a pending item
// ============================================================
const castVote = (req, res, next) => {
  try {
    const { itemId, peerId, decision, signature } = req.body;

    // Validate required fields
    if (!itemId || !peerId || !decision || !signature) {
      return res.status(400).json({ error: 'itemId, peerId, decision, and signature are required' });
    }

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be "approve" or "reject"' });
    }

    // Check peer is trusted
    const peer = store.trustedPeers.get(peerId);
    if (!peer) {
      return res.status(403).json({ error: 'Peer is not a registered trusted moderator' });
    }

    // Verify HMAC signature: payload = itemId + ':' + peerId + ':' + decision
    const payload = `${itemId}:${peerId}:${decision}`;
    const secretHash = peer.secretHash;

    // We re-derive the secret from the stored hash for verification — NOT possible.
    // Instead, we require the peer to send their raw secret in the request for verification.
    // This is safe because all communication is over HTTPS in production.
    const { secret } = req.body;
    if (!secret) {
      return res.status(400).json({ error: 'secret is required for vote verification' });
    }

    // Hash provided secret and compare to stored hash
    const providedHash = crypto.createHash('sha256').update(secret).digest('hex');
    if (providedHash !== secretHash) {
      return res.status(403).json({ error: 'Invalid secret — vote rejected' });
    }

    // Verify HMAC signature
    if (!verifyHmac(payload, signature, secret)) {
      return res.status(403).json({ error: 'Invalid HMAC signature — vote rejected' });
    }

    // Get the item
    const item = store.moderationQueue.get(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Moderation item not found or expired' });
    }

    if (item.status !== 'pending') {
      return res.status(409).json({ error: `Item is already ${item.status}` });
    }

    // Check if item has timed out
    if (new Date() > new Date(item.expiresAt)) {
      item.status = 'rejected';
      item.rejectionReason = 'timeout';
      store.moderationQueue.set(itemId, item);
      appendLog({ event: 'item:timeout', itemId });
      return res.status(410).json({ error: 'Moderation window expired — item rejected' });
    }

    // Prevent duplicate votes
    if (item.votes[peerId]) {
      return res.status(409).json({ error: 'Peer has already voted on this item' });
    }

    // Record vote
    item.votes[peerId] = { decision, timestamp: new Date().toISOString() };
    if (decision === 'approve') {
      item.approvals += 1;
    } else {
      item.rejections += 1;
    }

    appendLog({ event: 'vote:cast', itemId, peerId, decision });

    // Check consensus
    let statusChanged = false;
    if (item.approvals >= item.threshold) {
      item.status = 'approved';
      statusChanged = true;
      appendLog({ event: 'item:approved', itemId, approvals: item.approvals });
    } else if (item.rejections >= item.threshold) {
      item.status = 'rejected';
      statusChanged = true;
      appendLog({ event: 'item:rejected', itemId, rejections: item.rejections });
    }

    store.moderationQueue.set(itemId, item);

    res.status(200).json({
      message: statusChanged ? `Item ${item.status}` : 'Vote recorded',
      itemId,
      status: item.status,
      approvals: item.approvals,
      rejections: item.rejections,
      threshold: item.threshold
    });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/moderation/queue
//  Returns all pending moderation items (without secrets)
// ============================================================
const getQueue = (req, res, next) => {
  try {
    const { status } = req.query; // optional filter: pending|approved|rejected

    const items = [];
    for (const item of store.moderationQueue.values()) {
      if (!status || item.status === status) {
        items.push({
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          submittedBy: item.submittedBy,
          status: item.status,
          approvals: item.approvals,
          rejections: item.rejections,
          threshold: item.threshold,
          submittedAt: item.submittedAt,
          expiresAt: item.expiresAt,
          voterCount: Object.keys(item.votes).length
        });
      }
    }

    // Sort by newest first
    items.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/moderation/log
//  Returns the moderation audit log
// ============================================================
const getLog = (req, res, next) => {
  try {
    res.status(200).json(store.moderationLog.slice(-100)); // last 100 events
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/moderation/peers
//  Returns list of registered trusted peers (no secrets)
// ============================================================
const getPeers = (req, res, next) => {
  try {
    const peers = [];
    for (const [peerId, peer] of store.trustedPeers.entries()) {
      peers.push({
        peerId,
        username: peer.username,
        registeredAt: peer.registeredAt
      });
    }
    res.status(200).json(peers);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerPeer,
  submitForModeration,
  castVote,
  getQueue,
  getLog,
  getPeers
};
