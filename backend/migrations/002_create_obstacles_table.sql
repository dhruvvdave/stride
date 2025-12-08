-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create obstacles table with spatial data
CREATE TABLE IF NOT EXISTS obstacles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('speedbump', 'pothole', 'construction', 'steep_grade', 'railroad_crossing')),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  verified BOOLEAN DEFAULT FALSE,
  verification_count INTEGER DEFAULT 1 CHECK (verification_count >= 0),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fixed', 'disputed')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_verified_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index on location for performance
CREATE INDEX idx_obstacles_location ON obstacles USING GIST(location);

-- Create indexes for filtering
CREATE INDEX idx_obstacles_type ON obstacles(type);
CREATE INDEX idx_obstacles_severity ON obstacles(severity);
CREATE INDEX idx_obstacles_status ON obstacles(status);
CREATE INDEX idx_obstacles_verified ON obstacles(verified);
CREATE INDEX idx_obstacles_created_by ON obstacles(created_by);
CREATE INDEX idx_obstacles_created_at ON obstacles(created_at DESC);

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_obstacles_updated_at BEFORE UPDATE ON obstacles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
