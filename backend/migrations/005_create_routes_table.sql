-- Create routes table for route history
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin GEOGRAPHY(Point, 4326) NOT NULL,
  destination GEOGRAPHY(Point, 4326) NOT NULL,
  geometry GEOGRAPHY(LineString, 4326) NOT NULL,
  smoothness_score INTEGER NOT NULL CHECK (smoothness_score >= 0 AND smoothness_score <= 100),
  obstacle_count INTEGER DEFAULT 0 CHECK (obstacle_count >= 0),
  distance_meters INTEGER NOT NULL CHECK (distance_meters > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  detour_meters INTEGER DEFAULT 0 CHECK (detour_meters >= 0),
  route_type VARCHAR(20) NOT NULL CHECK (route_type IN ('smooth', 'standard', 'fastest')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial indexes for performance
CREATE INDEX idx_routes_origin ON routes USING GIST(origin);
CREATE INDEX idx_routes_destination ON routes USING GIST(destination);
CREATE INDEX idx_routes_geometry ON routes USING GIST(geometry);

-- Create indexes for filtering and sorting
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_route_type ON routes(route_type);
CREATE INDEX idx_routes_smoothness_score ON routes(smoothness_score DESC);
CREATE INDEX idx_routes_created_at ON routes(created_at DESC);
