const store = require('../data/store');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ['student', 'teacher', 'admin', 'staff'];
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getAllUsers = () => {
  const allUsers = [];
  if (store.users.cache && typeof store.users.cache.values === 'function') {
    for (const u of store.users.cache.values()) {
      if (!u.isDeleted) {
        allUsers.push({ id: u.id, username: u.username, role: u.role, email: u.email, isActive: u.isActive !== false });
      }
    }
  } else {
    Object.values(store.users).forEach((v) => {
      if (v && v.username && !v.isDeleted) {
        allUsers.push({ id: v.id, username: v.username, role: v.role, email: v.email, isActive: v.isActive !== false });
      }
    });
  }
  return allUsers;
};

const getUsers = (req, res, next) => {
  try {
    const { search, role } = req.query;
    const { page, limit, skip } = getPagination(req);

    let users = getAllUsers();

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.username.toLowerCase().includes(searchLower) ||
        (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }

    if (role) {
      const roleLower = role.toLowerCase();
      users = users.filter(u => u.role === roleLower);
    }

    const total = users.length;
    const pagedUsers = users.slice(skip, skip + limit);

    res.json({
      success: true,
      data: pagedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = (req, res, next) => {
  try {
    const { id } = req.params;
    const users = getAllUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const createUser = (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        error: 'Username, email, password, and role are required',
      });
    }

    const normalizedUsername = String(username).trim();
    if (!normalizedUsername || normalizedUsername.length < 3) {
      return res.status(400).json({
        error: 'Username must be at least 3 characters',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    const roleLower = role.toLowerCase();
    if (!VALID_ROLES.includes(roleLower)) {
      return res.status(400).json({
        error: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}`,
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
      (user) => user && (user.username === normalizedUsername || user.email === normalizedEmail)
    );

    if (duplicateUser) {
      const field = duplicateUser.username === normalizedUsername ? 'Username' : 'Email';
      return res.status(409).json({
        error: `${field} already exists`,
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const id = `user-${Date.now()}`;

    const newUser = {
      id,
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: roleLower,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.users.set(id, newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id, username: normalizedUsername, email: normalizedEmail, role: roleLower }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    const user = store.users.get(id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) {
      const trimmed = String(username).trim();
      if (trimmed.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      user.username = trimmed;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      user.email = normalizedEmail;
    }

    if (role) {
      const roleLower = role.toLowerCase();
      if (!VALID_ROLES.includes(roleLower)) {
        return res.status(400).json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}` });
      }
      user.role = roleLower;
    }

    if (isActive !== undefined) {
      user.isActive = isActive === true || isActive === 'true';
    }

    user.updatedAt = new Date().toISOString();
    store.users.set(id, user);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = store.users.get(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isDeleted = true;
    user.deletedAt = new Date().toISOString();
    store.users.set(id, user);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const restoreUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = store.users.get(id);

    if (!user || !user.isDeleted) {
      return res.status(404).json({ error: 'User not found or not deleted' });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.updatedAt = new Date().toISOString();
    store.users.set(id, user);

    res.json({
      success: true,
      message: 'User restored successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser
};