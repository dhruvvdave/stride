const jwt = require('jsonwebtoken');
const db = require('../../config/database');

/**
 * Verify JWT token and attach user to request
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await db.query(
      `SELECT id, email, name, avatar_url, role, subscription_status, subscription_expires_at, reputation_points
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // Update last_active_at
    await db.query(
      'UPDATE users SET last_active_at = NOW() WHERE id = $1',
      [decoded.id]
    );

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token' },
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error' },
    });
  }
};

/**
 * Optional authentication - attaches user if token is present but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query(
      'SELECT id, email, name, role, subscription_status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = { auth, optionalAuth };
