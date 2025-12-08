-- Create vehicles table (Premium feature)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('sports_car', 'sedan', 'suv', 'truck', 'classic', 'exotic')),
  suspension_type VARCHAR(50) NOT NULL CHECK (suspension_type IN ('stock', 'lowered_springs', 'coilovers', 'air_suspension')),
  ground_clearance_inches FLOAT NOT NULL CHECK (ground_clearance_inches > 0),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);

-- Ensure only one active vehicle per user
CREATE UNIQUE INDEX idx_vehicles_user_active ON vehicles(user_id) WHERE is_active = TRUE;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
