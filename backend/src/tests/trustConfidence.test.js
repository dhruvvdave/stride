const request = require('supertest');
const { app } = require('../server');
const { calculateTrustScore, updateTrustScore } = require('../services/trustScore');
const { calculateConfidenceScore } = require('../services/confidenceScore');
const db = require('../config/database');

describe('Trust and Confidence System', () => {
  let authToken;
  let userId;
  let obstacleId;

  beforeAll(async () => {
    // Create and login a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `trusttest${Date.now()}@example.com`,
        password: 'password123',
        name: 'Trust Test User',
      });
    authToken = registerRes.body.data.tokens.accessToken;
    userId = registerRes.body.data.user.id;

    // Create an obstacle for testing
    const obstacleRes = await request(app)
      .post('/api/obstacles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'pothole',
        lat: 43.6532,
        lng: -79.3832,
        severity: 'high',
        description: 'Test obstacle',
      });
    obstacleId = obstacleRes.body.data.obstacle.id;
  });

  describe('Trust Score Calculation', () => {
    it('should calculate initial trust score', async () => {
      const trustScore = await calculateTrustScore(userId);
      expect(trustScore).toBeGreaterThanOrEqual(0);
      expect(trustScore).toBeLessThanOrEqual(100);
      // New users should have base score around 50
      expect(trustScore).toBeGreaterThanOrEqual(45);
    });

    it('should update trust score in database', async () => {
      const newScore = await updateTrustScore(userId);
      
      const result = await db.query(
        'SELECT trust_score FROM users WHERE id = $1',
        [userId]
      );
      
      expect(result.rows[0].trust_score).toBe(newScore);
    });
  });

  describe('Confidence Score Calculation', () => {
    it('should calculate initial confidence score for obstacle', async () => {
      const confidenceScore = await calculateConfidenceScore(obstacleId);
      expect(confidenceScore).toBeGreaterThanOrEqual(0);
      expect(confidenceScore).toBeLessThanOrEqual(100);
      // New obstacles should have base score around 50
      expect(confidenceScore).toBeGreaterThanOrEqual(45);
    });
  });

  describe('GET /api/users/:id/trust-score', () => {
    it('should get user trust score', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}/trust-score`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('trustScore');
      expect(res.body.data).toHaveProperty('trustLevel');
      expect(res.body.data).toHaveProperty('statistics');
      expect(res.body.data.statistics).toHaveProperty('reportsVerified');
      expect(res.body.data.statistics).toHaveProperty('reportsDisputed');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/00000000-0000-0000-0000-000000000000/trust-score');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/obstacles/:id/confirm', () => {
    let secondAuthToken;
    let secondUserId;

    beforeAll(async () => {
      // Create a second user to confirm the obstacle
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `confirmtest${Date.now()}@example.com`,
          password: 'password123',
          name: 'Confirm Test User',
        });
      secondAuthToken = registerRes.body.data.tokens.accessToken;
      secondUserId = registerRes.body.data.user.id;
    });

    it('should confirm an obstacle', async () => {
      const res = await request(app)
        .put(`/api/obstacles/${obstacleId}/confirm`)
        .set('Authorization', `Bearer ${secondAuthToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('confidenceScore');
      expect(res.body.data).toHaveProperty('pointsAwarded');
      expect(res.body.data.pointsAwarded).toBe(10);
    });

    it('should not allow duplicate confirmations', async () => {
      const res = await request(app)
        .put(`/api/obstacles/${obstacleId}/confirm`)
        .set('Authorization', `Bearer ${secondAuthToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already confirmed');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/obstacles/${obstacleId}/confirm`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/obstacles/:id/dispute', () => {
    let thirdAuthToken;

    beforeAll(async () => {
      // Create a third user to dispute the obstacle
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `disputetest${Date.now()}@example.com`,
          password: 'password123',
          name: 'Dispute Test User',
        });
      thirdAuthToken = registerRes.body.data.tokens.accessToken;
    });

    it('should dispute an obstacle', async () => {
      const res = await request(app)
        .put(`/api/obstacles/${obstacleId}/dispute`)
        .set('Authorization', `Bearer ${thirdAuthToken}`)
        .send({
          reason: 'This obstacle no longer exists',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('confidenceScore');
    });

    it('should not allow duplicate disputes', async () => {
      const res = await request(app)
        .put(`/api/obstacles/${obstacleId}/dispute`)
        .set('Authorization', `Bearer ${thirdAuthToken}`)
        .send({
          reason: 'Duplicate dispute',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already disputed');
    });

    it('should fail without reason', async () => {
      const res = await request(app)
        .put(`/api/obstacles/${obstacleId}/dispute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/obstacles with minConfidence', () => {
    it('should filter obstacles by confidence score', async () => {
      const res = await request(app)
        .get('/api/obstacles')
        .query({
          minLat: 43.6,
          maxLat: 43.7,
          minLng: -79.4,
          maxLng: -79.3,
          minConfidence: 50,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('obstacles');
      
      // All obstacles should have confidence >= 50
      res.body.data.obstacles.forEach(obstacle => {
        expect(obstacle.confidenceScore).toBeGreaterThanOrEqual(50);
      });
    });

    it('should use default minConfidence of 30', async () => {
      const res = await request(app)
        .get('/api/obstacles')
        .query({
          minLat: 43.6,
          maxLat: 43.7,
          minLng: -79.4,
          maxLng: -79.3,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/obstacles/clusters', () => {
    it('should get clustered obstacles', async () => {
      const res = await request(app)
        .get('/api/obstacles/clusters')
        .query({
          minLat: 43.6,
          maxLat: 43.7,
          minLng: -79.4,
          maxLng: -79.3,
          zoom: 12,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('clusters');
      expect(Array.isArray(res.body.data.clusters)).toBe(true);
    });

    it('should require zoom parameter', async () => {
      const res = await request(app)
        .get('/api/obstacles/clusters')
        .query({
          minLat: 43.6,
          maxLat: 43.7,
          minLng: -79.4,
          maxLng: -79.3,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
