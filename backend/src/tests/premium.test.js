const request = require('supertest');
const { app } = require('../server');

describe('Premium Features', () => {
  let freeUserToken;
  let premiumUserToken;

  beforeAll(async () => {
    // Create free user
    const freeUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `freeuser${Date.now()}@example.com`,
        password: 'password123',
        name: 'Free User',
      });
    freeUserToken = freeUserRes.body.data.tokens.accessToken;

    // Create premium user (would normally be done through subscription flow)
    const premiumUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `premiumuser${Date.now()}@example.com`,
        password: 'password123',
        name: 'Premium User',
      });
    premiumUserToken = premiumUserRes.body.data.tokens.accessToken;

    // Note: In a real scenario, you'd update the user's subscription status
    // For testing, we'll just demonstrate the gate functionality
  });

  describe('Vehicle Management', () => {
    it('should block free user from accessing vehicles', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${freeUserToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREMIUM_REQUIRED');
    });

    it('should block free user from creating vehicles', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          name: 'My Car',
          vehicleType: 'sedan',
          suspensionType: 'stock',
          groundClearanceInches: 5.5,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREMIUM_REQUIRED');
    });
  });

  describe('Car Clubs', () => {
    it('should block free user from creating clubs', async () => {
      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          name: 'Test Club',
          description: 'A test car club',
          isPrivate: false,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PREMIUM_REQUIRED');
    });

    it('should allow viewing public clubs without premium', async () => {
      const res = await request(app).get('/api/clubs');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
