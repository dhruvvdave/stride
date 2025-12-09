/**
 * Geohash Service
 * Provides geohash encoding/decoding for spatial indexing and clustering
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode latitude and longitude to geohash
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lng - Longitude (-180 to 180)
 * @param {number} precision - Geohash precision (default: 9, ~4.8m precision)
 * @returns {string} Geohash string
 */
function encode(lat, lng, precision = 9) {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      // Longitude
      const lngMid = (lngMin + lngMax) / 2;
      if (lng >= lngMid) {
        idx |= (1 << (4 - bit));
        lngMin = lngMid;
      } else {
        lngMax = lngMid;
      }
    } else {
      // Latitude
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) {
        idx |= (1 << (4 - bit));
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }

    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

/**
 * Decode geohash to lat/lng bounds
 * @param {string} geohash - Geohash string
 * @returns {Object} Bounds object with lat/lng min/max
 */
function decode(geohash) {
  let evenBit = true;
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  for (let i = 0; i < geohash.length; i++) {
    const chr = geohash[i];
    const idx = BASE32.indexOf(chr);

    if (idx === -1) {
      throw new Error('Invalid geohash character');
    }

    for (let n = 4; n >= 0; n--) {
      const bitN = (idx >> n) & 1;

      if (evenBit) {
        // Longitude
        const lngMid = (lngMin + lngMax) / 2;
        if (bitN === 1) {
          lngMin = lngMid;
        } else {
          lngMax = lngMid;
        }
      } else {
        // Latitude
        const latMid = (latMin + latMax) / 2;
        if (bitN === 1) {
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }

      evenBit = !evenBit;
    }
  }

  return {
    lat: (latMin + latMax) / 2,
    lng: (lngMin + lngMax) / 2,
    latMin,
    latMax,
    lngMin,
    lngMax,
  };
}

/**
 * Get neighbors of a geohash
 * @param {string} geohash - Geohash string
 * @returns {Array} Array of neighbor geohashes
 */
function neighbors(geohash) {
  const bounds = decode(geohash);
  const latDelta = bounds.latMax - bounds.latMin;
  const lngDelta = bounds.lngMax - bounds.lngMin;
  
  const precision = geohash.length;
  
  return [
    encode(bounds.lat + latDelta, bounds.lng, precision), // N
    encode(bounds.lat + latDelta, bounds.lng + lngDelta, precision), // NE
    encode(bounds.lat, bounds.lng + lngDelta, precision), // E
    encode(bounds.lat - latDelta, bounds.lng + lngDelta, precision), // SE
    encode(bounds.lat - latDelta, bounds.lng, precision), // S
    encode(bounds.lat - latDelta, bounds.lng - lngDelta, precision), // SW
    encode(bounds.lat, bounds.lng - lngDelta, precision), // W
    encode(bounds.lat + latDelta, bounds.lng - lngDelta, precision), // NW
  ];
}

/**
 * Get geohash precision level based on zoom level
 * @param {number} zoom - Map zoom level (0-20)
 * @returns {number} Geohash precision
 */
function getPrecisionForZoom(zoom) {
  // Mapping zoom levels to geohash precision
  // Lower zoom = less precision (wider area)
  // Higher zoom = more precision (narrower area)
  if (zoom <= 5) return 3;  // ~156km
  if (zoom <= 8) return 4;  // ~39km
  if (zoom <= 10) return 5; // ~4.9km
  if (zoom <= 12) return 6; // ~1.2km
  if (zoom <= 14) return 7; // ~153m
  if (zoom <= 16) return 8; // ~38m
  return 9; // ~4.8m
}

module.exports = {
  encode,
  decode,
  neighbors,
  getPrecisionForZoom,
};
