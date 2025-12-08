const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { requirePremium } = require('../middleware/premium');
const { validate, validateParams } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const createVehicleSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  vehicleType: Joi.string().valid('sports_car', 'sedan', 'suv', 'truck', 'classic', 'exotic').required(),
  suspensionType: Joi.string().valid('stock', 'lowered_springs', 'coilovers', 'air_suspension').required(),
  groundClearanceInches: Joi.number().min(0.5).max(20).required(),
});

const updateVehicleSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  vehicleType: Joi.string().valid('sports_car', 'sedan', 'suv', 'truck', 'classic', 'exotic'),
  suspensionType: Joi.string().valid('stock', 'lowered_springs', 'coilovers', 'air_suspension'),
  groundClearanceInches: Joi.number().min(0.5).max(20),
});

const vehicleIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

/**
 * GET /api/vehicles
 * Get user's vehicles (auth + premium required)
 */
router.get('/', auth, requirePremium, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, name, vehicle_type, suspension_type, ground_clearance_inches, 
            is_active, created_at, updated_at
     FROM vehicles
     WHERE user_id = $1
     ORDER BY is_active DESC, created_at DESC`,
    [req.user.id]
  );

  const vehicles = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    vehicleType: row.vehicle_type,
    suspensionType: row.suspension_type,
    groundClearanceInches: row.ground_clearance_inches,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  res.json({
    success: true,
    data: {
      vehicles,
      count: vehicles.length,
    },
  });
}));

/**
 * POST /api/vehicles
 * Add vehicle (auth + premium required)
 */
router.post('/', auth, requirePremium, validate(createVehicleSchema), asyncHandler(async (req, res) => {
  const { name, vehicleType, suspensionType, groundClearanceInches } = req.body;

  // Check vehicle limit (max 5 vehicles)
  const countResult = await db.query(
    'SELECT COUNT(*) as count FROM vehicles WHERE user_id = $1',
    [req.user.id]
  );

  if (parseInt(countResult.rows[0].count) >= 5) {
    return res.status(400).json({
      success: false,
      error: { message: 'Maximum 5 vehicles allowed per user' },
    });
  }

  const result = await db.query(
    `INSERT INTO vehicles (user_id, name, vehicle_type, suspension_type, ground_clearance_inches)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, vehicle_type, suspension_type, ground_clearance_inches, is_active, created_at`,
    [req.user.id, name, vehicleType, suspensionType, groundClearanceInches]
  );

  const vehicle = result.rows[0];

  res.status(201).json({
    success: true,
    data: {
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        vehicleType: vehicle.vehicle_type,
        suspensionType: vehicle.suspension_type,
        groundClearanceInches: vehicle.ground_clearance_inches,
        isActive: vehicle.is_active,
        createdAt: vehicle.created_at,
      },
    },
  });
}));

/**
 * PUT /api/vehicles/:id
 * Update vehicle
 */
router.put('/:id', auth, requirePremium, validateParams(vehicleIdSchema), validate(updateVehicleSchema), asyncHandler(async (req, res) => {
  // Check if user owns this vehicle
  const vehicleCheck = await db.query(
    'SELECT user_id FROM vehicles WHERE id = $1',
    [req.params.id]
  );

  if (vehicleCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Vehicle not found' },
    });
  }

  if (vehicleCheck.rows[0].user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to update this vehicle' },
    });
  }

  const { name, vehicleType, suspensionType, groundClearanceInches } = req.body;
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }

  if (vehicleType) {
    updates.push(`vehicle_type = $${paramCount++}`);
    values.push(vehicleType);
  }

  if (suspensionType) {
    updates.push(`suspension_type = $${paramCount++}`);
    values.push(suspensionType);
  }

  if (groundClearanceInches !== undefined) {
    updates.push(`ground_clearance_inches = $${paramCount++}`);
    values.push(groundClearanceInches);
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
    `UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );

  res.json({
    success: true,
    message: 'Vehicle updated successfully',
  });
}));

/**
 * DELETE /api/vehicles/:id
 * Delete vehicle
 */
router.delete('/:id', auth, requirePremium, validateParams(vehicleIdSchema), asyncHandler(async (req, res) => {
  // Check if user owns this vehicle
  const vehicleCheck = await db.query(
    'SELECT user_id FROM vehicles WHERE id = $1',
    [req.params.id]
  );

  if (vehicleCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Vehicle not found' },
    });
  }

  if (vehicleCheck.rows[0].user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to delete this vehicle' },
    });
  }

  await db.query('DELETE FROM vehicles WHERE id = $1', [req.params.id]);

  res.json({
    success: true,
    message: 'Vehicle deleted successfully',
  });
}));

/**
 * PUT /api/vehicles/:id/activate
 * Set as active vehicle
 */
router.put('/:id/activate', auth, requirePremium, validateParams(vehicleIdSchema), asyncHandler(async (req, res) => {
  // Check if user owns this vehicle
  const vehicleCheck = await db.query(
    'SELECT user_id FROM vehicles WHERE id = $1',
    [req.params.id]
  );

  if (vehicleCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Vehicle not found' },
    });
  }

  if (vehicleCheck.rows[0].user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to activate this vehicle' },
    });
  }

  // Deactivate all user's vehicles first
  await db.query(
    'UPDATE vehicles SET is_active = false WHERE user_id = $1',
    [req.user.id]
  );

  // Activate this vehicle
  await db.query(
    'UPDATE vehicles SET is_active = true WHERE id = $1',
    [req.params.id]
  );

  res.json({
    success: true,
    message: 'Vehicle activated successfully',
  });
}));

module.exports = router;
