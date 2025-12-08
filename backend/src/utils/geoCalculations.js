const turf = require('@turf/turf');

/**
 * Calculate distance between two points in meters
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in meters
 */
function calculateDistance(point1, point2) {
  const from = turf.point([point1.lng, point1.lat]);
  const to = turf.point([point2.lng, point2.lat]);
  return turf.distance(from, to, { units: 'meters' });
}

/**
 * Calculate bearing between two points in degrees
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(point1, point2) {
  const from = turf.point([point1.lng, point1.lat]);
  const to = turf.point([point2.lng, point2.lat]);
  return turf.bearing(from, to);
}

/**
 * Create a bounding box around a point
 * @param {Object} center - {lat, lng}
 * @param {number} radiusMeters - Radius in meters
 * @returns {Object} {minLat, maxLat, minLng, maxLng}
 */
function createBoundingBox(center, radiusMeters) {
  const point = turf.point([center.lng, center.lat]);
  const radiusKm = radiusMeters / 1000;
  const bbox = turf.bbox(turf.buffer(point, radiusKm, { units: 'kilometers' }));
  
  return {
    minLng: bbox[0],
    minLat: bbox[1],
    maxLng: bbox[2],
    maxLat: bbox[3],
  };
}

/**
 * Check if a point is within a bounding box
 * @param {Object} point - {lat, lng}
 * @param {Object} bbox - {minLat, maxLat, minLng, maxLng}
 * @returns {boolean}
 */
function isPointInBoundingBox(point, bbox) {
  return (
    point.lat >= bbox.minLat &&
    point.lat <= bbox.maxLat &&
    point.lng >= bbox.minLng &&
    point.lng <= bbox.maxLng
  );
}

/**
 * Calculate the centroid of multiple points
 * @param {Array} points - Array of {lat, lng}
 * @returns {Object} {lat, lng}
 */
function calculateCentroid(points) {
  const turfPoints = points.map(p => turf.point([p.lng, p.lat]));
  const features = turf.featureCollection(turfPoints);
  const centroid = turf.center(features);
  
  return {
    lat: centroid.geometry.coordinates[1],
    lng: centroid.geometry.coordinates[0],
  };
}

/**
 * Create a buffer around a line
 * @param {Array} lineCoordinates - Array of [lng, lat]
 * @param {number} bufferMeters - Buffer distance in meters
 * @returns {Object} Buffered polygon
 */
function bufferLine(lineCoordinates, bufferMeters) {
  const line = turf.lineString(lineCoordinates);
  const bufferKm = bufferMeters / 1000;
  return turf.buffer(line, bufferKm, { units: 'kilometers' });
}

/**
 * Check if a point is near a line (within buffer distance)
 * @param {Object} point - {lat, lng}
 * @param {Array} lineCoordinates - Array of [lng, lat]
 * @param {number} bufferMeters - Buffer distance in meters
 * @returns {boolean}
 */
function isPointNearLine(point, lineCoordinates, bufferMeters) {
  const turfPoint = turf.point([point.lng, point.lat]);
  const line = turf.lineString(lineCoordinates);
  const distance = turf.pointToLineDistance(turfPoint, line, { units: 'meters' });
  return distance <= bufferMeters;
}

/**
 * Format coordinates for PostGIS GEOGRAPHY
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} PostGIS point format
 */
function formatPointForPostGIS(lat, lng) {
  return `POINT(${lng} ${lat})`;
}

/**
 * Format line coordinates for PostGIS GEOGRAPHY
 * @param {Array} coordinates - Array of {lat, lng}
 * @returns {string} PostGIS linestring format
 */
function formatLineForPostGIS(coordinates) {
  const coordString = coordinates
    .map(coord => `${coord.lng} ${coord.lat}`)
    .join(', ');
  return `LINESTRING(${coordString})`;
}

/**
 * Parse PostGIS point to {lat, lng}
 * @param {string} pointString - PostGIS point string
 * @returns {Object} {lat, lng}
 */
function parsePostGISPoint(pointString) {
  // Format: "POINT(lng lat)"
  const match = pointString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) return null;
  
  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
}

module.exports = {
  calculateDistance,
  calculateBearing,
  createBoundingBox,
  isPointInBoundingBox,
  calculateCentroid,
  bufferLine,
  isPointNearLine,
  formatPointForPostGIS,
  formatLineForPostGIS,
  parsePostGISPoint,
};
