/**
 * Bull Queue Configuration
 * Handles background job processing
 */

const Queue = require('bull');
require('dotenv').config();

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

// Create queues
const confidenceUpdateQueue = new Queue('confidence-update', redisConfig);
const obstacleExpirationQueue = new Queue('obstacle-expiration', redisConfig);

// Queue options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 200, // Keep last 200 failed jobs
};

module.exports = {
  confidenceUpdateQueue,
  obstacleExpirationQueue,
  defaultJobOptions,
};
