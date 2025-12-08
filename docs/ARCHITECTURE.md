# Technical Architecture

This document describes the technical architecture and infrastructure for Stride.

## System Overview

Stride is built as a distributed system with three main components:
1. **Mobile App** (React Native) - iOS and Android clients
2. **Web App** (React + Vite) - Browser-based interface
3. **Backend API** (Node.js + Express) - Server-side logic and data

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
├───────────────────┬─────────────────────────────────────┤
│   Mobile App      │          Web App                    │
│   (React Native)  │          (React)                    │
│                   │                                      │
│   iOS + Android   │        Desktop/Tablet               │
└─────────┬─────────┴────────────────┬────────────────────┘
          │                          │
          │     HTTPS/WebSocket      │
          │                          │
          └──────────┬───────────────┘
                     │
          ┌──────────▼─────────────┐
          │    Load Balancer       │
          │    (Railway/Cloud)     │
          └──────────┬─────────────┘
                     │
          ┌──────────▼─────────────┐
          │    Backend API         │
          │    (Node.js/Express)   │
          │                        │
          │  - REST endpoints      │
          │  - WebSocket server    │
          │  - Background jobs     │
          └─┬──────────────────┬───┘
            │                  │
    ┌───────▼─────┐    ┌──────▼──────┐
    │  PostgreSQL │    │    Redis    │
    │  + PostGIS  │    │   (Cache)   │
    │  (Primary)  │    │  (Sessions) │
    └─────────────┘    └─────────────┘
```

## Technology Stack

### Mobile (React Native)

#### Core
- **React Native 0.73**: Cross-platform framework
- **React 18.2**: UI library
- **TypeScript**: Type safety (future)

#### Navigation & Maps
- **React Navigation 6**: App navigation
- **React Native Maps**: Map rendering
- **@turf/turf**: Geospatial calculations

#### State Management
- **Redux Toolkit 2.0**: Global state
- **Redux Persist**: State persistence
- **RTK Query**: API calls and caching

#### Sensors & Hardware
- **react-native-geolocation-service**: GPS
- **react-native-sensors**: Accelerometer/gyroscope
- **react-native-voice**: Voice commands

#### Storage & Network
- **Async Storage**: Local storage
- **Axios**: HTTP client
- **Socket.io Client**: Real-time updates

#### UI Components
- **react-native-vector-icons**: Icon library
- **react-native-gesture-handler**: Touch gestures
- **react-native-reanimated**: Animations

### Backend (Node.js)

#### Core
- **Node.js 18+**: Runtime
- **Express 4**: Web framework
- **TypeScript**: Type safety (future migration)

#### Database
- **PostgreSQL 15**: Primary database
- **PostGIS**: Geospatial extension
- **pg**: PostgreSQL client
- **Knex/TypeORM**: Query builder (future)

#### Caching & Sessions
- **Redis 4**: Cache and session store
- **ioredis**: Redis client

#### Authentication & Security
- **Passport.js**: Authentication middleware
- **passport-jwt**: JWT strategy
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin config
- **express-rate-limit**: Rate limiting

#### Geospatial
- **@turf/turf**: Geospatial operations
- **node-geocoder**: Geocoding
- **geolib**: Distance calculations

#### Utilities
- **Joi**: Request validation
- **Winston**: Logging
- **Morgan**: HTTP logging
- **node-cron**: Scheduled tasks
- **dotenv**: Environment config

#### Real-time
- **Socket.io**: WebSocket server

#### External Services
- **Axios**: HTTP client
- **Nodemailer**: Email sending
- **Cloudinary**: Image storage

#### Testing
- **Jest**: Test framework
- **Supertest**: API testing
- **Faker**: Test data generation

### Web (React)

#### Core
- **React 18**: UI library
- **Vite 5**: Build tool
- **TypeScript**: Type safety (future)

#### Routing & State
- **React Router 6**: Client-side routing
- **Redux Toolkit**: State management
- **RTK Query**: API integration

#### Maps
- **Leaflet**: Map library
- **react-leaflet**: React bindings

#### Styling
- **TailwindCSS 3**: Utility-first CSS
- **PostCSS**: CSS processing
- **Autoprefixer**: Browser compatibility

#### Utilities
- **Axios**: HTTP client
- **date-fns**: Date utilities
- **clsx**: Conditional classes

#### Testing
- **Vitest**: Test framework
- **Testing Library**: Component testing

## API Structure

### REST API Design

Base URL: `https://api.stride.app/v1`

#### Endpoint Categories

1. **Authentication** (`/auth`)
   - POST /auth/register
   - POST /auth/login
   - POST /auth/logout
   - POST /auth/refresh
   - GET /auth/me

2. **Users** (`/users`)
   - GET /users/:id
   - PATCH /users/:id
   - DELETE /users/:id
   - GET /users/:id/stats
   - GET /users/:id/vehicles

3. **Navigation** (`/navigation`)
   - POST /navigation/route
   - GET /navigation/route/:id
   - POST /navigation/route/optimize
   - GET /navigation/directions

4. **Obstacles** (`/obstacles`)
   - GET /obstacles (query by bbox, type, severity)
   - POST /obstacles
   - GET /obstacles/:id
   - PATCH /obstacles/:id
   - DELETE /obstacles/:id
   - POST /obstacles/:id/vote
   - POST /obstacles/:id/confirm

5. **Reports** (`/reports`)
   - GET /reports
   - POST /reports
   - GET /reports/:id
   - PATCH /reports/:id/status

6. **Analytics** (`/analytics`)
   - GET /analytics/trips
   - GET /analytics/summary
   - GET /analytics/export

7. **Vehicles** (`/vehicles`)
   - GET /vehicles
   - POST /vehicles
   - GET /vehicles/:id
   - PATCH /vehicles/:id
   - DELETE /vehicles/:id

### WebSocket Events

#### Client → Server
- `location:update` - Real-time location
- `navigation:start` - Start navigation
- `navigation:stop` - Stop navigation
- `obstacle:detected` - AI detection event

#### Server → Client
- `obstacle:new` - New obstacle nearby
- `obstacle:updated` - Obstacle updated
- `route:traffic` - Traffic update
- `system:message` - System notifications

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### obstacles
```sql
CREATE TABLE obstacles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- speed_bump, pothole, etc.
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  description TEXT,
  image_url TEXT,
  reported_by UUID REFERENCES users(id),
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  confidence_score FLOAT DEFAULT 0.5,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active', -- active, resolved, disputed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_obstacles_location ON obstacles USING GIST(location);
CREATE INDEX idx_obstacles_type ON obstacles(type);
CREATE INDEX idx_obstacles_status ON obstacles(status);
```

#### vehicles
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(50), -- sedan, suv, truck, sports
  ground_clearance_mm INTEGER,
  suspension_type VARCHAR(50), -- stock, lowered, coilovers
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_user ON vehicles(user_id);
```

#### trips
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  start_location GEOGRAPHY(POINT, 4326),
  end_location GEOGRAPHY(POINT, 4326),
  route_geometry GEOGRAPHY(LINESTRING, 4326),
  distance_meters INTEGER,
  duration_seconds INTEGER,
  obstacles_avoided INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_started ON trips(started_at);
```

#### obstacle_votes
```sql
CREATE TABLE obstacle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obstacle_id UUID REFERENCES obstacles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(obstacle_id, user_id)
);

CREATE INDEX idx_votes_obstacle ON obstacle_votes(obstacle_id);
CREATE INDEX idx_votes_user ON obstacle_votes(user_id);
```

#### obstacle_confirmations
```sql
CREATE TABLE obstacle_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obstacle_id UUID REFERENCES obstacles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  still_there BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(obstacle_id, user_id, created_at::date)
);
```

### Geospatial Queries

Example PostGIS queries:

```sql
-- Find obstacles within bounding box
SELECT * FROM obstacles
WHERE location && ST_MakeEnvelope(
  :minLon, :minLat, :maxLon, :maxLat, 4326
)
AND status = 'active';

-- Find obstacles near route
SELECT o.* FROM obstacles o
WHERE ST_DWithin(
  o.location,
  ST_GeomFromText('LINESTRING(...)', 4326)::geography,
  100 -- meters
)
AND status = 'active';

-- Calculate route distance
SELECT ST_Length(
  ST_GeomFromText('LINESTRING(...)', 4326)::geography
) as distance_meters;
```

## Infrastructure

### Development Environment

```yaml
Local Development Stack:
  - PostgreSQL 15 + PostGIS (Docker)
  - Redis 7 (Docker)
  - Node.js 18+
  - React Native development environment
  - Xcode (iOS) / Android Studio (Android)
```

### Production Environment

#### Option 1: Railway (Recommended)

**Backend**:
- Railway app for Node.js backend
- Railway PostgreSQL plugin (PostGIS)
- Railway Redis plugin
- Auto-deploy from GitHub
- Environment variable management

**Pricing**: 
- Starter: $5/month
- Developer: $20/month (recommended)

#### Option 2: Self-Hosted

**Backend**:
- DigitalOcean/Linode VPS
- Docker containers
- Nginx reverse proxy
- Let's Encrypt SSL

**Database**:
- Managed PostgreSQL (DigitalOcean/AWS RDS)
- Self-hosted Redis (Docker)

#### Web Hosting: Vercel

- Free tier for hobby projects
- Auto-deploy from GitHub
- Global CDN
- SSL included
- Serverless functions (if needed)

#### Alternative Database: Supabase

- Managed PostgreSQL + PostGIS
- Built-in auth
- Real-time subscriptions
- Storage for images
- Free tier available

### CDN & Assets

**Cloudinary**:
- Image uploads and optimization
- Transformations (resize, crop)
- Free tier: 25GB storage, 25GB bandwidth

**Alternative - Supabase Storage**:
- File storage
- CDN delivery
- Built-in with Supabase

### Monitoring & Error Tracking

**Sentry**:
- Error tracking
- Performance monitoring
- Free tier for small projects

**Logging**:
- Winston (application logs)
- Morgan (HTTP logs)
- Cloud provider logs (Railway/Vercel)

### CI/CD Pipeline

**GitHub Actions**:
```yaml
- Lint and test on PR
- Auto-deploy to staging on merge to develop
- Auto-deploy to production on release tag
- Build and store mobile app artifacts
```

## Security Considerations

### Authentication
- JWT tokens with short expiration (15 min)
- Refresh tokens (7 days)
- Secure httpOnly cookies
- Password requirements (min 8 chars, complexity)

### Authorization
- Role-based access control (RBAC)
- Premium feature checks
- Rate limiting per user/IP
- API key rotation

### Data Protection
- Encryption at rest (database)
- Encryption in transit (HTTPS/WSS)
- PII hashing where appropriate
- GDPR compliance (data export/deletion)

### API Security
- Helmet.js security headers
- CORS configuration
- Input validation (Joi)
- SQL injection prevention (parameterized queries)
- XSS protection

### Mobile Security
- Certificate pinning
- Secure storage (Keychain/Keystore)
- Code obfuscation
- Jailbreak/root detection

## Performance Optimization

### Backend
- Redis caching (routes, user data)
- Database indexing (geospatial, foreign keys)
- Connection pooling
- Query optimization
- Horizontal scaling (multiple instances)

### Database
- PostGIS spatial indexes
- Partitioning (large tables)
- Read replicas (future)
- Regular VACUUM and ANALYZE

### API
- Response compression (gzip)
- Pagination (limit/offset)
- Field filtering (GraphQL future consideration)
- ETags for caching

### Mobile
- Image lazy loading
- Map tile caching
- Offline mode support
- Background sync
- Battery optimization

### Web
- Code splitting
- Lazy route loading
- Image optimization
- Service worker caching
- CDN for static assets

## Scalability Plan

### Phase 1 (0-10k users)
- Single backend instance
- Single database instance
- Redis cache
- Basic monitoring

### Phase 2 (10k-100k users)
- Multiple backend instances (load balanced)
- Database read replicas
- Separate caching layer
- Enhanced monitoring

### Phase 3 (100k+ users)
- Microservices architecture (routing, obstacles, users)
- Database sharding (by region)
- Message queue (RabbitMQ/SQS)
- Edge caching (CloudFlare)
- Multi-region deployment

## Backup & Disaster Recovery

### Database Backups
- Daily automated backups
- Point-in-time recovery (PITR)
- Backup retention: 30 days
- Offsite backup storage

### Application Backups
- Infrastructure as Code (IaC)
- Docker images versioned
- Environment configs in source control

### Disaster Recovery Plan
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Documented recovery procedures
- Regular DR testing

## Development Workflow

### Branching Strategy
```
main (production)
  └── develop (staging)
       └── feature/* (feature branches)
       └── bugfix/* (bug fixes)
       └── hotfix/* (production fixes)
```

### Environments
1. **Local**: Developer machines
2. **Staging**: develop branch auto-deployed
3. **Production**: main branch, manual release

### Release Process
1. Feature development on feature branches
2. PR to develop with code review
3. Automated tests on PR
4. Merge to develop → staging deployment
5. QA testing on staging
6. Create release PR (develop → main)
7. Final review and merge
8. Tag release (v1.0.0)
9. Production deployment

## Third-Party Services

### Required
- **Map Provider**: OpenStreetMap (free) or Mapbox (paid)
- **Email**: SendGrid or AWS SES
- **Storage**: Cloudinary or Supabase
- **Database**: Railway PostgreSQL or Supabase

### Optional
- **Analytics**: Mixpanel or PostHog
- **Error Tracking**: Sentry
- **Customer Support**: Intercom or Crisp
- **Push Notifications**: Firebase Cloud Messaging

## Cost Estimation

### Monthly Costs (Year 1, <10k users)

| Service | Cost |
|---------|------|
| Railway (Backend + DB) | $20 |
| Redis (Railway) | $5 |
| Cloudinary (Images) | $0 (free tier) |
| Vercel (Web) | $0 (free tier) |
| SendGrid (Email) | $0 (free tier) |
| Domain | $1 |
| **Total** | **~$26/month** |

### Monthly Costs (Year 2, 50k users)

| Service | Cost |
|---------|------|
| Railway (scaled) | $100 |
| Redis | $20 |
| Cloudinary | $50 |
| Vercel | $20 |
| SendGrid | $20 |
| Monitoring/Logs | $20 |
| **Total** | **~$230/month** |

Revenue from 2k premium users: ~$14k/month
Cost ratio: 1.6% of revenue
