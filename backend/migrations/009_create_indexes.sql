-- Additional composite indexes for complex queries

-- User leaderboard queries
CREATE INDEX idx_users_leaderboard ON users(reputation_points DESC, created_at ASC);

-- Active obstacles by location and type
CREATE INDEX idx_obstacles_active_location ON obstacles USING GIST(location) WHERE status = 'active';

-- User's recent reports
CREATE INDEX idx_reports_user_recent ON reports(user_id, created_at DESC);

-- Route history by user and date
CREATE INDEX idx_routes_user_date ON routes(user_id, created_at DESC);

-- Active vehicles per user
CREATE INDEX idx_vehicles_user_active_vehicles ON vehicles(user_id, is_active);

-- Club membership lookups
CREATE INDEX idx_club_members_lookup ON club_members(user_id, club_id);

-- Performance optimization for spatial queries
-- These help with bounding box queries and nearest neighbor searches
CREATE INDEX idx_obstacles_location_btree ON obstacles((ST_Y(location::geometry)), (ST_X(location::geometry)));
CREATE INDEX idx_favorites_location_btree ON favorites((ST_Y(location::geometry)), (ST_X(location::geometry)));
CREATE INDEX idx_routes_origin_btree ON routes((ST_Y(origin::geometry)), (ST_X(origin::geometry)));
CREATE INDEX idx_routes_destination_btree ON routes((ST_Y(destination::geometry)), (ST_X(destination::geometry)));

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE obstacles;
ANALYZE reports;
ANALYZE vehicles;
ANALYZE routes;
ANALYZE favorites;
ANALYZE achievements;
ANALYZE car_clubs;
ANALYZE club_members;
