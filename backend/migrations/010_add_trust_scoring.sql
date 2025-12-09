-- Add trust scoring fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reports_verified INTEGER DEFAULT 0 CHECK (reports_verified >= 0);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reports_disputed INTEGER DEFAULT 0 CHECK (reports_disputed >= 0);

-- Create index for trust score queries
CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score DESC);

-- Comment on new columns
COMMENT ON COLUMN users.trust_score IS 'User trust score (0-100) based on account age, verified reports, and accuracy';
COMMENT ON COLUMN users.reports_verified IS 'Count of user reports that have been verified by the community';
COMMENT ON COLUMN users.reports_disputed IS 'Count of user reports that have been disputed by the community';
