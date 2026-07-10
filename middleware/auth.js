const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const roleHierarchy = {
  Visitor: ['read:public'],
  Contributor: ['read:public', 'create:items', 'edit:own_items', 'delete:own_items'],
  Curator: ['read:public', 'create:items', 'edit:own_items', 'delete:own_items', 'edit:items', 'delete:items'],
  Administrator: ['read:public', 'create:items', 'edit:own_items', 'delete:own_items', 'edit:items', 'delete:items', 'manage:users', 'read:analytics']
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const userPermissions = roleHierarchy[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Missing required permission: ' + permission });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  roleHierarchy
};
