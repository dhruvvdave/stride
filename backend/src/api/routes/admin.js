/**
 * Admin Routes
 * Admin-only endpoints for moderation and system management
 */

const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { getUserSpamScore } = require('../../services/spamDetection');

const router = express.Router();

/**
 * Middleware to check admin access
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Admin access required' },
    });
  }
  next();
};

/**
 * GET /api/admin/flagged-reports
 * Get flagged reports and suspicious users (admin only)
 */
router.get('/flagged-reports', auth, requireAdmin, validateQuery(Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  type: Joi.string().valid('spam', 'low_trust', 'disputed', 'all').default('all'),
})), asyncHandler(async (req, res) => {
  const { limit, offset, type } = req.query;

  const flaggedItems = [];

  // Get users with low trust scores
  if (type === 'low_trust' || type === 'all') {
    const lowTrustResult = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.trust_score, 
        u.reports_verified, u.reports_disputed, u.created_at,
        COUNT(r.id) as total_reports
       FROM users u
       LEFT JOIN reports r ON u.id = r.user_id
       WHERE u.trust_score < 20
       GROUP BY u.id
       ORDER BY u.trust_score ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    lowTrustResult.rows.forEach(user => {
      flaggedItems.push({
        type: 'low_trust_user',
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        trustScore: user.trust_score,
        reportsVerified: user.reports_verified,
        reportsDisputed: user.reports_disputed,
        totalReports: parseInt(user.total_reports),
        createdAt: user.created_at,
      });
    });
  }

  // Get highly disputed obstacles
  if (type === 'disputed' || type === 'all') {
    const disputedResult = await db.query(
      `SELECT 
        o.id, o.type, 
        ST_Y(o.location::geometry) as lat,
        ST_X(o.location::geometry) as lng,
        o.severity, o.confidence_score, o.disputes_count,
        o.confirmations_count, o.created_at,
        u.name as created_by_name
       FROM obstacles o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.disputes_count >= 2
       ORDER BY o.disputes_count DESC, o.confidence_score ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    disputedResult.rows.forEach(obstacle => {
      flaggedItems.push({
        type: 'disputed_obstacle',
        obstacleId: obstacle.id,
        obstacleType: obstacle.type,
        location: {
          lat: parseFloat(obstacle.lat),
          lng: parseFloat(obstacle.lng),
        },
        severity: obstacle.severity,
        confidenceScore: obstacle.confidence_score,
        disputesCount: obstacle.disputes_count,
        confirmationsCount: obstacle.confirmations_count,
        createdByName: obstacle.created_by_name,
        createdAt: obstacle.created_at,
      });
    });
  }

  // Get recent spam reports (users with high spam scores)
  if (type === 'spam' || type === 'all') {
    const recentUsersResult = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email, u.trust_score
       FROM users u
       JOIN reports r ON u.id = r.user_id
       WHERE r.created_at > NOW() - INTERVAL '24 hours'
       GROUP BY u.id
       HAVING COUNT(r.id) > 10
       ORDER BY COUNT(r.id) DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    for (const user of recentUsersResult.rows) {
      const spamScore = await getUserSpamScore(user.id);
      if (spamScore > 50) {
        flaggedItems.push({
          type: 'spam_user',
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          spamScore,
          trustScore: user.trust_score,
        });
      }
    }
  }

  // Get total count (approximate)
  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM users WHERE trust_score < 20'
  );

  res.json({
    success: true,
    data: {
      flaggedItems,
      count: flaggedItems.length,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    },
  });
}));

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
router.get('/stats', auth, requireAdmin, asyncHandler(async (req, res) => {
  // Get various system statistics
  const [
    obstacleStats,
    userStats,
    reportStats,
  ] = await Promise.all([
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'fixed' THEN 1 END) as fixed,
        COUNT(CASE WHEN status = 'disputed' THEN 1 END) as disputed,
        AVG(confidence_score) as avg_confidence
      FROM obstacles
    `),
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN trust_score < 20 THEN 1 END) as flagged,
        AVG(trust_score) as avg_trust
      FROM users
    `),
    db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN report_type = 'new' THEN 1 END) as new_reports,
        COUNT(CASE WHEN report_type = 'confirm' THEN 1 END) as confirmations,
        COUNT(CASE WHEN report_type = 'dispute' THEN 1 END) as disputes
      FROM reports
      WHERE created_at > NOW() - INTERVAL '30 days'
    `),
  ]);

  res.json({
    success: true,
    data: {
      obstacles: {
        total: parseInt(obstacleStats.rows[0].total),
        active: parseInt(obstacleStats.rows[0].active),
        fixed: parseInt(obstacleStats.rows[0].fixed),
        disputed: parseInt(obstacleStats.rows[0].disputed),
        avgConfidence: Math.round(parseFloat(obstacleStats.rows[0].avg_confidence) || 50),
      },
      users: {
        total: parseInt(userStats.rows[0].total),
        flagged: parseInt(userStats.rows[0].flagged),
        avgTrust: Math.round(parseFloat(userStats.rows[0].avg_trust) || 50),
      },
      reports: {
        total: parseInt(reportStats.rows[0].total),
        newReports: parseInt(reportStats.rows[0].new_reports),
        confirmations: parseInt(reportStats.rows[0].confirmations),
        disputes: parseInt(reportStats.rows[0].disputes),
      },
    },
  });
}));

module.exports = router;
