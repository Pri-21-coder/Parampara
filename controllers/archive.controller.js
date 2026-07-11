const store = require('../data/store');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a user's public key for E2EE
 */
const registerPublicKey = (req, res, next) => {
  try {
    const { userId, publicKey } = req.body;

    if (!userId || !publicKey) {
      return res.status(400).json({ error: 'userId and publicKey are required' });
    }

    store.publicKeys.set(userId, {
      publicKey,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: 'Public key registered successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific user's public key
 */
const getPublicKey = (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!store.publicKeys.has(userId)) {
      return res.status(404).json({ error: 'Public key not found for user' });
    }

    res.json(store.publicKeys.get(userId));
  } catch (err) {
    next(err);
  }
};

/**
 * Get all available public keys (for populating share dropdowns)
 */
const getAllPublicKeys = (req, res, next) => {
  try {
    const keys = [];
    for (const [userId, keyData] of store.publicKeys.entries()) {
      keys.push({
        userId,
        ...keyData
      });
    }
    res.json(keys);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new E2EE family archive
 */
const createArchive = (req, res, next) => {
  try {
    const { title, ownerId, encryptedContent, encryptedKeys, iv } = req.body;

    if (!title || !ownerId || !encryptedContent || !encryptedKeys || !iv) {
      return res.status(400).json({ error: 'Missing required fields for archive' });
    }

    const archive = {
      id: uuidv4(),
      title, // Note: Title might be kept plaintext for easier searching/display
      ownerId,
      encryptedContent, // The AES-encrypted data
      iv, // Initialization vector
      encryptedKeys, // Object mapping userId -> RSA-encrypted AES key
      timestamp: new Date().toISOString()
    };

    store.familyArchives.set(archive.id, archive);

    res.status(201).json({ message: 'Archive created securely', id: archive.id });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all archives accessible to a specific user
 */
const getAccessibleArchives = (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const archives = store.familyArchives.values();
    const accessibleArchives = archives.filter(archive => 
      archive.ownerId === userId || (archive.encryptedKeys && archive.encryptedKeys[userId])
    );

    const tailoredArchives = accessibleArchives.map(archive => ({
      id: archive.id,
      title: archive.title,
      ownerId: archive.ownerId,
      timestamp: archive.timestamp,
      encryptedContent: archive.encryptedContent,
      iv: archive.iv,
      encryptedKey: archive.encryptedKeys[userId] // Only the key for THIS user
    }));

    res.json(tailoredArchives);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerPublicKey,
  getPublicKey,
  getAllPublicKeys,
  createArchive,
  getAccessibleArchives
};
