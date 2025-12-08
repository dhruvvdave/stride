const request = require('supertest');
const { app } = require('../server');

describe('Routing API', () => {
  let authToken;

  beforeAll(async () => {
    // Create and login a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `routetest${Date.now()}@example.com`,
        password: 'password123',
        name: 'Route Test User',
      });
    authToken = registerRes.body.data.tokens.accessToken;
  });

  describe('POST /api/routes/plan', () => {
    it('should calculate route with obstacle avoidance', async () => {
      const res = await request(app)
        .post('/api/routes/plan')
        .send({
          origin: { lat: 43.6532, lng: -79.3832 },
          destination: { lat: 43.6612, lng: -79.3948 },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('routes');
      expect(Array.isArray(res.body.data.routes)).toBe(true);
      
      // Should return 3 route options
      expect(res.body.data.routes.length).toBeGreaterThan(0);
      
      // Each route should have required properties
      res.body.data.routes.forEach(route => {
        expect(route).toHaveProperty('type');
        expect(route).toHaveProperty('geometry');
        expect(route).toHaveProperty('distanceMeters');
        expect(route).toHaveProperty('durationSeconds');
        expect(route).toHaveProperty('smoothnessScore');
        expect(route).toHaveProperty('obstacleCount');
      });
    }, 10000); // Increase timeout for OSRM API call

    it('should fail with invalid coordinates', async () => {
      const res = await request(app)
        .post('/api/routes/plan')
        .send({
          origin: { lat: 100, lng: -79.3832 }, // Invalid latitude
          destination: { lat: 43.6612, lng: -79.3948 },
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/routes/save', () => {
    it('should save completed route', async () => {
      const res = await request(app)
        .post('/api/routes/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          origin: { lat: 43.6532, lng: -79.3832 },
          destination: { lat: 43.6612, lng: -79.3948 },
          geometry: [
            { lat: 43.6532, lng: -79.3832 },
            { lat: 43.6572, lng: -79.3890 },
            { lat: 43.6612, lng: -79.3948 },
          ],
          routeType: 'smooth',
          distanceMeters: 1500,
          durationSeconds: 300,
          obstacleCount: 2,
          smoothnessScore: 85,
          detourMeters: 100,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('routeId');
      expect(res.body.data).toHaveProperty('pointsAwarded');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/routes/save')
        .send({
          origin: { lat: 43.6532, lng: -79.3832 },
          destination: { lat: 43.6612, lng: -79.3948 },
          geometry: [{ lat: 43.6532, lng: -79.3832 }],
          routeType: 'fastest',
          distanceMeters: 1000,
          durationSeconds: 200,
          obstacleCount: 0,
          smoothnessScore: 100,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/routes/history', () => {
    it('should get user route history', async () => {
      const res = await request(app)
        .get('/api/routes/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('routes');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.routes)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/routes/history');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
