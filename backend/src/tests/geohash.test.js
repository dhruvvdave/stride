const geohash = require('../services/geohashService');

describe('Geohash Service', () => {
  describe('encode', () => {
    it('should encode lat/lng to geohash', () => {
      const hash = geohash.encode(43.6532, -79.3832, 9);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(9);
    });

    it('should produce consistent results', () => {
      const hash1 = geohash.encode(43.6532, -79.3832, 9);
      const hash2 = geohash.encode(43.6532, -79.3832, 9);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different locations', () => {
      const hash1 = geohash.encode(43.6532, -79.3832, 9);
      const hash2 = geohash.encode(43.7532, -79.4832, 9);
      expect(hash1).not.toBe(hash2);
    });

    it('should handle different precisions', () => {
      const hash5 = geohash.encode(43.6532, -79.3832, 5);
      const hash9 = geohash.encode(43.6532, -79.3832, 9);
      expect(hash5.length).toBe(5);
      expect(hash9.length).toBe(9);
      // Lower precision should be prefix of higher precision
      expect(hash9.startsWith(hash5)).toBe(true);
    });
  });

  describe('decode', () => {
    it('should decode geohash to lat/lng', () => {
      const hash = geohash.encode(43.6532, -79.3832, 9);
      const decoded = geohash.decode(hash);
      
      expect(decoded).toHaveProperty('lat');
      expect(decoded).toHaveProperty('lng');
      expect(decoded).toHaveProperty('latMin');
      expect(decoded).toHaveProperty('latMax');
      expect(decoded).toHaveProperty('lngMin');
      expect(decoded).toHaveProperty('lngMax');
      
      // Decoded coordinates should be close to original
      expect(Math.abs(decoded.lat - 43.6532)).toBeLessThan(0.001);
      expect(Math.abs(decoded.lng - (-79.3832))).toBeLessThan(0.001);
    });

    it('should maintain accuracy with encode/decode cycle', () => {
      const originalLat = 43.6532;
      const originalLng = -79.3832;
      
      const hash = geohash.encode(originalLat, originalLng, 9);
      const decoded = geohash.decode(hash);
      
      // Should be within ~5 meters at precision 9
      expect(Math.abs(decoded.lat - originalLat)).toBeLessThan(0.0001);
      expect(Math.abs(decoded.lng - originalLng)).toBeLessThan(0.0001);
    });
  });

  describe('neighbors', () => {
    it('should return 8 neighbors', () => {
      const hash = geohash.encode(43.6532, -79.3832, 7);
      const neighborHashes = geohash.neighbors(hash);
      
      expect(Array.isArray(neighborHashes)).toBe(true);
      expect(neighborHashes.length).toBe(8);
      
      // All neighbors should have same precision
      neighborHashes.forEach(neighborHash => {
        expect(neighborHash.length).toBe(7);
      });
    });

    it('should return unique neighbors', () => {
      const hash = geohash.encode(43.6532, -79.3832, 7);
      const neighborHashes = geohash.neighbors(hash);
      
      const uniqueHashes = new Set(neighborHashes);
      expect(uniqueHashes.size).toBe(8);
    });
  });

  describe('getPrecisionForZoom', () => {
    it('should return appropriate precision for zoom levels', () => {
      expect(geohash.getPrecisionForZoom(5)).toBe(3);
      expect(geohash.getPrecisionForZoom(8)).toBe(4);
      expect(geohash.getPrecisionForZoom(10)).toBe(5);
      expect(geohash.getPrecisionForZoom(12)).toBe(6);
      expect(geohash.getPrecisionForZoom(14)).toBe(7);
      expect(geohash.getPrecisionForZoom(16)).toBe(8);
      expect(geohash.getPrecisionForZoom(18)).toBe(9);
    });

    it('should return higher precision for higher zoom', () => {
      const precision5 = geohash.getPrecisionForZoom(5);
      const precision15 = geohash.getPrecisionForZoom(15);
      expect(precision15).toBeGreaterThan(precision5);
    });
  });
});
