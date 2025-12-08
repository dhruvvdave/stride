const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { checkAchievements, calculateLevel } = require('../../utils/pointsCalculator');

const router = express.Router();

// Validation schemas
const leaderboardQuerySchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'all').default('all'),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

/**
 * GET /api/leaderboard
 * Get top users (query params: period=week|month|all, limit=50)
 */
router.get('/', validateQuery(leaderboardQuerySchema), asyncHandler(async (req, res) => {
  const { period, limit, offset } = req.query;

  let dateFilter = '';
  const params = [limit, offset];

  if (period === 'week') {
    dateFilter = "WHERE u.created_at >= NOW() - INTERVAL '7 days'";
  } else if (period === 'month') {
    dateFilter = "WHERE u.created_at >= NOW() - INTERVAL '30 days'";
  }

  const result = await db.query(
    `SELECT 
      u.id, u.name, u.avatar_url, u.reputation_points,
      COUNT(DISTINCT r.id) as total_reports,
      COUNT(DISTINCT rt.id) as total_routes,
      COALESCE(SUM(rt.distance_meters), 0) as total_distance
    FROM users u
    LEFT JOIN reports r ON u.id = r.user_id
    LEFT JOIN routes rt ON u.id = rt.user_id
    ${dateFilter}
    GROUP BY u.id
    ORDER BY u.reputation_points DESC, u.created_at ASC
    LIMIT $1 OFFSET $2`,
    params
  );

  const countResult = await db.query(
    `SELECT COUNT(DISTINCT u.id) as total FROM users u ${dateFilter}`
  );

  const leaderboard = result.rows.map((row, index) => ({
    rank: offset + index + 1,
    user: {
      id: row.id,
      name: row.name,
      avatarUrl: row.avatar_url,
    },
    reputationPoints: row.reputation_points,
    level: calculateLevel(row.reputation_points),
    stats: {
      totalReports: parseInt(row.total_reports),
      totalRoutes: parseInt(row.total_routes),
      totalDistanceMeters: parseInt(row.total_distance),
    },
  }));

  res.json({
    success: true,
    data: {
      leaderboard,
      period,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    },
  });
}));

/**
 * GET /api/achievements
 * Get user's achievements (auth required)
 */
router.get('/', auth, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT badge_type, earned_at
     FROM achievements
     WHERE user_id = $1
     ORDER BY earned_at DESC`,
    [req.user.id]
  );

  const achievements = result.rows.map(row => ({
    badgeType: row.badge_type,
    earnedAt: row.earned_at,
  }));

  res.json({
    success: true,
    data: {
      achievements,
      count: achievements.length,
    },
  });
}));

/**
 * GET /api/achievements/available
 * Get all available badges
 */
router.get('/available', asyncHandler(async (req, res) => {
  const badges = [
    {
      type: 'early_adopter',
      name: 'Early Adopter',
      description: 'One of the first 1000 users',
      icon: '🌟',
    },
    {
      type: 'explorer_100km',
      name: 'Explorer',
      description: 'Navigated 100km with Stride',
      icon: '🗺️',
    },
    {
      type: 'reporter_10',
      name: 'Reporter',
      description: 'Submitted 10 obstacle reports',
      icon: '📝',
    },
    {
      type: 'photographer_10',
      name: 'Photographer',
      description: 'Uploaded 10 photos of obstacles',
      icon: '📸',
    },
    {
      type: 'top_contributor',
      name: 'Top Contributor',
      description: 'Top 100 contributors this month',
      icon: '🏆',
    },
    {
      type: 'community_leader',
      name: 'Community Leader',
      description: 'Earned 1000+ reputation points',
      icon: '👑',
    },
  ];

  res.json({
    success: true,
    data: {
      badges,
      count: badges.length,
    },
  });
}));

/**
 * POST /api/achievements/check
 * Check and award achievements for user (internal/cron use)
 */
router.post('/check', auth, asyncHandler(async (req, res) => {
  // Get user stats
  const statsResult = await db.query(
    `SELECT 
      u.id::text::int as user_id_num,
      u.reputation_points,
      COALESCE(SUM(r.distance_meters), 0) as total_distance,
      COUNT(DISTINCT rep.id) as total_reports,
      COUNT(DISTINCT CASE WHEN rep.photos IS NOT NULL AND array_length(rep.photos, 1) > 0 THEN rep.id END) as total_photos
    FROM users u
    LEFT JOIN routes r ON u.id = r.user_id
    LEFT JOIN reports rep ON u.id = rep.user_id
    WHERE u.id = $1
    GROUP BY u.id, u.reputation_points`,
    [req.user.id]
  );

  if (statsResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'User stats not found' },
    });
  }

  const stats = statsResult.rows[0];

  // Get monthly rank
  const rankResult = await db.query(
    `SELECT COUNT(*) + 1 as rank
     FROM users
     WHERE reputation_points > (SELECT reputation_points FROM users WHERE id = $1)`,
    [req.user.id]
  );

  const userStats = {
    userId: stats.user_id_num,
    reputationPoints: stats.reputation_points,
    totalDistanceMeters: parseInt(stats.total_distance),
    totalReports: parseInt(stats.total_reports),
    totalPhotos: parseInt(stats.total_photos),
    monthlyRank: parseInt(rankResult.rows[0].rank),
  };

  // Check which achievements to award
  const badgesToAward = checkAchievements(userStats);

  // Get already earned badges
  const earnedResult = await db.query(
    'SELECT badge_type FROM achievements WHERE user_id = $1',
    [req.user.id]
  );

  const earnedBadges = earnedResult.rows.map(row => row.badge_type);

  // Award new badges
  const newBadges = [];
  for (const badgeType of badgesToAward) {
    if (!earnedBadges.includes(badgeType)) {
      await db.query(
        'INSERT INTO achievements (user_id, badge_type) VALUES ($1, $2)',
        [req.user.id, badgeType]
      );
      newBadges.push(badgeType);
    }
  }

  res.json({
    success: true,
    data: {
      newBadges,
      count: newBadges.length,
    },
  });
}));

module.exports = router;
