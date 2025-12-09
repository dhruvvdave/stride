/**
 * Job Scheduler
 * Initializes and schedules all background jobs
 */

const { scheduleExpirationJob } = require('./expireObstacles');
const { scheduleConfidenceUpdateJob } = require('./updateConfidence');
const { logger } = require('../api/middleware/errorHandler');

/**
 * Initialize all background jobs
 */
async function initializeJobs() {
  try {
    logger.info('Initializing background jobs...');

    // Schedule recurring jobs
    await scheduleExpirationJob();
    await scheduleConfidenceUpdateJob();

    logger.info('✅ Background jobs initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize background jobs', {
      error: error.message,
    });
    // Don't throw - jobs are optional
  }
}

module.exports = {
  initializeJobs,
};
