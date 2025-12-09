const { detectSpam, isDuplicateReport, isRapidReporting } = require('../services/spamDetection');
const db = require('../config/database');

describe('Spam Detection Service', () => {
  let testUserId;
  let testObstacleId;

  beforeAll(async () => {
    // Create a test user
    const userResult = await db.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [`spamtest${Date.now()}@example.com`, 'hash', 'Spam Test User']
    );
    testUserId = userResult.rows[0].id;

    // Create a test obstacle
    const obstacleResult = await db.query(
      `INSERT INTO obstacles (type, location, severity, created_by) 
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5) 
       RETURNING id`,
      ['pothole', -79.3832, 43.6532, 'high', testUserId]
    );
    testObstacleId = obstacleResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data in correct order to avoid foreign key violations
    try {
      // Delete reports first (depends on obstacles and users)
      await db.query('DELETE FROM reports WHERE user_id = $1', [testUserId]);
      // Then delete obstacles (depends on users)
      await db.query('DELETE FROM obstacles WHERE id = $1', [testObstacleId]);
      // Finally delete users
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    } catch (error) {
      // Errors expected in test environment without database
    }
  });

  describe('isDuplicateReport', () => {
    it('should detect duplicate reports in same location', async () => {
      // Create an initial report
      await db.query(
        `INSERT INTO reports (obstacle_id, user_id, report_type) 
         VALUES ($1, $2, 'new')`,
        [testObstacleId, testUserId]
      );

      // Check for duplicate (same location, type, within 30 minutes)
      const isDuplicate = await isDuplicateReport(
        testUserId,
        'pothole',
        43.6532,
        -79.3832
      );

      expect(isDuplicate).toBe(true);
    });

    it('should not detect duplicate for different location', async () => {
      const isDuplicate = await isDuplicateReport(
        testUserId,
        'pothole',
        43.7532, // Different location
        -79.4832
      );

      expect(isDuplicate).toBe(false);
    });
  });

  describe('detectSpam', () => {
    it('should detect spam patterns', async () => {
      const spamCheck = await detectSpam(
        testUserId,
        'pothole',
        43.6532,
        -79.3832,
        'Test description'
      );

      expect(spamCheck).toHaveProperty('isDuplicate');
      expect(spamCheck).toHaveProperty('isRapid');
      expect(spamCheck).toHaveProperty('isClustering');
      expect(spamCheck).toHaveProperty('isSpam');
      expect(typeof spamCheck.isSpam).toBe('boolean');
    });

    it('should flag as spam when duplicate is detected', async () => {
      // The previous test already created a report in this location
      const spamCheck = await detectSpam(
        testUserId,
        'pothole',
        43.6532,
        -79.3832,
        'Test description'
      );

      // Should detect duplicate
      expect(spamCheck.isDuplicate).toBe(true);
    });
  });

  describe('isRapidReporting', () => {
    it('should return false for normal reporting rate', async () => {
      // Create a fresh user for this test
      const newUserResult = await db.query(
        `INSERT INTO users (email, password_hash, name) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [`rapidtest${Date.now()}@example.com`, 'hash', 'Rapid Test User']
      );
      const newUserId = newUserResult.rows[0].id;

      const isRapid = await isRapidReporting(newUserId);
      expect(isRapid).toBe(false);

      // Cleanup
      await db.query('DELETE FROM users WHERE id = $1', [newUserId]);
    });
  });
});
