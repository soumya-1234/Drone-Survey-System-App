#!/bin/bash

# Create database
createdb drone_survey

# Run initialization script
psql -d drone_survey -f ./scripts/init-db.sql

# Insert sample data
psql -d drone_survey << EOF
-- Sample missions
INSERT INTO missions (name, status, start_time, end_time, waypoints, drones) VALUES
('Coastal Survey', 'completed', '2025-03-29 10:00:00', '2025-03-29 12:00:00', 
 '[{"latitude": 12.34, "longitude": 56.78, "altitude": 100, "speed": 20}]'::jsonb,
 '[1, 2]'::jsonb),
('Forest Mapping', 'in-progress', '2025-03-30 09:00:00', NULL,
 '[{"latitude": 23.45, "longitude": 67.89, "altitude": 150, "speed": 15}]'::jsonb,
 '[3]'::jsonb);

-- Sample reports
INSERT INTO reports (mission_id, date, status, type, location, coverage, image_count, download_url) VALUES
(1, '2025-03-29 12:00:00', 'completed', 'survey', 'Coastal Area', 95.5, 150, 'https://example.com/reports/1'),
(1, '2025-03-29 12:30:00', 'completed', 'mapping', 'Coastal Area', 98.2, 200, 'https://example.com/reports/2'),
(2, '2025-03-30 10:00:00', 'processing', 'survey', 'Forest Region', 45.0, 75, NULL);
EOF

echo "Database setup complete!"
