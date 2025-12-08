const express = require('express');
const Joi = require('joi');
const axios = require('axios');
const db = require('../../config/database');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { calculateRoutePoints } = require('../../utils/pointsCalculator');
const { scoreRoute, calculateDetourMetrics } = require('../../utils/routeOptimizer');

const router = express.Router();

// Validation schemas
const planRouteSchema = Joi.object({
  origin: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  destination: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  vehicleId: Joi.string().uuid(),
});

const saveRouteSchema = Joi.object({
  origin: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  destination: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  geometry: Joi.array().items(Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  })).required(),
  routeType: Joi.string().valid('smooth', 'standard', 'fastest').required(),
  distanceMeters: Joi.number().min(0).required(),
  durationSeconds: Joi.number().min(0).required(),
  obstacleCount: Joi.number().min(0).required(),
  smoothnessScore: Joi.number().min(0).max(100).required(),
  detourMeters: Joi.number().min(0).default(0),
});

const historyQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

/**
 * POST /api/routes/plan
 * Calculate routes with obstacle avoidance
 */
router.post('/plan', optionalAuth, validate(planRouteSchema), asyncHandler(async (req, res) => {
  const { origin, destination, vehicleId } = req.body;

  // Get vehicle info if provided
  let vehicle = null;
  if (vehicleId && req.user) {
    const vehicleResult = await db.query(
      'SELECT * FROM vehicles WHERE id = $1 AND user_id = $2',
      [vehicleId, req.user.id]
    );
    
    if (vehicleResult.rows.length > 0) {
      vehicle = vehicleResult.rows[0];
    }
  }

  // Call OSRM for base route
  const osrmUrl = process.env.OSRM_API_URL || 'http://router.project-osrm.org';
  const osrmResponse = await axios.get(
    `${osrmUrl}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
    {
      params: {
        overview: 'full',
        geometries: 'geojson',
        alternatives: 3,
      },
    }
  );

  if (osrmResponse.data.code !== 'Ok' || !osrmResponse.data.routes.length) {
    return res.status(400).json({
      success: false,
      error: { message: 'Could not calculate route' },
    });
  }

  const baseRoute = osrmResponse.data.routes[0];
  const routeCoordinates = baseRoute.geometry.coordinates;

  // Create bounding box around route with 100m buffer
  const lats = routeCoordinates.map(c => c[1]);
  const lngs = routeCoordinates.map(c => c[0]);
  const minLat = Math.min(...lats) - 0.001;
  const maxLat = Math.max(...lats) + 0.001;
  const minLng = Math.min(...lngs) - 0.001;
  const maxLng = Math.max(...lngs) + 0.001;

  // Query obstacles along route
  const obstaclesResult = await db.query(
    `SELECT 
      id, type, severity,
      ST_Y(location::geometry) as lat,
      ST_X(location::geometry) as lng
    FROM obstacles
    WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
      AND status = 'active'
      AND ST_DWithin(
        location,
        ST_GeomFromGeoJSON($5)::geography,
        100
      )`,
    [minLng, minLat, maxLng, maxLat, JSON.stringify(baseRoute.geometry)]
  );

  const obstacles = obstaclesResult.rows.map(row => ({
    id: row.id,
    type: row.type,
    severity: row.severity,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
  }));

  // Generate route alternatives
  const routes = osrmResponse.data.routes.slice(0, 3).map((route, index) => {
    const routeObstacles = obstacles.filter(obs => {
      // Simple check - in production, use proper point-to-line distance
      return true; // Include all obstacles for now
    });

    // Filter obstacles based on route type
    let filteredObstacles;
    let routeType;

    if (index === 0) {
      // Smooth route - avoid all obstacles
      filteredObstacles = routeObstacles;
      routeType = 'smooth';
    } else if (index === 1) {
      // Standard route - avoid high severity only
      filteredObstacles = routeObstacles.filter(o => o.severity === 'high');
      routeType = 'standard';
    } else {
      // Fastest route - ignore obstacles
      filteredObstacles = [];
      routeType = 'fastest';
    }

    // Apply vehicle-based filtering
    if (vehicle && vehicle.ground_clearance_inches >= 6) {
      // High clearance - filter out low severity
      filteredObstacles = filteredObstacles.filter(o => o.severity !== 'low');
    }

    const scoring = scoreRoute(filteredObstacles, vehicle);
    const detour = calculateDetourMetrics(baseRoute.distance, route.distance);

    return {
      type: routeType,
      geometry: route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })),
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      smoothnessScore: scoring.smoothnessScore,
      obstacleCount: scoring.obstacleCount,
      obstacles: filteredObstacles,
      detourMeters: detour.detourMeters,
      detourPercentage: detour.detourPercentage,
    };
  });

  res.json({
    success: true,
    data: {
      routes,
      vehicleProfile: vehicle ? {
        name: vehicle.name,
        type: vehicle.vehicle_type,
        groundClearance: vehicle.ground_clearance_inches,
      } : null,
    },
  });
}));

/**
 * POST /api/routes/save
 * Save completed route to history (auth required)
 */
router.post('/save', auth, validate(saveRouteSchema), asyncHandler(async (req, res) => {
  const {
    origin, destination, geometry, routeType,
    distanceMeters, durationSeconds, obstacleCount,
    smoothnessScore, detourMeters,
  } = req.body;

  // Convert geometry to LineString format
  const lineString = geometry.map(p => `${p.lng} ${p.lat}`).join(', ');

  const result = await db.query(
    `INSERT INTO routes (
      user_id, origin, destination, geometry, route_type,
      distance_meters, duration_seconds, obstacle_count,
      smoothness_score, detour_meters
    ) VALUES (
      $1,
      ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
      ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography,
      ST_GeomFromText('LINESTRING(' || $6 || ')', 4326)::geography,
      $7, $8, $9, $10, $11, $12
    )
    RETURNING id, created_at`,
    [
      req.user.id,
      origin.lng, origin.lat,
      destination.lng, destination.lat,
      lineString,
      routeType,
      distanceMeters,
      durationSeconds,
      obstacleCount,
      smoothnessScore,
      detourMeters,
    ]
  );

  const route = result.rows[0];

  // Award points for route completion
  const pointsAwarded = calculateRoutePoints(distanceMeters);
  await db.query(
    'UPDATE users SET reputation_points = reputation_points + $1 WHERE id = $2',
    [pointsAwarded, req.user.id]
  );

  res.status(201).json({
    success: true,
    data: {
      routeId: route.id,
      createdAt: route.created_at,
      pointsAwarded,
    },
  });
}));

/**
 * GET /api/routes/history
 * Get user's route history (auth required, paginated)
 */
router.get('/history', auth, validateQuery(historyQuerySchema), asyncHandler(async (req, res) => {
  const { limit, offset } = req.query;

  const result = await db.query(
    `SELECT 
      id, route_type,
      ST_Y(origin::geometry) as origin_lat,
      ST_X(origin::geometry) as origin_lng,
      ST_Y(destination::geometry) as dest_lat,
      ST_X(destination::geometry) as dest_lng,
      distance_meters, duration_seconds, obstacle_count,
      smoothness_score, detour_meters, created_at
    FROM routes
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  );

  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM routes WHERE user_id = $1',
    [req.user.id]
  );

  const routes = result.rows.map(row => ({
    id: row.id,
    routeType: row.route_type,
    origin: {
      lat: parseFloat(row.origin_lat),
      lng: parseFloat(row.origin_lng),
    },
    destination: {
      lat: parseFloat(row.dest_lat),
      lng: parseFloat(row.dest_lng),
    },
    distanceMeters: row.distance_meters,
    durationSeconds: row.duration_seconds,
    obstacleCount: row.obstacle_count,
    smoothnessScore: row.smoothness_score,
    detourMeters: row.detour_meters,
    createdAt: row.created_at,
  }));

  res.json({
    success: true,
    data: {
      routes,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    },
  });
}));

module.exports = router;
