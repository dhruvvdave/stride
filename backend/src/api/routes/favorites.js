const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const createFavoriteSchema = Joi.object({
  placeName: Joi.string().min(1).max(255).required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  address: Joi.string().max(500),
});

const updateFavoriteSchema = Joi.object({
  placeName: Joi.string().min(1).max(255),
  address: Joi.string().max(500),
});

const favoriteIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

/**
 * GET /api/favorites
 * Get user's favorite places (auth required)
 */
router.get('/', auth, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT 
      id, place_name,
      ST_Y(location::geometry) as lat,
      ST_X(location::geometry) as lng,
      address, created_at
    FROM favorites
    WHERE user_id = $1
    ORDER BY created_at DESC`,
    [req.user.id]
  );

  const favorites = result.rows.map(row => ({
    id: row.id,
    placeName: row.place_name,
    location: {
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
    },
    address: row.address,
    createdAt: row.created_at,
  }));

  res.json({
    success: true,
    data: {
      favorites,
      count: favorites.length,
    },
  });
}));

/**
 * POST /api/favorites
 * Add favorite place
 */
router.post('/', auth, validate(createFavoriteSchema), asyncHandler(async (req, res) => {
  const { placeName, lat, lng, address } = req.body;

  // Check for duplicate place name
  const duplicateCheck = await db.query(
    'SELECT id FROM favorites WHERE user_id = $1 AND LOWER(place_name) = LOWER($2)',
    [req.user.id, placeName]
  );

  if (duplicateCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'A favorite with this name already exists' },
    });
  }

  // Check favorite limit (max 20)
  const countResult = await db.query(
    'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
    [req.user.id]
  );

  if (parseInt(countResult.rows[0].count) >= 20) {
    return res.status(400).json({
      success: false,
      error: { message: 'Maximum 20 favorites allowed' },
    });
  }

  const result = await db.query(
    `INSERT INTO favorites (user_id, place_name, location, address)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5)
     RETURNING id, place_name, address, created_at`,
    [req.user.id, placeName, lng, lat, address || null]
  );

  const favorite = result.rows[0];

  res.status(201).json({
    success: true,
    data: {
      favorite: {
        id: favorite.id,
        placeName: favorite.place_name,
        location: { lat, lng },
        address: favorite.address,
        createdAt: favorite.created_at,
      },
    },
  });
}));

/**
 * PUT /api/favorites/:id
 * Update favorite
 */
router.put('/:id', auth, validateParams(favoriteIdSchema), validate(updateFavoriteSchema), asyncHandler(async (req, res) => {
  // Check if user owns this favorite
  const favoriteCheck = await db.query(
    'SELECT user_id FROM favorites WHERE id = $1',
    [req.params.id]
  );

  if (favoriteCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Favorite not found' },
    });
  }

  if (favoriteCheck.rows[0].user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to update this favorite' },
    });
  }

  const { placeName, address } = req.body;
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (placeName) {
    updates.push(`place_name = $${paramCount++}`);
    values.push(placeName);
  }

  if (address !== undefined) {
    updates.push(`address = $${paramCount++}`);
    values.push(address);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'No fields to update' },
    });
  }

  values.push(req.params.id);

  await db.query(
    `UPDATE favorites SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );

  res.json({
    success: true,
    message: 'Favorite updated successfully',
  });
}));

/**
 * DELETE /api/favorites/:id
 * Delete favorite
 */
router.delete('/:id', auth, validateParams(favoriteIdSchema), asyncHandler(async (req, res) => {
  // Check if user owns this favorite
  const favoriteCheck = await db.query(
    'SELECT user_id FROM favorites WHERE id = $1',
    [req.params.id]
  );

  if (favoriteCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Favorite not found' },
    });
  }

  if (favoriteCheck.rows[0].user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not authorized to delete this favorite' },
    });
  }

  await db.query('DELETE FROM favorites WHERE id = $1', [req.params.id]);

  res.json({
    success: true,
    message: 'Favorite deleted successfully',
  });
}));

module.exports = router;
