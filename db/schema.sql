-- Enable PostGIS for geospatial functionality
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drones table
CREATE TABLE IF NOT EXISTS drones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    status VARCHAR(50) CHECK (status IN ('available', 'in-mission', 'maintenance')) NOT NULL,
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('scheduled', 'in-progress', 'paused', 'completed', 'aborted')) NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    area FLOAT, -- in square kilometers
    distance FLOAT, -- in kilometers
    image_count INT
);

-- Mission-Drone association table
CREATE TABLE IF NOT EXISTS mission_drones (
    mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
    drone_id INT REFERENCES drones(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) CHECK (role IN ('primary', 'backup', 'support')) NOT NULL DEFAULT 'primary',
    PRIMARY KEY (mission_id, drone_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
    summary TEXT,
    flight_duration INTERVAL,
    coverage_area FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waypoints table
CREATE TABLE IF NOT EXISTS waypoints (
    id SERIAL PRIMARY KEY,
    mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    altitude FLOAT NOT NULL, -- in meters
    "order" INT NOT NULL,
    action VARCHAR(50) CHECK (action IN ('photo', 'video', 'hover')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on waypoints
CREATE INDEX IF NOT EXISTS waypoints_location_idx 
ON waypoints USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS missions_status_idx ON missions(status);
CREATE INDEX IF NOT EXISTS missions_created_at_idx ON missions(created_at);
CREATE INDEX IF NOT EXISTS waypoints_mission_id_idx ON waypoints(mission_id);
CREATE INDEX IF NOT EXISTS waypoints_order_idx ON waypoints("order");
CREATE INDEX IF NOT EXISTS drones_status_idx ON drones(status);
CREATE INDEX IF NOT EXISTS mission_drones_mission_idx ON mission_drones(mission_id);
CREATE INDEX IF NOT EXISTS mission_drones_drone_idx ON mission_drones(drone_id);
CREATE INDEX IF NOT EXISTS reports_mission_id_idx ON reports(mission_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at);
