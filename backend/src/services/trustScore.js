/**
 * Trust Score Service
 * Calculates and updates user trust scores based on:
 * - Account age
 * - Verified reports
 * - Disputed reports
 * - Report accuracy
 */

const db = require('../config/database');

/**
 * Calculate trust score for a user
 * Trust score ranges from 0-100
 * 
 * Factors:
 * - Base score: 50
 * - Account age: +10 points (1 point per month, max 10)
 * - Verified reports: +30 points (3 points per verified report, max 30)
 * - Disputed reports: -40 points (-4 points per disputed report, max -40)
 * - Report accuracy: +10 points (based on verification rate)
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} Trust score (0-100)
 */
async function calculateTrustScore(userId) {
  try {
    // Get user data
    const userResult = await db.query(
      `SELECT created_at, reports_verified, reports_disputed 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];
    
    // Base score
    let score = 50;

    // Account age factor (max +10 points)
    const accountAgeMonths = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const agePoints = Math.min(accountAgeMonths, 10);
    score += agePoints;

    // Verified reports factor (max +30 points)
    const verifiedPoints = Math.min(user.reports_verified * 3, 30);
    score += verifiedPoints;

    // Disputed reports factor (max -40 points)
    const disputedPenalty = Math.min(user.reports_disputed * 4, 40);
    score -= disputedPenalty;

    // Report accuracy factor (max +10 points)
    const totalReports = user.reports_verified + user.reports_disputed;
    if (totalReports > 0) {
      const accuracy = user.reports_verified / totalReports;
      const accuracyPoints = Math.floor(accuracy * 10);
      score += accuracyPoints;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return score;
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return 50; // Default to middle score on error
  }
}

/**
 * Update trust score for a user in the database
 * @param {string} userId - User ID
 * @returns {Promise<number>} New trust score
 */
async function updateTrustScore(userId) {
  const trustScore = await calculateTrustScore(userId);
  
  await db.query(
    'UPDATE users SET trust_score = $1 WHERE id = $2',
    [trustScore, userId]
  );

  return trustScore;
}

/**
 * Increment verified reports count and update trust score
 * @param {string} userId - User ID
 * @returns {Promise<number>} New trust score
 */
async function incrementVerifiedReports(userId) {
  await db.query(
    'UPDATE users SET reports_verified = reports_verified + 1 WHERE id = $1',
    [userId]
  );

  return updateTrustScore(userId);
}

/**
 * Increment disputed reports count and update trust score
 * @param {string} userId - User ID
 * @returns {Promise<number>} New trust score
 */
async function incrementDisputedReports(userId) {
  await db.query(
    'UPDATE users SET reports_disputed = reports_disputed + 1 WHERE id = $1',
    [userId]
  );

  return updateTrustScore(userId);
}

/**
 * Get trust level description
 * @param {number} trustScore - Trust score (0-100)
 * @returns {string} Trust level description
 */
function getTrustLevel(trustScore) {
  if (trustScore >= 80) return 'highly_trusted';
  if (trustScore >= 60) return 'trusted';
  if (trustScore >= 40) return 'neutral';
  if (trustScore >= 20) return 'low_trust';
  return 'flagged';
}

/**
 * Check if user is flagged as bad actor
 * @param {number} trustScore - Trust score (0-100)
 * @returns {boolean} True if user should be flagged
 */
function isFlagged(trustScore) {
  return trustScore < 20;
}

module.exports = {
  calculateTrustScore,
  updateTrustScore,
  incrementVerifiedReports,
  incrementDisputedReports,
  getTrustLevel,
  isFlagged,
};
