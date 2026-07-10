const store = require('../data/store');

const ALLOWED_PROGRESS_FIELDS = new Set(['badges', 'quests', 'checkIns']);

const createDefaultProgress = () => ({
  badges: [],
  quests: [],
  checkIns: [],
});

const getProgress = (req, res) => {
  const userId = req.params.userId;

  res.json(store.userProgress[userId] || createDefaultProgress());
};

const updateProgress = (req, res) => {
  const userId = req.params.userId;
  const payload = req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({
      error: 'Progress update payload must be an object.',
    });
  }

  const incomingKeys = Object.keys(payload);
  const unsupportedKeys = incomingKeys.filter(
    (key) => !ALLOWED_PROGRESS_FIELDS.has(key)
  );

  if (unsupportedKeys.length > 0) {
    return res.status(400).json({
      error: `Unsupported progress fields: ${unsupportedKeys.join(', ')}`,
    });
  }

  for (const key of incomingKeys) {
    if (!Array.isArray(payload[key])) {
      return res.status(400).json({
        error: `Field "${key}" must be an array.`,
      });
    }
  }

  if (!store.userProgress[userId]) {
    store.userProgress[userId] = createDefaultProgress();
  }

  const sanitizedUpdate = {};
  for (const key of incomingKeys) {
    sanitizedUpdate[key] = payload[key];
  }

  store.userProgress[userId] = {
    ...store.userProgress[userId],
    ...sanitizedUpdate,
  };

  res.json(store.userProgress[userId]);
};

module.exports = {
  getProgress,
  updateProgress,
};