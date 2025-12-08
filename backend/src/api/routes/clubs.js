const express = require('express');
const Joi = require('joi');
const db = require('../../config/database');
const { auth } = require('../middleware/auth');
const { requirePremium } = require('../middleware/premium');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const createClubSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000),
  avatarUrl: Joi.string().uri(),
  isPrivate: Joi.boolean().default(false),
});

const updateClubSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  description: Joi.string().max(1000),
  avatarUrl: Joi.string().uri(),
  isPrivate: Joi.boolean(),
});

const clubIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const clubsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().max(100),
});

/**
 * GET /api/clubs
 * Get all public clubs (paginated)
 */
router.get('/', validateQuery(clubsQuerySchema), asyncHandler(async (req, res) => {
  const { limit, offset, search } = req.query;

  let query = `
    SELECT c.id, c.name, c.description, c.avatar_url, c.is_private, 
           c.member_count, c.created_at,
           u.name as owner_name, u.avatar_url as owner_avatar
    FROM car_clubs c
    JOIN users u ON c.owner_id = u.id
    WHERE c.is_private = false
  `;

  const params = [];
  let paramCount = 1;

  if (search) {
    query += ` AND c.name ILIKE $${paramCount}`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY c.member_count DESC, c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  const countQuery = search
    ? 'SELECT COUNT(*) as total FROM car_clubs WHERE is_private = false AND name ILIKE $1'
    : 'SELECT COUNT(*) as total FROM car_clubs WHERE is_private = false';
  
  const countParams = search ? [`%${search}%`] : [];
  const countResult = await db.query(countQuery, countParams);

  const clubs = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    avatarUrl: row.avatar_url,
    isPrivate: row.is_private,
    memberCount: row.member_count,
    createdAt: row.created_at,
    owner: {
      name: row.owner_name,
      avatarUrl: row.owner_avatar,
    },
  }));

  res.json({
    success: true,
    data: {
      clubs,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    },
  });
}));

/**
 * GET /api/clubs/:id
 * Get club details
 */
router.get('/:id', validateParams(clubIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT c.id, c.name, c.description, c.avatar_url, c.is_private,
            c.member_count, c.created_at,
            u.id as owner_id, u.name as owner_name, u.avatar_url as owner_avatar
     FROM car_clubs c
     JOIN users u ON c.owner_id = u.id
     WHERE c.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Club not found' },
    });
  }

  const row = result.rows[0];
  const club = {
    id: row.id,
    name: row.name,
    description: row.description,
    avatarUrl: row.avatar_url,
    isPrivate: row.is_private,
    memberCount: row.member_count,
    createdAt: row.created_at,
    owner: {
      id: row.owner_id,
      name: row.owner_name,
      avatarUrl: row.owner_avatar,
    },
  };

  res.json({
    success: true,
    data: { club },
  });
}));

/**
 * POST /api/clubs
 * Create club (auth + premium required)
 */
router.post('/', auth, requirePremium, validate(createClubSchema), asyncHandler(async (req, res) => {
  const { name, description, avatarUrl, isPrivate } = req.body;

  // Check if club name already exists
  const duplicateCheck = await db.query(
    'SELECT id FROM car_clubs WHERE LOWER(name) = LOWER($1)',
    [name]
  );

  if (duplicateCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'A club with this name already exists' },
    });
  }

  // Check club ownership limit (max 3 clubs as owner)
  const ownershipCount = await db.query(
    'SELECT COUNT(*) as count FROM car_clubs WHERE owner_id = $1',
    [req.user.id]
  );

  if (parseInt(ownershipCount.rows[0].count) >= 3) {
    return res.status(400).json({
      success: false,
      error: { message: 'Maximum 3 clubs allowed per user as owner' },
    });
  }

  // Create club
  const clubResult = await db.query(
    `INSERT INTO car_clubs (name, description, avatar_url, owner_id, is_private)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, avatar_url, is_private, member_count, created_at`,
    [name, description || null, avatarUrl || null, req.user.id, isPrivate]
  );

  const club = clubResult.rows[0];

  // Add owner as member
  await db.query(
    `INSERT INTO club_members (club_id, user_id, role)
     VALUES ($1, $2, 'owner')`,
    [club.id, req.user.id]
  );

  res.status(201).json({
    success: true,
    data: {
      club: {
        id: club.id,
        name: club.name,
        description: club.description,
        avatarUrl: club.avatar_url,
        isPrivate: club.is_private,
        memberCount: club.member_count,
        createdAt: club.created_at,
      },
    },
  });
}));

/**
 * PUT /api/clubs/:id
 * Update club (owner/admin only)
 */
router.put('/:id', auth, requirePremium, validateParams(clubIdSchema), validate(updateClubSchema), asyncHandler(async (req, res) => {
  // Check if user is owner or admin
  const memberCheck = await db.query(
    `SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );

  if (memberCheck.rows.length === 0) {
    return res.status(403).json({
      success: false,
      error: { message: 'Not a member of this club' },
    });
  }

  const userRole = memberCheck.rows[0].role;
  if (userRole !== 'owner' && userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Only club owners and admins can update club details' },
    });
  }

  const { name, description, avatarUrl, isPrivate } = req.body;
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }

  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description);
  }

  if (avatarUrl !== undefined) {
    updates.push(`avatar_url = $${paramCount++}`);
    values.push(avatarUrl);
  }

  if (isPrivate !== undefined) {
    updates.push(`is_private = $${paramCount++}`);
    values.push(isPrivate);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'No fields to update' },
    });
  }

  values.push(req.params.id);

  await db.query(
    `UPDATE car_clubs SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );

  res.json({
    success: true,
    message: 'Club updated successfully',
  });
}));

/**
 * DELETE /api/clubs/:id
 * Delete club (owner only)
 */
router.delete('/:id', auth, requirePremium, validateParams(clubIdSchema), asyncHandler(async (req, res) => {
  // Check if user is owner
  const clubCheck = await db.query(
    'SELECT owner_id FROM car_clubs WHERE id = $1',
    [req.params.id]
  );

  if (clubCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Club not found' },
    });
  }

  if (clubCheck.rows[0].owner_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { message: 'Only club owner can delete the club' },
    });
  }

  await db.query('DELETE FROM car_clubs WHERE id = $1', [req.params.id]);

  res.json({
    success: true,
    message: 'Club deleted successfully',
  });
}));

/**
 * POST /api/clubs/:id/join
 * Join club
 */
router.post('/:id/join', auth, requirePremium, validateParams(clubIdSchema), asyncHandler(async (req, res) => {
  // Check if club exists
  const clubCheck = await db.query(
    'SELECT is_private FROM car_clubs WHERE id = $1',
    [req.params.id]
  );

  if (clubCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { message: 'Club not found' },
    });
  }

  // Check if already a member
  const memberCheck = await db.query(
    'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  if (memberCheck.rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Already a member of this club' },
    });
  }

  // Add member
  await db.query(
    `INSERT INTO club_members (club_id, user_id, role)
     VALUES ($1, $2, 'member')`,
    [req.params.id, req.user.id]
  );

  // Update member count
  await db.query(
    'UPDATE car_clubs SET member_count = member_count + 1 WHERE id = $1',
    [req.params.id]
  );

  res.status(201).json({
    success: true,
    message: 'Joined club successfully',
  });
}));

/**
 * POST /api/clubs/:id/leave
 * Leave club
 */
router.post('/:id/leave', auth, requirePremium, validateParams(clubIdSchema), asyncHandler(async (req, res) => {
  // Check if member
  const memberCheck = await db.query(
    'SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  if (memberCheck.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Not a member of this club' },
    });
  }

  // Owners cannot leave their own club
  if (memberCheck.rows[0].role === 'owner') {
    return res.status(400).json({
      success: false,
      error: { message: 'Club owner cannot leave. Delete the club instead.' },
    });
  }

  // Remove member
  await db.query(
    'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );

  // Update member count
  await db.query(
    'UPDATE car_clubs SET member_count = member_count - 1 WHERE id = $1',
    [req.params.id]
  );

  res.json({
    success: true,
    message: 'Left club successfully',
  });
}));

/**
 * GET /api/clubs/:id/members
 * Get club members
 */
router.get('/:id/members', validateParams(clubIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT 
      cm.id, cm.role, cm.joined_at,
      u.id as user_id, u.name, u.avatar_url, u.reputation_points
    FROM club_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.club_id = $1
    ORDER BY 
      CASE cm.role 
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        ELSE 3
      END,
      cm.joined_at ASC`,
    [req.params.id]
  );

  const members = result.rows.map(row => ({
    id: row.id,
    role: row.role,
    joinedAt: row.joined_at,
    user: {
      id: row.user_id,
      name: row.name,
      avatarUrl: row.avatar_url,
      reputationPoints: row.reputation_points,
    },
  }));

  res.json({
    success: true,
    data: {
      members,
      count: members.length,
    },
  });
}));

module.exports = router;
