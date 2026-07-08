const bcrypt = require('bcryptjs');
const store = require('../data/store');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const login = (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const allUsers = [];
    if (store.users.cache && typeof store.users.cache.values === 'function') {
        for (const u of store.users.cache.values()) {
            allUsers.push(u);
        }
    } else {
        Object.values(store.users).forEach(v => {
            if (v && v.username) allUsers.push(v);
        });
    }

    const user = allUsers.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    store.refreshTokens.set(refreshToken, { userId: user.id });

    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const refresh = (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });

    // Verify token exists in our store
    if (!store.refreshTokens.has(token)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    
    const allUsers = [];
    if (store.users.cache && typeof store.users.cache.values === 'function') {
        for (const u of store.users.cache.values()) {
            allUsers.push(u);
        }
    }
    const user = allUsers.find(u => u.id === decoded.id);

    if (!user) return res.status(403).json({ error: 'User no longer exists' });

    const newAccessToken = generateToken(user);

    res.json({ token: newAccessToken });
  } catch (error) {
    next(error);
  }
};

const profile = (req, res, next) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    const { token } = req.body;
    if (token) {
      store.refreshTokens.delete(token);
    }
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

const roles = (req, res, next) => {
  try {
    res.json({ roles: ['Administrator', 'Curator', 'Contributor', 'Visitor'] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
  profile,
  logout,
  roles
};
