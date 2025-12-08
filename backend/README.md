# Stride Backend API

Production-ready backend API for Stride navigation app with complete authentication, database schema, and API endpoints.

## 🎯 Overview

Stride is a navigation app that helps drivers avoid road obstacles and find the smoothest routes. This backend provides:

- JWT-based authentication system
- PostGIS spatial queries for obstacle management
- Advanced routing engine with obstacle avoidance
- Gamification system with points and achievements
- Premium features (vehicle profiles, car clubs)
- Real-time features via Socket.io
- Comprehensive RESTful API

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+ with PostGIS extension
- **Cache**: Redis 4+
- **Authentication**: JWT with Passport.js
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Geospatial**: @turf/turf for calculations
- **Real-time**: Socket.io

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 15+ with PostGIS extension
- Redis 4+ (optional but recommended)
- OSRM server (or use public instance)

## 🚀 Getting Started

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stride

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# External APIs
OSRM_API_URL=http://router.project-osrm.org
NOMINATIM_API_URL=https://nominatim.openstreetmap.org
MAPBOX_API_KEY=optional-fallback-key

# File uploads
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@getstride.app

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Payments
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
```

### 3. Database Setup

```bash
# Create database
createdb stride_dev

# Enable PostGIS
psql stride_dev -c "CREATE EXTENSION postgis;"

# Run migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

### 4. Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user profile (requires auth)

#### Users (`/api/users`)

- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile (requires auth)
- `GET /users/:id/stats` - Get user statistics
- `GET /users` - Get leaderboard (paginated)

#### Obstacles (`/api/obstacles`)

- `GET /obstacles` - Get obstacles in bounding box (spatial query)
  - Query params: `minLat`, `maxLat`, `minLng`, `maxLng`, `types[]`, `severity[]`
- `GET /obstacles/:id` - Get obstacle details
- `POST /obstacles` - Create new obstacle (requires auth)
- `PUT /obstacles/:id` - Update obstacle (admin only)
- `DELETE /obstacles/:id` - Delete obstacle (admin only)
- `GET /obstacles/:id/reports` - Get all reports for obstacle

#### Reports (`/api/reports`)

- `POST /reports` - Submit obstacle report (requires auth)
- `GET /reports/user/:userId` - Get user's reports
- `PUT /reports/:id` - Update report (own reports only)
- `DELETE /reports/:id` - Delete report (own reports only)

#### Routes (`/api/routes`)

- `POST /routes/plan` - Calculate routes with obstacle avoidance
- `POST /routes/save` - Save completed route to history (requires auth)
- `GET /routes/history` - Get user's route history (requires auth, paginated)

#### Vehicles (`/api/vehicles`) - Premium Only

- `GET /vehicles` - Get user's vehicles
- `POST /vehicles` - Add vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle
- `PUT /vehicles/:id/activate` - Set as active vehicle

#### Favorites (`/api/favorites`)

- `GET /favorites` - Get user's favorite places (requires auth)
- `POST /favorites` - Add favorite place
- `PUT /favorites/:id` - Update favorite
- `DELETE /favorites/:id` - Delete favorite

#### Gamification

- `GET /leaderboard` - Get top users (query: period, limit, offset)
- `GET /achievements` - Get user's achievements (requires auth)
- `GET /achievements/available` - Get all available badges
- `POST /achievements/check` - Check and award achievements (requires auth)

#### Car Clubs (`/api/clubs`) - Premium Only

- `GET /clubs` - Get all public clubs (paginated)
- `GET /clubs/:id` - Get club details
- `POST /clubs` - Create club (requires premium)
- `PUT /clubs/:id` - Update club (owner/admin only)
- `DELETE /clubs/:id` - Delete club (owner only)
- `POST /clubs/:id/join` - Join club
- `POST /clubs/:id/leave` - Leave club
- `GET /clubs/:id/members` - Get club members

### Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": []
  }
}
```

## 🗄️ Database Schema

### Users Table
- Authentication and user management
- Reputation points and subscription tracking
- Role-based access control

### Obstacles Table
- PostGIS GEOGRAPHY(Point, 4326) for location
- Type: speedbump, pothole, construction, steep_grade, railroad_crossing
- Severity: low, medium, high
- Verification system with status tracking

### Reports Table
- User-submitted obstacle reports
- Photo uploads (URLs array)
- AI sensor data (JSONB)
- Confidence scores

### Vehicles Table (Premium)
- User vehicle profiles
- Ground clearance and suspension type
- Active vehicle selection

### Routes Table
- Route history with full geometry
- Smoothness scoring (0-100)
- PostGIS GEOGRAPHY(LineString, 4326)

### Favorites Table
- Saved locations with PostGIS Point
- Named places (Home, Work, etc.)

### Achievements Table
- Gamification badges
- Auto-awarded based on user activity

### Car Clubs Tables (Premium)
- Club management
- Member roles and permissions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Test files are located in `src/tests/`:
- `auth.test.js` - Authentication flow tests
- `obstacles.test.js` - CRUD and spatial query tests
- `routing.test.js` - Route calculation tests
- `premium.test.js` - Premium feature gate tests

## 🔒 Security Features

- bcryptjs password hashing (10 rounds)
- JWT token authentication
- Rate limiting (100 req/15min)
- Helmet.js security headers
- CORS configuration
- Input validation with Joi
- SQL injection prevention (parameterized queries)

## 🎮 Gamification System

### Points System

- New obstacle report: **50 points**
- Confirm obstacle: **10 points**
- Photo upload: **+5 points**
- Route completion: **2 points** + distance bonus
- Verified obstacle bonus: **20 points**

### Achievements

- **Early Adopter** - First 1000 users
- **Explorer** - 100km navigated
- **Reporter** - 10 reports submitted
- **Photographer** - 10 photos uploaded
- **Top Contributor** - Top 100 monthly
- **Community Leader** - 1000+ reputation points

### User Levels

1. Rookie (0 pts)
2. Navigator (100 pts)
3. Explorer (250 pts)
4. Pathfinder (500 pts)
5. Road Warrior (1000 pts)
6. Route Master (2500 pts)
7. Legend (5000 pts)

## 🚗 Routing Algorithm

1. Call OSRM for base routes
2. Query obstacles along route (100m buffer)
3. Calculate smoothness score:
   ```
   score = 100 - (high_severity * 10 + medium_severity * 5 + low_severity * 2)
   ```
4. Generate 3 route alternatives:
   - **Smooth route**: Avoid all obstacles (max detour: 20%)
   - **Standard route**: Avoid high severity only
   - **Fastest route**: Ignore obstacles
5. Premium users: Factor in vehicle ground clearance

## 📊 Performance Optimizations

- PostGIS spatial indexes (GIST) on all geography columns
- Composite indexes for common queries
- Database connection pooling (max 20 connections)
- Redis caching for frequently accessed data
- Paginated responses for large datasets

## 🔄 Database Migrations

Migration files are in `backend/migrations/`:

```
001_create_users_table.sql
002_create_obstacles_table.sql
003_create_reports_table.sql
004_create_vehicles_table.sql
005_create_routes_table.sql
006_create_favorites_table.sql
007_create_achievements_table.sql
008_create_car_clubs_tables.sql
009_create_indexes.sql
```

Run migrations with: `npm run migrate`

## 🌱 Seed Data

The seed script creates:
- 5 sample users (1 admin, 2 premium, 2 free)
- 100 sample obstacles in Toronto area
- 50 sample reports
- Sample vehicles, favorites, and car clubs

Run seed with: `npm run seed`

Test login credentials:
- Admin: `admin@stride.app` / `password123`
- Premium: `premium1@example.com` / `password123`
- Free: `user1@example.com` / `password123`

## 📝 Development Commands

```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
npm run migrate      # Run database migrations
npm run seed         # Seed sample data
npm run lint         # Run ESLint
```

## 🐳 Docker Support

Coming soon: Docker Compose configuration for easy local development.

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up Redis for caching
5. Configure CORS for production domain
6. Set up Sentry for error tracking
7. Configure Stripe for payments

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis connected
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Error tracking (Sentry)
- [ ] Health checks configured
- [ ] Backup strategy in place

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## 📧 Support

For issues and questions, please use the GitHub issue tracker.
