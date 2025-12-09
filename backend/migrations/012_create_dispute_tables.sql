-- Create obstacle_disputes table
CREATE TABLE IF NOT EXISTS obstacle_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obstacle_id UUID NOT NULL REFERENCES obstacles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for obstacle_disputes
CREATE INDEX IF NOT EXISTS idx_obstacle_disputes_obstacle_id ON obstacle_disputes(obstacle_id);
CREATE INDEX IF NOT EXISTS idx_obstacle_disputes_user_id ON obstacle_disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_obstacle_disputes_created_at ON obstacle_disputes(created_at DESC);

-- Create obstacle_history table for audit trail
CREATE TABLE IF NOT EXISTS obstacle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obstacle_id UUID NOT NULL REFERENCES obstacles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for obstacle_history
CREATE INDEX IF NOT EXISTS idx_obstacle_history_obstacle_id ON obstacle_history(obstacle_id);
CREATE INDEX IF NOT EXISTS idx_obstacle_history_action ON obstacle_history(action);
CREATE INDEX IF NOT EXISTS idx_obstacle_history_created_at ON obstacle_history(created_at DESC);

-- Comment on tables
COMMENT ON TABLE obstacle_disputes IS 'Stores disputes filed by users against obstacles';
COMMENT ON TABLE obstacle_history IS 'Audit trail for obstacle changes (confirmations, disputes, status changes)';
