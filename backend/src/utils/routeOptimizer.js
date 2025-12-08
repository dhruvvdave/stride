const { bufferLine, isPointNearLine } = require('./geoCalculations');

/**
 * Calculate smoothness score for a route based on obstacles
 * Formula: score = 100 - (high_severity * 10 + medium_severity * 5 + low_severity * 2)
 * Max deduction: 100 (minimum score = 0)
 * 
 * @param {Array} obstacles - Array of obstacle objects with severity
 * @returns {number} Smoothness score (0-100)
 */
function calculateSmoothnessScore(obstacles) {
  let deduction = 0;

  obstacles.forEach(obstacle => {
    switch (obstacle.severity) {
      case 'high':
        deduction += 10;
        break;
      case 'medium':
        deduction += 5;
        break;
      case 'low':
        deduction += 2;
        break;
    }
  });

  const score = Math.max(0, 100 - deduction);
  return score;
}

/**
 * Filter obstacles along a route
 * @param {Array} routeCoordinates - Array of [lng, lat] coordinates
 * @param {Array} allObstacles - All obstacles to check
 * @param {number} bufferMeters - Buffer distance in meters (default: 100)
 * @returns {Array} Obstacles along the route
 */
function findObstaclesAlongRoute(routeCoordinates, allObstacles, bufferMeters = 100) {
  return allObstacles.filter(obstacle => {
    const obstaclePoint = {
      lat: obstacle.lat || obstacle.location?.lat,
      lng: obstacle.lng || obstacle.location?.lng,
    };

    return isPointNearLine(obstaclePoint, routeCoordinates, bufferMeters);
  });
}

/**
 * Score route based on obstacles and user vehicle preferences
 * @param {Array} obstacles - Obstacles along route
 * @param {Object} vehicle - User's vehicle (optional)
 * @returns {Object} Route scoring details
 */
function scoreRoute(obstacles, vehicle = null) {
  let filteredObstacles = obstacles;

  // If user has a vehicle with low clearance, be more conservative
  if (vehicle && vehicle.ground_clearance_inches < 4.5) {
    // Don't filter, count all obstacles
  } else if (vehicle && vehicle.ground_clearance_inches >= 6) {
    // Filter out low severity obstacles for high clearance vehicles
    filteredObstacles = obstacles.filter(o => o.severity !== 'low');
  }

  const smoothnessScore = calculateSmoothnessScore(filteredObstacles);
  
  const severityCounts = {
    high: filteredObstacles.filter(o => o.severity === 'high').length,
    medium: filteredObstacles.filter(o => o.severity === 'medium').length,
    low: filteredObstacles.filter(o => o.severity === 'low').length,
  };

  return {
    smoothnessScore,
    obstacleCount: filteredObstacles.length,
    severityCounts,
  };
}

/**
 * Generate route alternatives based on obstacle avoidance
 * @param {Object} baseRoute - Base route from OSRM
 * @param {Array} obstacles - Obstacles to consider
 * @param {Object} vehicle - User's vehicle (optional)
 * @returns {Array} Three route options: smooth, standard, fastest
 */
function generateRouteAlternatives(baseRoute, obstacles, vehicle = null) {
  // This is a simplified version - in production, you'd use OSRM's alternative routes
  // and filter/rank them based on obstacles
  
  const routeCoordinates = baseRoute.geometry.coordinates;
  const obstaclesAlongRoute = findObstaclesAlongRoute(routeCoordinates, obstacles);

  // Fastest route - ignore obstacles
  const fastest = {
    type: 'fastest',
    ...baseRoute,
    ...scoreRoute([], vehicle),
  };

  // Standard route - avoid high severity only
  const highSeverityObstacles = obstaclesAlongRoute.filter(o => o.severity === 'high');
  const standard = {
    type: 'standard',
    ...baseRoute,
    ...scoreRoute(highSeverityObstacles, vehicle),
  };

  // Smooth route - avoid all obstacles
  const smooth = {
    type: 'smooth',
    ...baseRoute,
    ...scoreRoute(obstaclesAlongRoute, vehicle),
  };

  return [smooth, standard, fastest];
}

/**
 * Check if detour is acceptable (max 20% additional distance)
 * @param {number} baseDistance - Original route distance in meters
 * @param {number} alternativeDistance - Alternative route distance in meters
 * @returns {boolean}
 */
function isDetourAcceptable(baseDistance, alternativeDistance) {
  const detourMeters = alternativeDistance - baseDistance;
  const detourPercentage = (detourMeters / baseDistance) * 100;
  return detourPercentage <= 20;
}

/**
 * Calculate detour metrics
 * @param {number} baseDistance - Original route distance in meters
 * @param {number} alternativeDistance - Alternative route distance in meters
 * @returns {Object} Detour details
 */
function calculateDetourMetrics(baseDistance, alternativeDistance) {
  const detourMeters = Math.max(0, alternativeDistance - baseDistance);
  const detourPercentage = baseDistance > 0 ? (detourMeters / baseDistance) * 100 : 0;

  return {
    detourMeters: Math.round(detourMeters),
    detourPercentage: Math.round(detourPercentage * 10) / 10,
  };
}

module.exports = {
  calculateSmoothnessScore,
  findObstaclesAlongRoute,
  scoreRoute,
  generateRouteAlternatives,
  isDetourAcceptable,
  calculateDetourMetrics,
};
