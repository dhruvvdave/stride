-- Add confidence and lifecycle fields to obstacles table
ALTER TABLE obstacles ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100);
ALTER TABLE obstacles ADD COLUMN IF NOT EXISTS confirmations_count INTEGER DEFAULT 0 CHECK (confirmations_count >= 0);
ALTER TABLE obstacles ADD COLUMN IF NOT EXISTS disputes_count INTEGER DEFAULT 0 CHECK (disputes_count >= 0);
ALTER TABLE obstacles ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMP DEFAULT NOW();
ALTER TABLE obstacles ADD COLUMN IF NOT EXISTS geohash VARCHAR(12);
ALTER TABLE obstacles ADD COLUMN IF NOT EXISTS municipal_confirmed BOOLEAN DEFAULT FALSE;

-- Update existing status column to support new states if needed
-- The status column already exists from migration 002, but we may need to adjust constraints
-- For now, we'll work with the existing 'active', 'fixed', 'disputed' states

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_obstacles_confidence_score ON obstacles(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_obstacles_geohash ON obstacles(geohash);
CREATE INDEX IF NOT EXISTS idx_obstacles_last_confirmed_at ON obstacles(last_confirmed_at DESC);
CREATE INDEX IF NOT EXISTS idx_obstacles_municipal_confirmed ON obstacles(municipal_confirmed);

-- Comment on new columns
COMMENT ON COLUMN obstacles.confidence_score IS 'Confidence score (0-100) based on confirmations, reporter trust, disputes, age, photos, and municipal data';
COMMENT ON COLUMN obstacles.confirmations_count IS 'Number of confirmations from other users';
COMMENT ON COLUMN obstacles.disputes_count IS 'Number of disputes from users';
COMMENT ON COLUMN obstacles.last_confirmed_at IS 'Timestamp of last confirmation';
COMMENT ON COLUMN obstacles.geohash IS 'Geohash for spatial indexing and clustering';
COMMENT ON COLUMN obstacles.municipal_confirmed IS 'Whether obstacle has been confirmed by municipal API data';
