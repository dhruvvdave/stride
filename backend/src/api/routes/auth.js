const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../../config/database');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../../utils/emailService');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(255).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email already registered' },
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const result = await db.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, reputation_points, created_at`,
    [email.toLowerCase(), passwordHash, name, 'user']
  );

  const user = result.rows[0];

  // Generate JWT token
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
    console.error('Failed to send welcome email:', err);
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        reputationPoints: user.reputation_points,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
}));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user
  const result = await db.query(
    `SELECT id, email, password_hash, name, avatar_url, role, subscription_status, 
            subscription_expires_at, reputation_points
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password' },
    });
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password' },
    });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  // Update last_active_at
  await db.query(
    'UPDATE users SET last_active_at = NOW() WHERE id = $1',
    [user.id]
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        subscriptionExpiresAt: user.subscription_expires_at,
        reputationPoints: user.reputation_points,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { message: 'Refresh token required' },
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' },
    });
  }
}));

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', auth, asyncHandler(async (req, res) => {
  // In a more complex implementation, you'd invalidate the token in Redis
  // For now, client handles token removal
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', auth, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, email, name, avatar_url, role, subscription_status, 
            subscription_expires_at, reputation_points, email_verified, created_at, last_active_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' },
    });
  }

  const user = result.rows[0];

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        subscriptionExpiresAt: user.subscription_expires_at,
        reputationPoints: user.reputation_points,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastActiveAt: user.last_active_at,
      },
    },
  });
}));

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const result = await db.query(
    'SELECT id, name FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  // Always return success to prevent email enumeration
  if (result.rows.length === 0) {
    return res.json({
      success: true,
      message: 'If an account exists, a password reset email has been sent',
    });
  }

  const user = result.rows[0];

  // Generate reset token (valid for 1 hour)
  const resetToken = jwt.sign(
    { id: user.id, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Send reset email
  await emailService.sendPasswordResetEmail(email, resetToken);

  res.json({
    success: true,
    message: 'If an account exists, a password reset email has been sent',
  });
}));

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid reset token' },
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, decoded.id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid or expired reset token' },
    });
  }
}));

module.exports = router;
