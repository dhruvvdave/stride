/**
 * Points awarded for different actions
 */
const POINTS = {
  NEW_OBSTACLE: 50,
  CONFIRM_OBSTACLE: 10,
  PHOTO_UPLOAD: 5,
  ROUTE_COMPLETION: 2,
  VERIFIED_OBSTACLE: 20, // Bonus when obstacle gets verified
  DISPUTE_RESOLVED: 15,
};

/**
 * Calculate points for a new obstacle report
 * @param {string} reportType - Type of report
 * @param {boolean} hasPhotos - Whether photos were uploaded
 * @returns {number} Points awarded
 */
function calculateReportPoints(reportType, hasPhotos = false) {
  let points = 0;

  switch (reportType) {
    case 'new':
      points = POINTS.NEW_OBSTACLE;
      break;
    case 'confirm':
      points = POINTS.CONFIRM_OBSTACLE;
      break;
    case 'fixed':
      points = POINTS.CONFIRM_OBSTACLE;
      break;
    case 'dispute':
      points = POINTS.CONFIRM_OBSTACLE;
      break;
    default:
      points = 0;
  }

  if (hasPhotos) {
    points += POINTS.PHOTO_UPLOAD;
  }

  return points;
}

/**
 * Calculate points for route completion
 * @param {number} distanceMeters - Route distance in meters
 * @returns {number} Points awarded
 */
function calculateRoutePoints(distanceMeters) {
  // Award 2 points per completed route + 1 point per 10km
  const basePoints = POINTS.ROUTE_COMPLETION;
  const distanceBonus = Math.floor(distanceMeters / 10000);
  return basePoints + distanceBonus;
}

/**
 * Check if user should earn an achievement
 * @param {Object} userStats - User statistics
 * @returns {Array} Array of badge types to award
 */
function checkAchievements(userStats) {
  const badges = [];

  // Early Adopter - first 1000 users
  if (userStats.userId <= 1000) {
    badges.push('early_adopter');
  }

  // Explorer - 100km navigated
  if (userStats.totalDistanceMeters >= 100000) {
    badges.push('explorer_100km');
  }

  // Reporter - 10 reports submitted
  if (userStats.totalReports >= 10) {
    badges.push('reporter_10');
  }

  // Photographer - 10 photos uploaded
  if (userStats.totalPhotos >= 10) {
    badges.push('photographer_10');
  }

  // Top Contributor - top 100 monthly points
  if (userStats.monthlyRank <= 100) {
    badges.push('top_contributor');
  }

  // Community Leader - 1000+ reputation points
  if (userStats.reputationPoints >= 1000) {
    badges.push('community_leader');
  }

  return badges;
}

/**
 * Calculate user level based on reputation points
 * @param {number} reputationPoints
 * @returns {Object} Level details
 */
function calculateLevel(reputationPoints) {
  const levels = [
    { level: 1, minPoints: 0, title: 'Rookie' },
    { level: 2, minPoints: 100, title: 'Navigator' },
    { level: 3, minPoints: 250, title: 'Explorer' },
    { level: 4, minPoints: 500, title: 'Pathfinder' },
    { level: 5, minPoints: 1000, title: 'Road Warrior' },
    { level: 6, minPoints: 2500, title: 'Route Master' },
    { level: 7, minPoints: 5000, title: 'Legend' },
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (reputationPoints >= levels[i].minPoints) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || null;
    }
  }

  const pointsToNextLevel = nextLevel 
    ? nextLevel.minPoints - reputationPoints 
    : 0;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentPoints: reputationPoints,
    pointsToNextLevel,
    nextLevel: nextLevel ? nextLevel.title : null,
  };
}

module.exports = {
  POINTS,
  calculateReportPoints,
  calculateRoutePoints,
  checkAchievements,
  calculateLevel,
};
