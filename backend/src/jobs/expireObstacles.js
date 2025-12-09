/**
 * Expire Obstacles Job
 * Automatically expire obstacles after 180 days without confirmation
 */

const { obstacleExpirationQueue, defaultJobOptions } = require('../config/queue');
const { processAllObstacles } = require('../services/obstacleDecay');
const { logger } = require('../api/middleware/errorHandler');

/**
 * Process obstacle expiration
 */
obstacleExpirationQueue.process(async (job) => {
  logger.info('Starting obstacle expiration job');
  
  try {
    const stats = await processAllObstacles();
    
    logger.info('Obstacle expiration job completed', {
      processed: stats.processed,
      decayed: stats.decayed,
      expired: stats.expired,
      errors: stats.errors,
    });

    return stats;
  } catch (error) {
    logger.error('Obstacle expiration job failed', { error: error.message });
    throw error;
  }
});

/**
 * Add expiration job to queue
 * @returns {Promise<void>}
 */
async function scheduleExpirationJob() {
  await obstacleExpirationQueue.add(
    {},
    {
      ...defaultJobOptions,
      repeat: {
        cron: '0 2 * * *', // Run daily at 2 AM
      },
    }
  );
  logger.info('Obstacle expiration job scheduled (daily at 2 AM)');
}

// Error handlers
obstacleExpirationQueue.on('error', (error) => {
  logger.error('Obstacle expiration queue error', { error: error.message });
});

obstacleExpirationQueue.on('failed', (job, error) => {
  logger.error('Obstacle expiration job failed', {
    jobId: job.id,
    error: error.message,
  });
});

obstacleExpirationQueue.on('completed', (job, result) => {
  logger.info('Obstacle expiration job completed', {
    jobId: job.id,
    result,
  });
});

module.exports = {
  scheduleExpirationJob,
};
