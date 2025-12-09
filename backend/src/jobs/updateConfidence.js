/**
 * Update Confidence Job
 * Recalculate confidence scores for all active obstacles daily
 */

const { confidenceUpdateQueue, defaultJobOptions } = require('../config/queue');
const { updateConfidenceScore } = require('../services/confidenceScore');
const db = require('../config/database');
const { logger } = require('../api/middleware/errorHandler');

/**
 * Process confidence score updates
 */
confidenceUpdateQueue.process(async (job) => {
  logger.info('Starting confidence update job');
  
  const stats = {
    processed: 0,
    updated: 0,
    errors: 0,
  };

  try {
    // Get all active obstacles
    const result = await db.query(
      'SELECT id FROM obstacles WHERE status = \'active\''
    );

    for (const obstacle of result.rows) {
      try {
        stats.processed++;
        await updateConfidenceScore(obstacle.id);
        stats.updated++;
      } catch (error) {
        logger.error(`Error updating confidence for obstacle ${obstacle.id}`, {
          error: error.message,
        });
        stats.errors++;
      }
    }

    logger.info('Confidence update job completed', stats);
    return stats;
  } catch (error) {
    logger.error('Confidence update job failed', { error: error.message });
    throw error;
  }
});

/**
 * Add confidence update job to queue
 * @returns {Promise<void>}
 */
async function scheduleConfidenceUpdateJob() {
  await confidenceUpdateQueue.add(
    {},
    {
      ...defaultJobOptions,
      repeat: {
        cron: '0 3 * * *', // Run daily at 3 AM
      },
    }
  );
  logger.info('Confidence update job scheduled (daily at 3 AM)');
}

// Error handlers
confidenceUpdateQueue.on('error', (error) => {
  logger.error('Confidence update queue error', { error: error.message });
});

confidenceUpdateQueue.on('failed', (job, error) => {
  logger.error('Confidence update job failed', {
    jobId: job.id,
    error: error.message,
  });
});

confidenceUpdateQueue.on('completed', (job, result) => {
  logger.info('Confidence update job completed', {
    jobId: job.id,
    result,
  });
});

module.exports = {
  scheduleConfidenceUpdateJob,
};
