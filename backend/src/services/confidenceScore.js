/**
 * Confidence Score Service
 * Calculates obstacle confidence scores based on:
 * - Number of confirmations
 * - Reporter trust scores
 * - Number of disputes
 * - Obstacle age
 * - Photo evidence
 * - Municipal confirmation
 */

const db = require('../config/database');

/**
 * Calculate confidence score for an obstacle
 * Confidence score ranges from 0-100
 * 
 * Factors:
 * - Base score: 50
 * - Confirmations: +30 points (6 points per confirmation, max 30)
 * - Reporter trust: +15 points (based on average reporter trust)
 * - Disputes: -40 points (-10 points per dispute, max -40)
 * - Age decay: -20 points (based on days since last confirmation)
 * - Photo evidence: +10 points
 * - Municipal confirmation: +15 points
 * 
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<number>} Confidence score (0-100)
 */
async function calculateConfidenceScore(obstacleId) {
  try {
    // Get obstacle data
    const obstacleResult = await db.query(
      `SELECT 
        confirmations_count, 
        disputes_count, 
        last_confirmed_at, 
        municipal_confirmed,
        created_by,
        created_at
       FROM obstacles 
       WHERE id = $1`,
      [obstacleId]
    );

    if (obstacleResult.rows.length === 0) {
      throw new Error('Obstacle not found');
    }

    const obstacle = obstacleResult.rows[0];
    
    // Base score
    let score = 50;

    // Confirmations factor (max +30 points)
    const confirmationPoints = Math.min(obstacle.confirmations_count * 6, 30);
    score += confirmationPoints;

    // Reporter trust factor (max +15 points)
    // Get trust scores of all reporters (creator + confirmations)
    const reportersResult = await db.query(
      `SELECT COALESCE(AVG(u.trust_score), 50) as avg_trust
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.obstacle_id = $1 AND r.report_type IN ('new', 'confirm')`,
      [obstacleId]
    );
    
    const avgTrust = parseFloat(reportersResult.rows[0].avg_trust) || 50;
    const trustPoints = Math.floor((avgTrust / 100) * 15);
    score += trustPoints;

    // Disputes factor (max -40 points)
    const disputePenalty = Math.min(obstacle.disputes_count * 10, 40);
    score -= disputePenalty;

    // Age decay factor (max -20 points)
    const daysSinceConfirmed = Math.floor(
      (Date.now() - new Date(obstacle.last_confirmed_at || obstacle.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const decayPoints = Math.min(Math.floor(daysSinceConfirmed / 30) * 5, 20); // -5 points per 30 days
    score -= decayPoints;

    // Photo evidence factor (+10 points)
    const photoResult = await db.query(
      `SELECT COUNT(*) as photo_count 
       FROM reports 
       WHERE obstacle_id = $1 
         AND photos IS NOT NULL 
         AND array_length(photos, 1) > 0`,
      [obstacleId]
    );
    
    if (parseInt(photoResult.rows[0].photo_count) > 0) {
      score += 10;
    }

    // Municipal confirmation factor (+15 points)
    if (obstacle.municipal_confirmed) {
      score += 15;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return score;
  } catch (error) {
    console.error('Error calculating confidence score:', error);
    return 50; // Default to middle score on error
  }
}

/**
 * Update confidence score for an obstacle in the database
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<number>} New confidence score
 */
async function updateConfidenceScore(obstacleId) {
  const confidenceScore = await calculateConfidenceScore(obstacleId);
  
  await db.query(
    'UPDATE obstacles SET confidence_score = $1 WHERE id = $2',
    [confidenceScore, obstacleId]
  );

  return confidenceScore;
}

/**
 * Increment confirmations count and update confidence
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<number>} New confidence score
 */
async function incrementConfirmations(obstacleId) {
  await db.query(
    `UPDATE obstacles 
     SET confirmations_count = confirmations_count + 1,
         last_confirmed_at = NOW()
     WHERE id = $1`,
    [obstacleId]
  );

  return updateConfidenceScore(obstacleId);
}

/**
 * Increment disputes count and update confidence
 * @param {string} obstacleId - Obstacle ID
 * @returns {Promise<number>} New confidence score
 */
async function incrementDisputes(obstacleId) {
  await db.query(
    'UPDATE obstacles SET disputes_count = disputes_count + 1 WHERE id = $1',
    [obstacleId]
  );

  return updateConfidenceScore(obstacleId);
}

/**
 * Get confidence level description
 * @param {number} confidenceScore - Confidence score (0-100)
 * @returns {string} Confidence level description
 */
function getConfidenceLevel(confidenceScore) {
  if (confidenceScore >= 80) return 'very_high';
  if (confidenceScore >= 60) return 'high';
  if (confidenceScore >= 40) return 'medium';
  if (confidenceScore >= 30) return 'low';
  return 'very_low';
}

/**
 * Check if obstacle should be hidden based on confidence
 * @param {number} confidenceScore - Confidence score (0-100)
 * @returns {boolean} True if should be hidden
 */
function shouldHide(confidenceScore) {
  return confidenceScore < 30;
}

module.exports = {
  calculateConfidenceScore,
  updateConfidenceScore,
  incrementConfirmations,
  incrementDisputes,
  getConfidenceLevel,
  shouldHide,
};
