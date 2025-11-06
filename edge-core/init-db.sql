-- WellTegra Edge Core - Database Initialization
-- PostgreSQL schema for offline-capable edge deployment

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Toolstring configurations table
CREATE TABLE IF NOT EXISTS toolstring_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    well_id VARCHAR(50),
    operation_type VARCHAR(100),
    tools JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    CONSTRAINT toolstring_name_unique UNIQUE (name, well_id)
);

-- Sync queue table - Store-and-Forward operations
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    synced BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMP WITH TIME ZONE
);

-- Sync status table - Track cloud connectivity
CREATE TABLE IF NOT EXISTS sync_status (
    id SERIAL PRIMARY KEY,
    last_sync_attempt TIMESTAMP WITH TIME ZONE,
    last_successful_sync TIMESTAMP WITH TIME ZONE,
    cloud_reachable BOOLEAN DEFAULT FALSE,
    pending_sync_count INTEGER DEFAULT 0,
    failed_sync_count INTEGER DEFAULT 0,
    metadata JSONB
);

-- Initialize sync status
INSERT INTO sync_status (last_sync_attempt, cloud_reachable, pending_sync_count, failed_sync_count)
VALUES (CURRENT_TIMESTAMP, FALSE, 0, 0);

-- Users table for local authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_toolstring_configs_well_id ON toolstring_configs(well_id);
CREATE INDEX idx_toolstring_configs_synced ON toolstring_configs(synced);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Create default users (CHANGE PASSWORDS IN PRODUCTION)
-- Password: welltegra123 (bcrypt hashed)
INSERT INTO users (username, password_hash, role, full_name, email) VALUES
('finlay', '$2b$10$YQ7/HJ5T8h8jNNMvRQ8vJ.sP6F0nUZV8h8jNNMvRQ8vJ.sP6F0nUZV', 'Field-Engineer', 'Finlay MacLeod', 'finlay@welltegra.com'),
('rowan', '$2b$10$YQ7/HJ5T8h8jNNMvRQ8vJ.sP6F0nUZV8h8jNNMvRQ8vJ.sP6F0nUZV', 'Planner', 'Rowan Ross', 'rowan@welltegra.com'),
('admin', '$2b$10$YQ7/HJ5T8h8jNNMvRQ8vJ.sP6F0nUZV8h8jNNMvRQ8vJ.sP6F0nUZV', 'Admin', 'Admin User', 'admin@welltegra.com')
ON CONFLICT (username) DO NOTHING;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_toolstring_configs_updated_at
    BEFORE UPDATE ON toolstring_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE toolstring_configs IS 'Stores toolstring configurations created by field engineers';
COMMENT ON TABLE sync_queue IS 'Queue for Store-and-Forward sync to cloud';
COMMENT ON TABLE sync_status IS 'Tracks cloud connectivity and sync status';
COMMENT ON TABLE users IS 'Local user authentication for edge deployment';
COMMENT ON TABLE audit_log IS 'Audit trail for security and compliance';
