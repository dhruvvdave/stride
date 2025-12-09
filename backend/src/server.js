const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import configurations
const db = require('./config/database');
const { getRedisClient } = require('./config/redis');
const passport = require('./config/passport');

// Import middleware
const { errorHandler, notFoundHandler, logger } = require('./api/middleware/errorHandler');
const { apiLimiter, initializeReportLimiter } = require('./api/middleware/rateLimiter');

// Import routes
const authRoutes = require('./api/routes/auth');
const userRoutes = require('./api/routes/users');
const obstacleRoutes = require('./api/routes/obstacles');
const reportRoutes = require('./api/routes/reports');
const routeRoutes = require('./api/routes/routes');
const vehicleRoutes = require('./api/routes/vehicles');
const favoriteRoutes = require('./api/routes/favorites');
const gamificationRoutes = require('./api/routes/gamification');
const clubRoutes = require('./api/routes/clubs');
const adminRoutes = require('./api/routes/admin');

// Import jobs
const { initializeJobs } = require('./jobs');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time features
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('New socket connection', { socketId: socket.id });

  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { socketId: socket.id });
  });
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stride API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API welcome endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Stride API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      obstacles: '/api/obstacles',
      reports: '/api/reports',
      routes: '/api/routes',
      vehicles: '/api/vehicles',
      favorites: '/api/favorites',
      leaderboard: '/api/leaderboard',
      achievements: '/api/achievements',
      clubs: '/api/clubs',
      admin: '/api/admin',
    },
  });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/obstacles', obstacleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/leaderboard', gamificationRoutes);
app.use('/api/achievements', gamificationRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize connections
async function initializeConnections() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('✅ Database connected successfully');

    // Initialize Redis (optional, won't fail if unavailable)
    try {
      await getRedisClient();
    } catch (redisError) {
      logger.warn('⚠️  Redis connection failed (optional)', { error: redisError.message });
    }

    // Initialize report limiter
    try {
      await initializeReportLimiter();
      logger.info('✅ Report rate limiter initialized');
    } catch (limiterError) {
      logger.warn('⚠️  Report limiter initialization failed', { error: limiterError.message });
    }

    // Initialize background jobs
    try {
      await initializeJobs();
    } catch (jobError) {
      logger.warn('⚠️  Background jobs initialization failed (optional)', { error: jobError.message });
    }
  } catch (error) {
    logger.error('❌ Failed to initialize connections', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database pool
    await db.pool.end();
    logger.info('Database pool closed');
    
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database pool
    await db.pool.end();
    logger.info('Database pool closed');
    
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  initializeConnections().then(() => {
    server.listen(PORT, () => {
      logger.info(`🚗 Stride API server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API docs: http://localhost:${PORT}/api`);
    });
  });
}

module.exports = { app, server, io };
