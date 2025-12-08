const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { calculateReportPoints } = require('../../utils/pointsCalculator');

const router = express.Router();

// Validation schemas
const createReportSchema = Joi.object({
  obstacleId: Joi.string().uuid(),
  reportType: Joi.string().valid('new', 'confirm', 'fixed', 'dispute').required(),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  type: Joi.string().valid('speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing'),
  severity: Joi.string().valid('low', 'medium', 'high'),
  description: Joi.string().max(1000),
  photos: Joi.array().items(Joi.string().uri()).max(3),
  sensorData: Joi.object(),
  confidenceScore: Joi.number().min(0).max(1),
});

const reportIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const userIdSchema = Joi.object({
  userId: Joi.string().uuid().required(),
});

/**
 * POST /api/reports
 * Submit obstacle report (auth required)
 */
router.post('/', auth, validate(createReportSchema), asyncHandler(async (req, res) => {
  const { 
    obstacleId, reportType, lat, lng, type, severity, 
    description, photos, sensorData, confidenceScore 
  } = req.body;

  let finalObstacleId = obstacleId;

  // If it's a new report without obstacleId, create the obstacle first
  if (reportType === 'new' && !obstacleId) {
    if (!lat || !lng || !type || !severity) {
      return res.status(400).json({
        success: false,
        error: { message: 'lat, lng, type, and severity are required for new obstacle reports' },
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
      // Update report type to 'confirm' and use existing obstacle
      finalObstacleId = duplicateCheck.rows[0].id;
    } else {
      // Create new obstacle
      const obstacleResult = await db.query(
        `INSERT INTO obstacles (type, location, severity, created_by, status)
         VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5, 'active')
         RETURNING id`,
        [type, lng, lat, severity, req.user.id]
      );

      finalObstacleId = obstacleResult.rows[0].id;
    }
  }

  // Create report
  const reportResult = await db.query(
    `INSERT INTO reports (obstacle_id, user_id, report_type, severity, description, photos, sensor_data, confidence_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, obstacle_id, report_type, severity, created_at`,
    [
      finalObstacleId,
      req.user.id,
      reportType,
      severity || null,
      description || null,
      photos || [],
      sensorData ? JSON.stringify(sensorData) : null,
      confidenceScore || null,
    ]
  );

  const report = reportResult.rows[0];

  // Award points
  const hasPhotos = photos && photos.length > 0;
  const pointsAwarded = calculateReportPoints(reportType, hasPhotos);

  await db.query(
    'UPDATE users SET reputation_points = reputation_points + $1 WHERE id = $2',
    [pointsAwarded, req.user.id]
  );

  // Update obstacle verification status if confirmations
  if (reportType === 'confirm') {
    await db.query(
      `UPDATE obstacles 
       SET verification_count = verification_count + 1,
           last_verified_at = NOW(),
           verified = CASE WHEN verification_count + 1 >= 3 THEN true ELSE verified END
       WHERE id = $1`,
      [finalObstacleId]
    );
  }

  // Update obstacle status if fixed
  if (reportType === 'fixed') {
    const fixedReportsCount = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE obstacle_id = $1 AND report_type = 'fixed'`,
      [finalObstacleId]
    );

    // If 2+ users report as fixed, mark obstacle as fixed
    if (parseInt(fixedReportsCount.rows[0].count) >= 2) {
      await db.query(
        `UPDATE obstacles SET status = 'fixed' WHERE id = $1`,
        [finalObstacleId]
      );
    }
  }

  // Update obstacle status if disputed
  if (reportType === 'dispute') {
    await db.query(
      `UPDATE obstacles SET status = 'disputed' WHERE id = $1`,
      [finalObstacleId]
    );
  }

  res.status(201).json({
    success: true,
    data: {
      report: {
        id: report.id,
        obstacleId: report.obstacle_id,
        reportType: report.report_type,
        severity: report.severity,
        createdAt: report.created_at,
      },
      pointsAwarded,
    },
  });
}));

/**
 * GET /api/reports/user/:userId
 * Get user's reports
 */
router.get('/user/:userId', validateParams(userIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT 
      r.id, r.obstacle_id, r.report_type, r.severity, r.description,
      r.photos, r.confidence_score, r.created_at,
      o.type as obstacle_type,
      ST_Y(o.location::geometry) as lat,
      ST_X(o.location::geometry) as lng,
      o.status as obstacle_status
    FROM reports r
    LEFT JOIN obstacles o ON r.obstacle_id = o.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
    LIMIT 100`,
    [req.params.userId]
  );

  const reports = result.rows.map(row => ({
    id: row.id,
    obstacleId: row.obstacle_id,
    reportType: row.report_type,
    severity: row.severity,
    description: row.description,
    photos: row.photos,
    confidenceScore: row.confidence_score,
    createdAt: row.created_at,
    obstacle: row.obstacle_id ? {
      type: row.obstacle_type,
      location: {
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
      },
      status: row.obstacle_status,
    } : null,
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
 * PUT /api/reports/:id
 * Update report (own reports only)
 */
router.put('/:id', auth, validateParams(reportIdSchema), asyncHandler(async (req, res) => {
  // Check if user owns this report
  const reportCheck = await db.query(
    'SELECT user_id FROM reports WHERE id = $1',
    [req.params.id]
  );

  if (reportCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Report not found' },
    });
  }

  if (reportCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to update this report' },
    });
  }

  const { description, photos } = req.body;
  
  await db.query(
    `UPDATE reports SET description = COALESCE($1, description), photos = COALESCE($2, photos)
     WHERE id = $3`,
    [description, photos, req.params.id]
  );

  res.json({
    success: true,
    message: 'Report updated successfully',
  });
}));

/**
 * DELETE /api/reports/:id
 * Delete report (own reports only)
 */
router.delete('/:id', auth, validateParams(reportIdSchema), asyncHandler(async (req, res) => {
  // Check if user owns this report
  const reportCheck = await db.query(
    'SELECT user_id FROM reports WHERE id = $1',
    [req.params.id]
  );

  if (reportCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Report not found' },
    });
  }

  if (reportCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to delete this report' },
    });
  }

  await db.query('DELETE FROM reports WHERE id = $1', [req.params.id]);

  res.json({
    success: true,
    message: 'Report deleted successfully',
  });
}));

module.exports = router;
