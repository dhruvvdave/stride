/**
 * Obstacle Decay Service
 * Handles time-based confidence decay for obstacles
 */

const db = require('../config/database');
const { updateConfidenceScore } = require('./confidenceScore');

// Constants
const EXPIRATION_DAYS = 180; // 6 months
const DECAY_CHECK_INTERVAL_DAYS = 30; // Check monthly

/**
 * Apply time-based decay to obstacle confidence scores
 * Confidence drops over time if not confirmed
 * 
 * Decay rate: -5 points per 30 days without confirmation
 * 
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<number>} Updated confidence score
 */
async function applyDecay(obstacleId) {
  try {
    const result = await db.query(
      'SELECT last_confirmed_at, created_at FROM obstacles WHERE id = $1',
      [obstacleId]
    );

    if (result.rows.length === 0) {
      throw new Error('Obstacle not found');
    }

    const obstacle = result.rows[0];
    const lastConfirmed = obstacle.last_confirmed_at || obstacle.created_at;
    const daysSinceConfirmed = Math.floor(
      (Date.now() - new Date(lastConfirmed).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Update confidence score (decay is already calculated in confidenceScore service)
    const newScore = await updateConfidenceScore(obstacleId);

    return newScore;
  } catch (error) {
    console.error('Error applying decay to obstacle:', error);
    throw error;
  }
}

/**
 * Check if obstacle should be expired (180 days without confirmation)
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<boolean>} True if should be expired
 */
async function shouldExpire(obstacleId) {
  try {
    const result = await db.query(
      'SELECT last_confirmed_at, created_at FROM obstacles WHERE id = $1',
      [obstacleId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const obstacle = result.rows[0];
    const lastConfirmed = obstacle.last_confirmed_at || obstacle.created_at;
    const daysSinceConfirmed = Math.floor(
      (Date.now() - new Date(lastConfirmed).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceConfirmed >= EXPIRATION_DAYS;
  } catch (error) {
    console.error('Error checking expiration:', error);
    return false;
  }
}

/**
 * Expire obstacle by marking as fixed
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<void>}
 */
async function expireObstacle(obstacleId) {
  try {
    await db.query(
      `UPDATE obstacles 
       SET status = 'fixed', 
           updated_at = NOW() 
       WHERE id = $1`,
      [obstacleId]
    );

    // Log in obstacle history
    await db.query(
      `INSERT INTO obstacle_history (obstacle_id, action, old_value, new_value)
       VALUES ($1, 'auto_expired', '{"status": "active"}', '{"status": "fixed"}')`,
      [obstacleId]
    );
  } catch (error) {
    console.error('Error expiring obstacle:', error);
    throw error;
  }
}

/**
 * Process all obstacles for decay and expiration
 * This is called by the background job
 * @returns {Promise<Object>} Processing statistics
 */
async function processAllObstacles() {
  const stats = {
    processed: 0,
    decayed: 0,
    expired: 0,
    errors: 0,
  };

  try {
    // Get all active obstacles
    const result = await db.query(
      `SELECT id, last_confirmed_at, created_at 
       FROM obstacles 
       WHERE status = 'active'`
    );

    for (const obstacle of result.rows) {
      try {
        stats.processed++;

        // Check if should expire
        const shouldExpireNow = await shouldExpire(obstacle.id);
        if (shouldExpireNow) {
          await expireObstacle(obstacle.id);
          stats.expired++;
          continue;
        }

        // Apply decay to confidence score
        await applyDecay(obstacle.id);
        stats.decayed++;
      } catch (error) {
        console.error(`Error processing obstacle ${obstacle.id}:`, error);
        stats.errors++;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error processing obstacles for decay:', error);
    throw error;
  }
}

/**
 * Detect seasonal patterns (e.g., winter pothole surge)
 * @returns {Promise<Object>} Seasonal statistics
 */
async function detectSeasonalPatterns() {
  try {
    const result = await db.query(
      `SELECT 
         type,
         DATE_TRUNC('month', created_at) as month,
         COUNT(*) as count
       FROM obstacles
       WHERE created_at > NOW() - INTERVAL '12 months'
       GROUP BY type, DATE_TRUNC('month', created_at)
       ORDER BY month DESC, count DESC`
    );

    // Group by type
    const patterns = {};
    result.rows.forEach(row => {
      if (!patterns[row.type]) {
        patterns[row.type] = [];
      }
      patterns[row.type].push({
        month: row.month,
        count: parseInt(row.count),
      });
    });

    return patterns;
  } catch (error) {
    console.error('Error detecting seasonal patterns:', error);
    return {};
  }
}

module.exports = {
  applyDecay,
  shouldExpire,
  expireObstacle,
  processAllObstacles,
  detectSeasonalPatterns,
  EXPIRATION_DAYS,
  DECAY_CHECK_INTERVAL_DAYS,
};
