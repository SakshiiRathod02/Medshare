const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/db');

/**
 * Middleware: Verify JWT and attach current user to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required. Please sign in.'
    });
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired authentication token.'
      });
    }

    // Fetch fresh user from DB
    const user = db.get(
      'SELECT id, name, email, role, org_type, phone, address, lat, lng, verified, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    req.user = user;
    next();
  });
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 * @param {string|string[]} roles - One or more allowed roles ('donor', 'recipient', 'verifier', 'admin')
 */
function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of the following roles: ${allowed.join(', ')}.`
      });
    }

    next();
  };
}

/**
 * Middleware: Require verified NGO/Clinic recipient
 */
function requireVerifiedRecipient(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  if (req.user.role === 'recipient' && ['ngo', 'clinic'].includes(req.user.org_type) && !req.user.verified) {
    return res.status(403).json({
      success: false,
      error: 'Your organisation account is currently pending administrative verification.'
    });
  }

  next();
}

/**
 * Optional token authentication (doesn't fail if no token provided)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : null;

  if (!token) {
    return next();
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const user = db.get(
        'SELECT id, name, email, role, org_type, phone, address, lat, lng, verified FROM users WHERE id = ?',
        [decoded.id]
      );
      if (user) {
        req.user = user;
      }
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  requireRole,
  requireVerifiedRecipient,
  optionalAuth
};
