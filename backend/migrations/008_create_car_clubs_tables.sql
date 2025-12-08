-- Create car_clubs table (Premium feature)
CREATE TABLE IF NOT EXISTS car_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 1 CHECK (member_count >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create club_members table for club membership
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES car_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_car_clubs_owner_id ON car_clubs(owner_id);
CREATE INDEX idx_car_clubs_is_private ON car_clubs(is_private);
CREATE INDEX idx_car_clubs_created_at ON car_clubs(created_at DESC);
CREATE INDEX idx_car_clubs_name ON car_clubs(name);

CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_members_role ON club_members(role);
CREATE INDEX idx_club_members_joined_at ON club_members(joined_at DESC);

-- Ensure unique club membership
CREATE UNIQUE INDEX idx_club_members_unique ON club_members(club_id, user_id);

-- Ensure unique club names
CREATE UNIQUE INDEX idx_car_clubs_name_unique ON car_clubs(LOWER(name));
