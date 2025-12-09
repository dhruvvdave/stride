const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../../config/redis');

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter - 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload rate limiter - 10 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      message: 'Too many uploads, please try again later.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Report rate limiter - Dynamic based on subscription
 * Free: 5 reports per day
 * Premium: 20 reports per day
 * 
 * Initialize this as a middleware during app startup
 */
let reportLimiter;

async function initializeReportLimiter() {
  let store;
  
  try {
    const redisClient = await getRedisClient();
    if (redisClient) {
      // Use Redis store for distributed rate limiting
      store = new RedisStore({
        client: redisClient,
        prefix: 'rl:reports:',
      });
    }
  } catch (error) {
    console.warn('Redis not available for rate limiting, using memory store');
  }

  reportLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: async (req) => {
      // Check user subscription status
      if (!req.user) {
        return 5; // Anonymous users get free tier limit
      }

      const isPremium = req.user.subscription_status === 'premium' || 
                       req.user.subscription_status === 'premium_annual' ||
                       req.user.role === 'admin';

      return isPremium ? 20 : 5;
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    message: {
      success: false,
      error: {
        message: 'Daily report limit reached. Upgrade to premium for more reports.',
        code: 'REPORT_LIMIT_EXCEEDED',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    store,
  });

  return reportLimiter;
}

// Getter function for the report limiter
function getReportLimiter() {
  if (!reportLimiter) {
    throw new Error('Report limiter not initialized. Call initializeReportLimiter() first.');
  }
  return reportLimiter;
}

module.exports = { 
  apiLimiter, 
  authLimiter, 
  uploadLimiter,
  initializeReportLimiter,
  getReportLimiter,
};
