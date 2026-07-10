const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'parampara_secret_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'parampara_refresh_secret_98765';
const JWT_EXPIRES_IN = '15m'; // Short-lived access token
const JWT_REFRESH_EXPIRES_IN = '7d'; // Long-lived refresh token

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
