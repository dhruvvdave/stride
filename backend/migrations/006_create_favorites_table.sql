-- Create favorites table for saved places
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_name VARCHAR(255) NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index on location
CREATE INDEX idx_favorites_location ON favorites USING GIST(location);

-- Create indexes for performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- Ensure unique place names per user
CREATE UNIQUE INDEX idx_favorites_user_place ON favorites(user_id, place_name);
