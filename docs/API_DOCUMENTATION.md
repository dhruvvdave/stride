# API Documentation

This document provides comprehensive API documentation for the Stride backend API.

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.stride.app/api/v1
```

## Authentication

Stride uses JWT (JSON Web Tokens) for authentication.

### Authentication Flow

1. User registers or logs in
2. Server returns access token (15min) and refresh token (7d)
3. Client includes access token in Authorization header
4. When access token expires, use refresh token to get new access token

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "driver123",
  "full_name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "driver123",
      "full_name": "John Doe",
      "is_premium": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    }
  }
}
```

**Validation Rules**:
- Email: Valid email format, unique
- Password: Min 8 characters, must include uppercase, lowercase, number
- Username: 3-50 characters, alphanumeric + underscore, unique
- Full name: Optional, max 100 characters

### Login

Authenticate existing user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "driver123",
      "is_premium": true,
      "premium_expires_at": "2025-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    }
  }
}
```

### Refresh Token

Get new access token using refresh token.

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

### Logout

Invalidate current tokens.

**Endpoint**: `POST /auth/logout`

**Headers**: Requires authentication

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Headers**: Requires authentication

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "driver123",
    "full_name": "John Doe",
    "avatar_url": "https://cdn.stride.app/avatars/123.jpg",
    "is_premium": true,
    "premium_expires_at": "2025-01-15T10:30:00Z",
    "reputation_score": 850,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## User Endpoints

### Get User Profile

Get public profile of any user.

**Endpoint**: `GET /users/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "driver123",
    "avatar_url": "https://cdn.stride.app/avatars/123.jpg",
    "is_premium": true,
    "reputation_score": 850,
    "joined_at": "2024-01-15T10:30:00Z",
    "stats": {
      "obstacles_reported": 45,
      "trips_completed": 230,
      "contributions_upvoted": 380
    }
  }
}
```

### Update User Profile

Update authenticated user's profile.

**Endpoint**: `PATCH /users/:id`

**Headers**: Requires authentication (own profile only)

**Request Body**:
```json
{
  "full_name": "John Smith",
  "avatar_url": "https://cdn.stride.app/avatars/new.jpg"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "driver123",
    "full_name": "John Smith",
    "avatar_url": "https://cdn.stride.app/avatars/new.jpg"
  }
}
```

## Navigation Endpoints

### Get Route

Calculate route with obstacle avoidance.

**Endpoint**: `POST /navigation/route`

**Headers**: Requires authentication

**Request Body**:
```json
{
  "start": {
    "lat": 43.6532,
    "lon": -79.3832
  },
  "end": {
    "lat": 43.7184,
    "lon": -79.5181
  },
  "vehicle_id": "123e4567-e89b-12d3-a456-426614174000",
  "preferences": {
    "avoid_obstacles": true,
    "obstacle_types": ["speed_bump", "pothole"],
    "max_severity": 3,
    "route_type": "smoothest"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "route_id": "789e4567-e89b-12d3-a456-426614174999",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-79.3832, 43.6532],
        [-79.3840, 43.6545],
        // ... more coordinates
        [-79.5181, 43.7184]
      ]
    },
    "distance_meters": 15420,
    "duration_seconds": 1260,
    "obstacles_avoided": 8,
    "steps": [
      {
        "instruction": "Head north on Bay St",
        "distance_meters": 350,
        "duration_seconds": 45
      },
      {
        "instruction": "Turn right onto Bloor St W",
        "distance_meters": 1200,
        "duration_seconds": 180
      }
      // ... more steps
    ],
    "obstacles_on_route": [
      {
        "id": "obstacle-123",
        "type": "speed_bump",
        "severity": 2,
        "location": {
          "lat": 43.6700,
          "lon": -79.4000
        },
        "distance_from_start": 4500
      }
    ],
    "alternative_routes": [
      {
        "route_id": "alt-1",
        "distance_meters": 16200,
        "duration_seconds": 1320,
        "obstacles_avoided": 12
      }
    ]
  }
}
```

### Get Directions

Get turn-by-turn directions for a route.

**Endpoint**: `GET /navigation/directions/:route_id`

**Headers**: Requires authentication

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "route_id": "789e4567-e89b-12d3-a456-426614174999",
    "steps": [
      {
        "step_number": 1,
        "instruction": "Head north on Bay St",
        "distance_meters": 350,
        "duration_seconds": 45,
        "location": {
          "lat": 43.6532,
          "lon": -79.3832
        },
        "maneuver": "straight"
      }
      // ... more steps
    ]
  }
}
```

## Obstacle Endpoints

### List Obstacles

Get obstacles within a bounding box.

**Endpoint**: `GET /obstacles`

**Query Parameters**:
- `bbox`: Bounding box (minLon,minLat,maxLon,maxLat)
- `type`: Filter by type (optional)
- `severity`: Min severity 1-5 (optional)
- `status`: active, resolved, disputed (default: active)
- `limit`: Results per page (default: 100, max: 500)
- `offset`: Pagination offset (default: 0)

**Example**:
```
GET /obstacles?bbox=-79.5,-43.7,-79.3,43.8&type=pothole&severity=3
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "obstacles": [
      {
        "id": "obstacle-123",
        "type": "pothole",
        "location": {
          "lat": 43.6532,
          "lon": -79.3832
        },
        "severity": 4,
        "description": "Large pothole on right lane",
        "image_url": "https://cdn.stride.app/obstacles/123.jpg",
        "votes_up": 45,
        "votes_down": 3,
        "confidence_score": 0.92,
        "is_verified": true,
        "status": "active",
        "reported_by": {
          "id": "user-123",
          "username": "driver123",
          "is_premium": true
        },
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-16T14:20:00Z"
      }
      // ... more obstacles
    ],
    "pagination": {
      "total": 234,
      "limit": 100,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### Create Obstacle

Report a new obstacle.

**Endpoint**: `POST /obstacles`

**Headers**: Requires authentication

**Request Body**:
```json
{
  "type": "speed_bump",
  "location": {
    "lat": 43.6532,
    "lon": -79.3832
  },
  "severity": 3,
  "description": "Speed bump before intersection",
  "image_url": "https://cdn.stride.app/temp/upload123.jpg"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "obstacle-456",
    "type": "speed_bump",
    "location": {
      "lat": 43.6532,
      "lon": -79.3832
    },
    "severity": 3,
    "description": "Speed bump before intersection",
    "image_url": "https://cdn.stride.app/obstacles/456.jpg",
    "votes_up": 0,
    "votes_down": 0,
    "confidence_score": 0.5,
    "is_verified": false,
    "status": "active",
    "reported_by": {
      "id": "user-123",
      "username": "driver123"
    },
    "created_at": "2024-01-20T15:45:00Z"
  }
}
```

### Vote on Obstacle

Upvote or downvote an obstacle.

**Endpoint**: `POST /obstacles/:id/vote`

**Headers**: Requires authentication

**Request Body**:
```json
{
  "vote_type": "up"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "obstacle_id": "obstacle-123",
    "votes_up": 46,
    "votes_down": 3,
    "user_vote": "up"
  }
}
```

### Confirm Obstacle

Confirm obstacle is still present.

**Endpoint**: `POST /obstacles/:id/confirm`

**Headers**: Requires authentication

**Request Body**:
```json
{
  "still_there": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "obstacle_id": "obstacle-123",
    "confirmations_count": 12,
    "last_confirmed": "2024-01-20T16:00:00Z"
  }
}
```

## Vehicle Endpoints

### List Vehicles

Get user's vehicles.

**Endpoint**: `GET /vehicles`

**Headers**: Requires authentication

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle-123",
      "name": "My Honda Civic",
      "vehicle_type": "sedan",
      "ground_clearance_mm": 133,
      "suspension_type": "lowered",
      "is_default": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "vehicle-456",
      "name": "Weekend SUV",
      "vehicle_type": "suv",
      "ground_clearance_mm": 220,
      "suspension_type": "stock",
      "is_default": false,
      "created_at": "2024-02-01T14:20:00Z"
    }
  ]
}
```

### Create Vehicle

Add a new vehicle profile (premium feature).

**Endpoint**: `POST /vehicles`

**Headers**: Requires authentication (premium only)

**Request Body**:
```json
{
  "name": "My Honda Civic",
  "vehicle_type": "sedan",
  "ground_clearance_mm": 133,
  "suspension_type": "lowered",
  "is_default": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "vehicle-123",
    "name": "My Honda Civic",
    "vehicle_type": "sedan",
    "ground_clearance_mm": 133,
    "suspension_type": "lowered",
    "is_default": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Analytics Endpoints

### Get Trip History

Get user's trip history.

**Endpoint**: `GET /analytics/trips`

**Headers**: Requires authentication

**Query Parameters**:
- `start_date`: ISO 8601 date (optional)
- `end_date`: ISO 8601 date (optional)
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "trip-123",
        "vehicle_id": "vehicle-123",
        "start_location": {
          "lat": 43.6532,
          "lon": -79.3832,
          "address": "123 Bay St, Toronto"
        },
        "end_location": {
          "lat": 43.7184,
          "lon": -79.5181,
          "address": "456 Bloor St W, Toronto"
        },
        "distance_meters": 15420,
        "duration_seconds": 1260,
        "obstacles_avoided": 8,
        "started_at": "2024-01-20T09:00:00Z",
        "ended_at": "2024-01-20T09:21:00Z"
      }
      // ... more trips
    ],
    "pagination": {
      "total": 230,
      "limit": 50,
      "offset": 0
    }
  }
}
```

### Get Analytics Summary

Get summary statistics (premium feature).

**Endpoint**: `GET /analytics/summary`

**Headers**: Requires authentication (premium only)

**Query Parameters**:
- `period`: week, month, year, all (default: month)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "period": "month",
    "total_trips": 45,
    "total_distance_km": 523.4,
    "total_duration_hours": 18.5,
    "obstacles_avoided": 178,
    "most_used_vehicle": {
      "id": "vehicle-123",
      "name": "My Honda Civic"
    },
    "favorite_routes": [
      {
        "start": "Home",
        "end": "Work",
        "count": 20
      }
    ],
    "time_saved_estimate_minutes": 145,
    "fuel_saved_estimate_liters": 2.3
  }
}
```

## Error Responses

All error responses follow this format:

**Response** (4xx or 5xx):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API requests are rate limited per user:

- **Free tier**: 100 requests/hour
- **Premium tier**: 1000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642675200
```

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `limit`: Results per page (default varies by endpoint)
- `offset`: Number of items to skip

**Response includes**:
```json
{
  "pagination": {
    "total": 234,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

## Filtering & Sorting

Many endpoints support filtering:

**Common filters**:
- `type`: Filter by type
- `status`: Filter by status
- `created_after`: ISO 8601 timestamp
- `created_before`: ISO 8601 timestamp

**Sorting**:
- `sort_by`: Field to sort by
- `sort_order`: asc or desc

Example:
```
GET /obstacles?type=pothole&sort_by=created_at&sort_order=desc
```

## WebSocket API

Real-time updates via WebSocket at `wss://api.stride.app/ws`

### Authentication

Send auth message after connection:
```json
{
  "type": "auth",
  "token": "access_token_here"
}
```

### Subscribe to Location Updates

```json
{
  "type": "subscribe",
  "channel": "location",
  "bbox": [-79.5, 43.6, -79.3, 43.8]
}
```

### Receive Obstacle Updates

```json
{
  "type": "obstacle:new",
  "data": {
    "id": "obstacle-789",
    "type": "pothole",
    "location": {
      "lat": 43.6532,
      "lon": -79.3832
    },
    "severity": 4
  }
}
```

## Versioning

The API uses URL versioning:
- Current: `/api/v1`
- Future: `/api/v2` (when v1 is deprecated)

Old versions supported for 6 months after new version release.

## SDKs & Libraries

Official SDKs (coming soon):
- JavaScript/TypeScript
- Swift (iOS)
- Kotlin (Android)

## Support

- Documentation: https://docs.stride.app
- API Status: https://status.stride.app
- Support: support@stride.app
- GitHub: https://github.com/dhruvvdave/stride
