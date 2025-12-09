/**
 * Cluster Service
 * Handles server-side obstacle clustering for efficient map rendering
 * Uses geohash-based spatial indexing
 */

const db = require('../config/database');
const { getRedisClient } = require('../config/redis');
const geohash = require('./geohashService');

// Cache TTL for cluster data (5 minutes)
const CLUSTER_CACHE_TTL = 300;

/**
 * Get clustered obstacles for a map viewport
 * @param {Object} bounds - Bounding box {minLat, maxLat, minLng, maxLng}
 * @param {number} zoom - Map zoom level
 * @param {Object} options - Additional options (minConfidence, types, etc.)
 * @returns {Promise<Array>} Array of clusters
 */
async function getClusters(bounds, zoom, options = {}) {
  const { minConfidence = 30, types = null, severity = null } = options;

  try {
    // Get geohash precision based on zoom
    const precision = geohash.getPrecisionForZoom(zoom);

    // Build cache key
    const cacheKey = `clusters:${precision}:${bounds.minLat}:${bounds.maxLat}:${bounds.minLng}:${bounds.maxLng}:${minConfidence}`;

    // Check Redis cache
    const redis = await getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('Redis cache read error:', err);
      }
    }

    // Build query
    let query = `
      SELECT 
        o.geohash,
        COUNT(*) as obstacle_count,
        AVG(ST_Y(o.location::geometry)) as center_lat,
        AVG(ST_X(o.location::geometry)) as center_lng,
        AVG(o.confidence_score) as avg_confidence,
        MAX(o.severity) as max_severity,
        json_agg(
          DISTINCT o.type
        ) as types
      FROM obstacles o
      WHERE o.location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        AND o.status = 'active'
        AND o.confidence_score >= $5
        AND SUBSTRING(o.geohash, 1, $6) IS NOT NULL
    `;

    const params = [bounds.minLng, bounds.minLat, bounds.maxLng, bounds.maxLat, minConfidence, precision];
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

    query += `
      GROUP BY SUBSTRING(o.geohash, 1, $6)
      ORDER BY obstacle_count DESC
    `;

    const result = await db.query(query, params);

    // Format clusters
    const clusters = result.rows.map(row => ({
      geohash: row.geohash,
      count: parseInt(row.obstacle_count),
      location: {
        lat: parseFloat(row.center_lat),
        lng: parseFloat(row.center_lng),
      },
      avgConfidence: Math.round(parseFloat(row.avg_confidence)),
      maxSeverity: row.max_severity,
      types: row.types,
      // For single obstacles, we can show them individually
      isSingle: parseInt(row.obstacle_count) === 1,
    }));

    // Cache the results
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(clusters), {
          EX: CLUSTER_CACHE_TTL,
        });
      } catch (err) {
        console.warn('Redis cache write error:', err);
      }
    }

    return clusters;
  } catch (error) {
    console.error('Error getting clusters:', error);
    throw error;
  }
}

/**
 * Get individual obstacles within a cluster
 * @param {string} geohashPrefix - Geohash prefix for the cluster
 * @param {Object} options - Additional options (minConfidence, types, etc.)
 * @returns {Promise<Array>} Array of obstacles
 */
async function getObstaclesInCluster(geohashPrefix, options = {}) {
  const { minConfidence = 30, types = null, severity = null } = options;

  try {
    let query = `
      SELECT 
        o.id, o.type,
        ST_Y(o.location::geometry) as lat,
        ST_X(o.location::geometry) as lng,
        o.severity, o.confidence_score, o.status,
        o.confirmations_count, o.disputes_count,
        o.created_at, o.last_confirmed_at
      FROM obstacles o
      WHERE o.geohash LIKE $1
        AND o.status = 'active'
        AND o.confidence_score >= $2
    `;

    const params = [`${geohashPrefix}%`, minConfidence];
    let paramCount = 3;

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

    query += ' ORDER BY o.confidence_score DESC, o.created_at DESC LIMIT 100';

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      location: {
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
      },
      severity: row.severity,
      confidenceScore: row.confidence_score,
      status: row.status,
      confirmationsCount: row.confirmations_count,
      disputesCount: row.disputes_count,
      createdAt: row.created_at,
      lastConfirmedAt: row.last_confirmed_at,
    }));
  } catch (error) {
    console.error('Error getting obstacles in cluster:', error);
    throw error;
  }
}

/**
 * Invalidate cluster cache for a bounding box
 * Called when obstacles are added/updated/deleted
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<void>}
 */
async function invalidateCache(lat, lng) {
  try {
    const redis = await getRedisClient();
    if (redis) {
      // Get all cache keys that might contain this location
      // For simplicity, we invalidate based on geohash prefix
      const hash = geohash.encode(lat, lng, 6);
      const pattern = `clusters:*:*${hash}*`;
      
      // Note: In production, consider using a more efficient invalidation strategy
      // This is a simplified version
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  } catch (error) {
    console.error('Error invalidating cluster cache:', error);
    // Don't throw - cache invalidation failure shouldn't break the operation
  }
}

module.exports = {
  getClusters,
  getObstaclesInCluster,
  invalidateCache,
};
