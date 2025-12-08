const redis = require('redis');
require('dotenv').config();

let redisClient = null;

async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return null;
  }
}

async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
}

module.exports = {
  getRedisClient,
  closeRedisClient,
};
