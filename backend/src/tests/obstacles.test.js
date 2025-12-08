const request = require('supertest');
const { app } = require('../server');

describe('Obstacles API', () => {
  let authToken;
  let userId;
  let obstacleId;

  beforeAll(async () => {
    // Create and login a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `obstacletest${Date.now()}@example.com`,
        password: 'password123',
        name: 'Obstacle Test User',
      });
    authToken = registerRes.body.data.tokens.accessToken;
    userId = registerRes.body.data.user.id;
  });

  describe('POST /api/obstacles', () => {
    it('should create a new obstacle', async () => {
      const res = await request(app)
        .post('/api/obstacles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'pothole',
          lat: 43.6532,
          lng: -79.3832,
          severity: 'high',
          description: 'Large pothole on Main St',
          photos: ['https://example.com/photo1.jpg'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.obstacle).toHaveProperty('id');
      expect(res.body.data.obstacle.type).toBe('pothole');
      expect(res.body.data).toHaveProperty('pointsAwarded');

      obstacleId = res.body.data.obstacle.id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/obstacles')
        .send({
          type: 'speedbump',
          lat: 43.6532,
          lng: -79.3832,
          severity: 'medium',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid obstacle type', async () => {
      const res = await request(app)
        .post('/api/obstacles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'invalid-type',
          lat: 43.6532,
          lng: -79.3832,
          severity: 'medium',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/obstacles', () => {
    it('should get obstacles in bounding box', async () => {
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
      expect(res.body.data).toHaveProperty('obstacles');
      expect(Array.isArray(res.body.data.obstacles)).toBe(true);
    });

    it('should filter obstacles by type', async () => {
      const res = await request(app)
        .get('/api/obstacles')
        .query({
          minLat: 43.6,
          maxLat: 43.7,
          minLng: -79.4,
          maxLng: -79.3,
          types: ['pothole'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter obstacles by severity', async () => {
      const res = await request(app)
        .get('/api/obstacles')
        .query({
          minLat: 43.6,
          maxLat: 43.7,
          minLng: -79.4,
          maxLng: -79.3,
          severity: ['high'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/obstacles/:id', () => {
    it('should get obstacle details', async () => {
      const res = await request(app).get(`/api/obstacles/${obstacleId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.obstacle).toHaveProperty('id');
      expect(res.body.data.obstacle).toHaveProperty('type');
      expect(res.body.data.obstacle).toHaveProperty('location');
    });

    it('should return 404 for non-existent obstacle', async () => {
      const res = await request(app).get('/api/obstacles/00000000-0000-0000-0000-000000000000');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/obstacles/:id/reports', () => {
    it('should get reports for obstacle', async () => {
      const res = await request(app).get(`/api/obstacles/${obstacleId}/reports`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reports');
      expect(Array.isArray(res.body.data.reports)).toBe(true);
    });
  });
});
