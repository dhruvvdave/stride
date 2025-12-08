-- Create reports table for obstacle reporting system
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obstacle_id UUID REFERENCES obstacles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('new', 'confirm', 'fixed', 'dispute')),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  sensor_data JSONB,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reports_obstacle_id ON reports(obstacle_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_sensor_data ON reports USING GIN(sensor_data);
