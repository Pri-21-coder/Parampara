const store = require('../data/store');
const bcrypt = require('bcryptjs');

const getUsers = (req, res, next) => {
  try {
    const allUsers = [];
    if (store.users.cache && typeof store.users.cache.values === 'function') {
      for (const u of store.users.cache.values()) {
        allUsers.push({ id: u.id, username: u.username, role: u.role });
      }
    } else {
      Object.values(store.users).forEach((v) => {
        if (v && v.username) {
          allUsers.push({ id: v.id, username: v.username, role: v.role });
        }
      });
    }
    res.json(allUsers);
  } catch (error) {
    next(error);
  }
};

const createUser = (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        error: 'Username, password, and role are required',
      });
    }

    const normalizedUsername = String(username).trim();

    if (!normalizedUsername) {
      return res.status(400).json({
        error: 'Username cannot be empty',
      });
    }

    let existingUsers = [];

    if (store.users.cache && typeof store.users.cache.values === 'function') {
      existingUsers = Array.from(store.users.cache.values());
    } else if (typeof store.users.values === 'function') {
      existingUsers = Array.from(store.users.values());
    } else {
      existingUsers = Object.values(store.users || {});
    }

    const duplicateUser = existingUsers.find(
      (user) => user && user.username === normalizedUsername
    );

    if (duplicateUser) {
      return res.status(409).json({
        error: 'Username already exists',
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const id = `user-${Date.now()}`;

    const newUser = {
      id,
      username: normalizedUsername,
      passwordHash,
      role,
    };

    store.users.set(id, newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: { id, username: normalizedUsername, role },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser
};