-- Create achievements table for gamification
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('early_adopter', 'explorer_100km', 'reporter_10', 'photographer_10', 'top_contributor', 'community_leader')),
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_badge_type ON achievements(badge_type);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at DESC);

-- Ensure each user can only earn each badge once
CREATE UNIQUE INDEX idx_achievements_user_badge ON achievements(user_id, badge_type);
