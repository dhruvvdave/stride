/**
 * Spam Detection Service
 * Detects spam and abuse patterns:
 * - Duplicate reports
 * - Rapid reporting
 * - Clustering detection
 * - Pattern matching
 */

const db = require('../config/database');
const { getRedisClient } = require('../config/redis');

// Constants for spam detection
const RAPID_REPORT_THRESHOLD = 5; // reports per minute
const DUPLICATE_DISTANCE_METERS = 10; // meters for duplicate detection
const DUPLICATE_TIME_WINDOW_MINUTES = 30; // time window for duplicate detection
const CLUSTERING_THRESHOLD = 10; // reports in same location

/**
 * Check if report is duplicate
 * @param {string} userId - User ID
 * @param {string} type - Obstacle type
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<boolean>} True if duplicate
 */
async function isDuplicateReport(userId, type, lat, lng) {
  try {
    // Check for recent reports by same user in same location
    const result = await db.query(
      `SELECT r.id 
       FROM reports r
       JOIN obstacles o ON r.obstacle_id = o.id
       WHERE r.user_id = $1
         AND o.type = $2
         AND r.created_at > NOW() - INTERVAL '${DUPLICATE_TIME_WINDOW_MINUTES} minutes'
         AND ST_DWithin(
           o.location,
           ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
           $5
         )
       LIMIT 1`,
      [userId, type, lng, lat, DUPLICATE_DISTANCE_METERS]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking duplicate report:', error);
    return false;
  }
}

/**
 * Check if user is reporting too rapidly
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if rapid reporting detected
 */
async function isRapidReporting(userId) {
  try {
    // Check Redis cache first for performance
    const redis = await getRedisClient();
    if (redis) {
      const key = `rapid_report:${userId}`;
      const count = await redis.get(key);
      
      if (count && parseInt(count) >= RAPID_REPORT_THRESHOLD) {
        return true;
      }

      // Increment counter with 1 minute TTL
      await redis.incr(key);
      await redis.expire(key, 60);
    }

    // Fallback to database check
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM reports 
       WHERE user_id = $1 
         AND created_at > NOW() - INTERVAL '1 minute'`,
      [userId]
    );

    return parseInt(result.rows[0].count) >= RAPID_REPORT_THRESHOLD;
  } catch (error) {
    console.error('Error checking rapid reporting:', error);
    return false;
  }
}

/**
 * Check for suspicious clustering (too many reports in same area)
 * @param {string} userId - User ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<boolean>} True if suspicious clustering detected
 */
async function isSuspiciousClustering(userId, lat, lng) {
  try {
    // Check if user has many reports in a small area (100m radius)
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM reports r
       JOIN obstacles o ON r.obstacle_id = o.id
       WHERE r.user_id = $1
         AND r.created_at > NOW() - INTERVAL '24 hours'
         AND ST_DWithin(
           o.location,
           ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
           100
         )`,
      [userId, lng, lat]
    );

    return parseInt(result.rows[0].count) >= CLUSTERING_THRESHOLD;
  } catch (error) {
    console.error('Error checking clustering:', error);
    return false;
  }
}

/**
 * Detect spam patterns in report
 * @param {Object} report - Report data
 * @returns {Promise<Object>} Spam detection result
 */
async function detectSpam(userId, type, lat, lng, description) {
  const flags = {
    isDuplicate: false,
    isRapid: false,
    isClustering: false,
    isSpam: false,
  };

  try {
    // Run all checks in parallel
    const [duplicate, rapid, clustering] = await Promise.all([
      isDuplicateReport(userId, type, lat, lng),
      isRapidReporting(userId),
      isSuspiciousClustering(userId, lat, lng),
    ]);

    flags.isDuplicate = duplicate;
    flags.isRapid = rapid;
    flags.isClustering = clustering;

    // Determine if spam based on flags
    flags.isSpam = duplicate || (rapid && clustering);

    return flags;
  } catch (error) {
    console.error('Error detecting spam:', error);
    return flags;
  }
}

/**
 * Get spam score for a user (0-100, higher = more suspicious)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Spam score
 */
async function getUserSpamScore(userId) {
  try {
    // Check recent report patterns
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_reports,
         COUNT(DISTINCT DATE_TRUNC('minute', created_at)) as unique_minutes,
         COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_reports
       FROM reports
       WHERE user_id = $1
         AND created_at > NOW() - INTERVAL '24 hours'`,
      [userId]
    );

    const stats = result.rows[0];
    const totalReports = parseInt(stats.total_reports);
    const uniqueMinutes = parseInt(stats.unique_minutes);
    const recentReports = parseInt(stats.recent_reports);

    let spamScore = 0;

    // High volume in short time
    if (totalReports > 20) spamScore += 30;
    
    // Reports clustered in time
    if (uniqueMinutes > 0 && totalReports / uniqueMinutes > 3) spamScore += 40;
    
    // Recent burst activity
    if (recentReports > 10) spamScore += 30;

    return Math.min(spamScore, 100);
  } catch (error) {
    console.error('Error calculating spam score:', error);
    return 0;
  }
}

/**
 * Flag user as potential bad actor
 * @param {string} userId - User ID
 * @param {string} reason - Reason for flagging
 * @returns {Promise<void>}
 */
async function flagUser(userId, reason) {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const key = `flagged_user:${userId}`;
      await redis.set(key, JSON.stringify({
        reason,
        timestamp: Date.now(),
      }), {
        EX: 86400, // 24 hours
      });
    }
  } catch (error) {
    console.error('Error flagging user:', error);
  }
}

/**
 * Check if user is flagged
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if flagged
 */
async function isFlagged(userId) {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const key = `flagged_user:${userId}`;
      const flagged = await redis.get(key);
      return flagged !== null;
    }
    return false;
  } catch (error) {
    console.error('Error checking if user is flagged:', error);
    return false;
  }
}

module.exports = {
  isDuplicateReport,
  isRapidReporting,
  isSuspiciousClustering,
  detectSpam,
  getUserSpamScore,
  flagUser,
  isFlagged,
};
