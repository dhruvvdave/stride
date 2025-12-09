const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { calculateLevel } = require('../../utils/pointsCalculator');
const { calculateTrustScore, getTrustLevel } = require('../../services/trustScore');

const router = express.Router();

// Validation schemas
const userIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  avatarUrl: Joi.string().uri(),
});

const leaderboardQuerySchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'all').default('all'),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

/**
 * GET /api/users/:id
 * Get user profile
 */
router.get('/:id', validateParams(userIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, email, name, avatar_url, role, subscription_status, 
            reputation_points, created_at
     FROM users WHERE id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' },
    });
  }

  const user = result.rows[0];
  const level = calculateLevel(user.reputation_points);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatar_url,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        reputationPoints: user.reputation_points,
        level: level,
        createdAt: user.created_at,
      },
    },
  });
}));

/**
 * PUT /api/users/:id
 * Update user profile (auth required)
 */
router.put('/:id', auth, validateParams(userIdSchema), validate(updateUserSchema), asyncHandler(async (req, res) => {
  // Check if user is updating their own profile or is admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to update this profile' },
    });
  }

  const { name, avatarUrl } = req.body;
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }

  if (avatarUrl) {
    updates.push(`avatar_url = $${paramCount++}`);
    values.push(avatarUrl);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'No fields to update' },
    });
  }

  updates.push(`updated_at = NOW()`);
  values.push(req.params.id);

  const result = await db.query(
    `UPDATE users SET ${updates.join(', ')} 
     WHERE id = $${paramCount}
     RETURNING id, email, name, avatar_url, role, reputation_points`,
    values
  );

  res.json({
    success: true,
    data: {
      user: result.rows[0],
    },
  });
}));

/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
router.get('/:id/stats', validateParams(userIdSchema), asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Get user info
  const userResult = await db.query(
    'SELECT name, reputation_points FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' },
    });
  }

  const user = userResult.rows[0];

  // Get total distance
  const distanceResult = await db.query(
    'SELECT COALESCE(SUM(distance_meters), 0) as total_distance FROM routes WHERE user_id = $1',
    [userId]
  );

  // Get obstacles avoided
  const obstaclesResult = await db.query(
    'SELECT COUNT(*) as count FROM routes WHERE user_id = $1 AND obstacle_count > 0',
    [userId]
  );

  // Get reports submitted
  const reportsResult = await db.query(
    'SELECT COUNT(*) as total, COUNT(CASE WHEN photos IS NOT NULL AND array_length(photos, 1) > 0 THEN 1 END) as with_photos FROM reports WHERE user_id = $1',
    [userId]
  );

  // Get verified reports
  const verifiedResult = await db.query(
    `SELECT COUNT(*) as count 
     FROM reports r 
     JOIN obstacles o ON r.obstacle_id = o.id 
     WHERE r.user_id = $1 AND o.verified = true`,
    [userId]
  );

  // Get badges
  const badgesResult = await db.query(
    'SELECT badge_type, earned_at FROM achievements WHERE user_id = $1 ORDER BY earned_at DESC',
    [userId]
  );

  const stats = {
    userName: user.name,
    reputationPoints: user.reputation_points,
    level: calculateLevel(user.reputation_points),
    totalDistanceMeters: parseInt(distanceResult.rows[0].total_distance),
    obstaclesAvoided: parseInt(obstaclesResult.rows[0].count),
    reportsSubmitted: parseInt(reportsResult.rows[0].total),
    photosUploaded: parseInt(reportsResult.rows[0].with_photos),
    reportsVerified: parseInt(verifiedResult.rows[0].count),
    badges: badgesResult.rows.map(b => ({
      type: b.badge_type,
      earnedAt: b.earned_at,
    })),
  };

  res.json({
    success: true,
    data: { stats },
  });
}));

/**
 * GET /api/users/leaderboard
 * Get top contributors (paginated)
 */
router.get('/', validateQuery(leaderboardQuerySchema), asyncHandler(async (req, res) => {
  const { period, limit, offset } = req.query;

  let dateFilter = '';
  if (period === 'week') {
    dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
  } else if (period === 'month') {
    dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
  }

  const result = await db.query(
    `SELECT 
       u.id, u.name, u.avatar_url, u.reputation_points,
       COUNT(r.id) as total_reports
     FROM users u
     LEFT JOIN reports r ON u.id = r.user_id ${dateFilter}
     GROUP BY u.id
     ORDER BY u.reputation_points DESC, u.created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await db.query('SELECT COUNT(*) as total FROM users');

  const leaderboard = result.rows.map((user, index) => ({
    rank: offset + index + 1,
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url,
    reputationPoints: user.reputation_points,
    totalReports: parseInt(user.total_reports),
    level: calculateLevel(user.reputation_points),
  }));

  res.json({
    success: true,
    data: {
      leaderboard,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    },
  });
}));

/**
 * GET /api/users/:id/trust-score
 * Get user trust score and statistics
 */
router.get('/:id/trust-score', validateParams(userIdSchema), asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Get user info
  const userResult = await db.query(
    `SELECT 
      name, 
      trust_score, 
      reports_verified, 
      reports_disputed,
      created_at
     FROM users 
     WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' },
    });
  }

  const user = userResult.rows[0];

  // Calculate current trust score (will match DB if recently updated)
  const calculatedScore = await calculateTrustScore(userId);
  const trustLevel = getTrustLevel(calculatedScore);

  // Get total reports
  const reportsResult = await db.query(
    'SELECT COUNT(*) as total FROM reports WHERE user_id = $1',
    [userId]
  );

  const totalReports = parseInt(reportsResult.rows[0].total);
  const accuracy = totalReports > 0 
    ? ((user.reports_verified / totalReports) * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      trustScore: calculatedScore,
      trustLevel,
      statistics: {
        reportsVerified: user.reports_verified,
        reportsDisputed: user.reports_disputed,
        totalReports,
        accuracy: parseFloat(accuracy),
        accountAge: Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    },
  });
}));

module.exports = router;
