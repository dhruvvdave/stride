const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { incrementConfirmations, incrementDisputes, updateConfidenceScore } = require('../../services/confidenceScore');
const { incrementVerifiedReports, incrementDisputedReports } = require('../../services/trustScore');
const { getClusters, invalidateCache } = require('../../services/clusterService');
const { detectSpam } = require('../../services/spamDetection');
const geohash = require('../../services/geohashService');

const router = express.Router();

// Validation schemas
const obstacleQuerySchema = Joi.object({
  minLat: Joi.number().min(-90).max(90).required(),
  maxLat: Joi.number().min(-90).max(90).required(),
  minLng: Joi.number().min(-180).max(180).required(),
  maxLng: Joi.number().min(-180).max(180).required(),
  types: Joi.array().items(Joi.string().valid('speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing')),
  severity: Joi.array().items(Joi.string().valid('low', 'medium', 'high')),
  status: Joi.string().valid('active', 'fixed', 'disputed').default('active'),
  minConfidence: Joi.number().min(0).max(100).default(30),
});

const createObstacleSchema = Joi.object({
  type: Joi.string().valid('speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing').required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  severity: Joi.string().valid('low', 'medium', 'high').required(),
  description: Joi.string().max(1000),
  photos: Joi.array().items(Joi.string().uri()).max(3),
  sensorData: Joi.object(),
  confidenceScore: Joi.number().min(0).max(1),
});

const updateObstacleSchema = Joi.object({
  type: Joi.string().valid('speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing'),
  severity: Joi.string().valid('low', 'medium', 'high'),
  status: Joi.string().valid('active', 'fixed', 'disputed'),
  verified: Joi.boolean(),
});

const obstacleIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

/**
 * GET /api/obstacles
 * Get obstacles in bounding box (spatial query)
 */
router.get('/', validateQuery(obstacleQuerySchema), optionalAuth, asyncHandler(async (req, res) => {
  const { minLat, maxLat, minLng, maxLng, types, severity, status, minConfidence } = req.query;

  // Build query
  let query = `
    SELECT 
      o.id, o.type, 
      ST_Y(o.location::geometry) as lat,
      ST_X(o.location::geometry) as lng,
      o.severity, o.verified, o.verification_count, o.status,
      o.confidence_score, o.confirmations_count,
      o.created_at, o.last_verified_at,
      u.name as created_by_name
    FROM obstacles o
    LEFT JOIN users u ON o.created_by = u.id
    WHERE o.location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
      AND o.status = $5
      AND COALESCE(o.confidence_score, 50) >= $6
  `;

  const params = [minLng, minLat, maxLng, maxLat, status, minConfidence];
  let paramCount = 7;

  // Filter by types
  if (types && types.length > 0) {
    query += ` AND o.type = ANY($${paramCount})`;
    params.push(types);
    paramCount++;
  }

  // Filter by severity
  if (severity && severity.length > 0) {
    query += ` AND o.severity = ANY($${paramCount})`;
    params.push(severity);
    paramCount++;
  }

  query += ' ORDER BY o.confidence_score DESC, o.created_at DESC LIMIT 500';

  const result = await db.query(query, params);

  const obstacles = result.rows.map(row => ({
    id: row.id,
    type: row.type,
    location: {
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    },
    severity: row.severity,
    verified: row.verified,
    verificationCount: row.verification_count,
    status: row.status,
    confidenceScore: row.confidence_score || 50,
    confirmationsCount: row.confirmations_count || 0,
    createdByName: row.created_by_name,
    createdAt: row.created_at,
    lastVerifiedAt: row.last_verified_at,
  }));

  res.json({
    success: true,
    data: {
      obstacles,
      count: obstacles.length,
    },
  });
}));

/**
 * GET /api/obstacles/:id
 * Get obstacle details
 */
router.get('/:id', validateParams(obstacleIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT 
      o.id, o.type,
      ST_Y(o.location::geometry) as lat,
      ST_X(o.location::geometry) as lng,
      o.severity, o.verified, o.verification_count, o.status,
      o.created_by, o.created_at, o.updated_at, o.last_verified_at,
      u.name as created_by_name, u.avatar_url as created_by_avatar
    FROM obstacles o
    LEFT JOIN users u ON o.created_by = u.id
    WHERE o.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Obstacle not found' },
    });
  }

  const row = result.rows[0];
  const obstacle = {
    id: row.id,
    type: row.type,
    location: {
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    },
    severity: row.severity,
    verified: row.verified,
    verificationCount: row.verification_count,
    status: row.status,
    createdBy: row.created_by ? {
      id: row.created_by,
      name: row.created_by_name,
      avatarUrl: row.created_by_avatar,
    } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastVerifiedAt: row.last_verified_at,
  };

  res.json({
    success: true,
    data: { obstacle },
  });
}));

/**
 * POST /api/obstacles
 * Create new obstacle (auth required)
 */
router.post('/', auth, validate(createObstacleSchema), asyncHandler(async (req, res) => {
  const { type, lat, lng, severity, description, photos, sensorData, confidenceScore } = req.body;

  // Check for spam
  const spamCheck = await detectSpam(req.user.id, type, lat, lng, description);
  if (spamCheck.isSpam) {
    return res.status(429).json({
      success: false,
      error: { 
        message: 'Spam detected. Please wait before submitting more reports.',
        code: 'SPAM_DETECTED',
        flags: spamCheck,
      },
    });
  }

  // Check for duplicate obstacles within 50m
  const duplicateCheck = await db.query(
    `SELECT id FROM obstacles 
     WHERE ST_DWithin(
       location,
       ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
       50
     ) AND type = $3 AND status = 'active'`,
    [lng, lat, type]
  );

  if (duplicateCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { 
        message: 'An obstacle of this type already exists nearby',
        existingObstacleId: duplicateCheck.rows[0].id,
      },
    });
  }

  // Calculate geohash
  const obstacleGeohash = geohash.encode(lat, lng, 9);

  // Calculate initial confidence score (50 base + 10 if photos)
  const initialConfidence = photos && photos.length > 0 ? 60 : 50;

  // Create obstacle
  const obstacleResult = await db.query(
    `INSERT INTO obstacles (type, location, severity, created_by, status, geohash, confidence_score)
     VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5, 'active', $6, $7)
     RETURNING id, type, severity, verification_count, verified, status, confidence_score, created_at`,
    [type, lng, lat, severity, req.user.id, obstacleGeohash, initialConfidence]
  );

  const obstacle = obstacleResult.rows[0];

  // Create initial report
  await db.query(
    `INSERT INTO reports (obstacle_id, user_id, report_type, severity, description, photos, sensor_data, confidence_score)
     VALUES ($1, $2, 'new', $3, $4, $5, $6, $7)`,
    [obstacle.id, req.user.id, severity, description || null, photos || [], sensorData ? JSON.stringify(sensorData) : null, confidenceScore || null]
  );

  // Award points to user
  const pointsAwarded = photos && photos.length > 0 ? 55 : 50; // 50 for new + 5 for photo
  await db.query(
    'UPDATE users SET reputation_points = reputation_points + $1 WHERE id = $2',
    [pointsAwarded, req.user.id]
  );

  // Invalidate cluster cache for this location
  await invalidateCache(lat, lng);

  res.status(201).json({
    success: true,
    data: {
      obstacle: {
        id: obstacle.id,
        type: obstacle.type,
        location: { lat, lng },
        severity: obstacle.severity,
        verified: obstacle.verified,
        verificationCount: obstacle.verification_count,
        status: obstacle.status,
        createdAt: obstacle.created_at,
      },
      pointsAwarded,
    },
  });
}));

/**
 * PUT /api/obstacles/:id
 * Update obstacle (admin only)
 */
router.put('/:id', auth, validateParams(obstacleIdSchema), validate(updateObstacleSchema), asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Admin access required' },
    });
  }

  const { type, severity, status, verified } = req.body;
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (type) {
    updates.push(`type = $${paramCount++}`);
    values.push(type);
  }

  if (severity) {
    updates.push(`severity = $${paramCount++}`);
    values.push(severity);
  }

  if (status) {
    updates.push(`status = $${paramCount++}`);
    values.push(status);
  }

  if (verified !== undefined) {
    updates.push(`verified = $${paramCount++}`);
    values.push(verified);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'No fields to update' },
    });
  }

  updates.push(`updated_at = NOW()`);
  values.push(req.params.id);

  await db.query(
    `UPDATE obstacles SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );

  res.json({
    success: true,
    message: 'Obstacle updated successfully',
  });
}));

/**
 * DELETE /api/obstacles/:id
 * Delete obstacle (admin only)
 */
router.delete('/:id', auth, validateParams(obstacleIdSchema), asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Admin access required' },
    });
  }

  await db.query('DELETE FROM obstacles WHERE id = $1', [req.params.id]);

  res.json({
    success: true,
    message: 'Obstacle deleted successfully',
  });
}));

/**
 * GET /api/obstacles/:id/reports
 * Get all reports for an obstacle
 */
router.get('/:id/reports', validateParams(obstacleIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT 
      r.id, r.report_type, r.severity, r.description, r.photos,
      r.confidence_score, r.created_at,
      u.id as user_id, u.name as user_name, u.avatar_url as user_avatar
    FROM reports r
    JOIN users u ON r.user_id = u.id
    WHERE r.obstacle_id = $1
    ORDER BY r.created_at DESC`,
    [req.params.id]
  );

  const reports = result.rows.map(row => ({
    id: row.id,
    reportType: row.report_type,
    severity: row.severity,
    description: row.description,
    photos: row.photos,
    confidenceScore: row.confidence_score,
    createdAt: row.created_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      avatarUrl: row.user_avatar,
    },
  }));

  res.json({
    success: true,
    data: {
      reports,
      count: reports.length,
    },
  });
}));

/**
 * PUT /api/obstacles/:id/confirm
 * Confirm an obstacle (auth required)
 */
router.put('/:id/confirm', auth, validateParams(obstacleIdSchema), asyncHandler(async (req, res) => {
  // Check if obstacle exists
  const obstacleResult = await db.query(
    'SELECT id, created_by FROM obstacles WHERE id = $1 AND status = \'active\'',
    [req.params.id]
  );

  if (obstacleResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Obstacle not found or not active' },
    });
  }

  const obstacle = obstacleResult.rows[0];

  // Check if user already confirmed this obstacle
  const existingConfirmation = await db.query(
    'SELECT id FROM reports WHERE obstacle_id = $1 AND user_id = $2 AND report_type = \'confirm\'',
    [req.params.id, req.user.id]
  );

  if (existingConfirmation.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'You have already confirmed this obstacle' },
    });
  }

  // Create confirmation report
  await db.query(
    'INSERT INTO reports (obstacle_id, user_id, report_type) VALUES ($1, $2, \'confirm\')',
    [req.params.id, req.user.id]
  );

  // Increment confirmations and update confidence score
  const newConfidence = await incrementConfirmations(req.params.id);

  // Update reporter trust score (if not their own obstacle)
  if (obstacle.created_by !== req.user.id) {
    await incrementVerifiedReports(obstacle.created_by);
  }

  // Log in obstacle history
  await db.query(
    `INSERT INTO obstacle_history (obstacle_id, action, user_id, new_value)
     VALUES ($1, 'confirmed', $2, $3)`,
    [req.params.id, req.user.id, JSON.stringify({ confirmations_count: 1 })]
  );

  // Award points to user
  await db.query(
    'UPDATE users SET reputation_points = reputation_points + 10 WHERE id = $1',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'Obstacle confirmed successfully',
    data: {
      confidenceScore: newConfidence,
      pointsAwarded: 10,
    },
  });
}));

/**
 * PUT /api/obstacles/:id/dispute
 * Dispute an obstacle (auth required)
 */
router.put('/:id/dispute', auth, validateParams(obstacleIdSchema), validate(Joi.object({
  reason: Joi.string().required().max(500),
})), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  // Check if obstacle exists
  const obstacleResult = await db.query(
    'SELECT id, created_by FROM obstacles WHERE id = $1 AND status = \'active\'',
    [req.params.id]
  );

  if (obstacleResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Obstacle not found or not active' },
    });
  }

  const obstacle = obstacleResult.rows[0];

  // Check if user already disputed this obstacle
  const existingDispute = await db.query(
    'SELECT id FROM obstacle_disputes WHERE obstacle_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  if (existingDispute.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'You have already disputed this obstacle' },
    });
  }

  // Create dispute record
  await db.query(
    'INSERT INTO obstacle_disputes (obstacle_id, user_id, reason) VALUES ($1, $2, $3)',
    [req.params.id, req.user.id, reason]
  );

  // Create dispute report
  await db.query(
    'INSERT INTO reports (obstacle_id, user_id, report_type, description) VALUES ($1, $2, \'dispute\', $3)',
    [req.params.id, req.user.id, reason]
  );

  // Increment disputes and update confidence score
  const newConfidence = await incrementDisputes(req.params.id);

  // Update status to disputed if confidence is too low
  if (newConfidence < 30) {
    await db.query(
      'UPDATE obstacles SET status = \'disputed\' WHERE id = $1',
      [req.params.id]
    );
  }

  // Update reporter trust score (penalize original reporter)
  if (obstacle.created_by) {
    await incrementDisputedReports(obstacle.created_by);
  }

  // Log in obstacle history
  await db.query(
    `INSERT INTO obstacle_history (obstacle_id, action, user_id, new_value)
     VALUES ($1, 'disputed', $2, $3)`,
    [req.params.id, req.user.id, JSON.stringify({ reason })]
  );

  res.json({
    success: true,
    message: 'Obstacle disputed successfully',
    data: {
      confidenceScore: newConfidence,
    },
  });
}));

/**
 * GET /api/obstacles/clusters
 * Get clustered obstacles for map rendering
 */
router.get('/clusters', validateQuery(Joi.object({
  minLat: Joi.number().min(-90).max(90).required(),
  maxLat: Joi.number().min(-90).max(90).required(),
  minLng: Joi.number().min(-180).max(180).required(),
  maxLng: Joi.number().min(-180).max(180).required(),
  zoom: Joi.number().min(0).max(20).required(),
  minConfidence: Joi.number().min(0).max(100).default(30),
  types: Joi.array().items(Joi.string().valid('speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing')),
  severity: Joi.array().items(Joi.string().valid('low', 'medium', 'high')),
})), asyncHandler(async (req, res) => {
  const { minLat, maxLat, minLng, maxLng, zoom, minConfidence, types, severity } = req.query;

  const bounds = { minLat, maxLat, minLng, maxLng };
  const options = { minConfidence, types, severity };

  const clusters = await getClusters(bounds, zoom, options);

  res.json({
    success: true,
    data: {
      clusters,
      count: clusters.length,
    },
  });
}));

module.exports = router;
