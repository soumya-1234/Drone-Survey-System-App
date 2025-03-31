-- Seed data for drones
INSERT INTO drones (name, model, status, battery_level, last_seen) VALUES
('Falcon-1', 'DJI Mavic 3', 'available', 95, CURRENT_TIMESTAMP),
('Eagle-2', 'DJI Air 2S', 'available', 88, CURRENT_TIMESTAMP),
('Hawk-3', 'DJI Phantom 4', 'maintenance', 45, CURRENT_TIMESTAMP - interval '2 hours'),
('Swift-4', 'Autel EVO II', 'in-mission', 72, CURRENT_TIMESTAMP),
('Raven-5', 'DJI Inspire 2', 'available', 91, CURRENT_TIMESTAMP);

-- Seed data for missions
INSERT INTO missions (name, status, start_time, end_time, area, distance, image_count) VALUES
('City Survey Alpha', 'completed', CURRENT_TIMESTAMP - interval '2 days', CURRENT_TIMESTAMP - interval '1 day', 1200.5, 8500.0, 245),
('Forest Mapping Beta', 'in-progress', CURRENT_TIMESTAMP - interval '4 hours', NULL, 800.2, 3200.0, 128),
('Construction Site Delta', 'scheduled', NULL, NULL, 150.0, 1200.0, 0),
('Agricultural Survey Gamma', 'paused', CURRENT_TIMESTAMP - interval '1 day', NULL, 2500.0, 12000.0, 89);

-- Assign drones to missions
INSERT INTO mission_drones (mission_id, drone_id, role) VALUES
(1, 1, 'primary'),
(1, 2, 'backup'),
(2, 4, 'primary'),
(2, 3, 'support'),
(3, 5, 'primary');

-- Add waypoints to missions
INSERT INTO waypoints (mission_id, "order", latitude, longitude, altitude, action, duration, completed_at) VALUES
-- Completed mission waypoints
(1, 1, 37.7749, -122.4194, 100, 'photo', 30, CURRENT_TIMESTAMP - interval '2 days'),
(1, 2, 37.7750, -122.4180, 120, 'video', 60, CURRENT_TIMESTAMP - interval '2 days'),
(1, 3, 37.7748, -122.4170, 90, 'photo', 30, CURRENT_TIMESTAMP - interval '2 days'),

-- In-progress mission waypoints
(2, 1, 37.7830, -122.4190, 150, 'photo', 30, CURRENT_TIMESTAMP - interval '3 hours'),
(2, 2, 37.7840, -122.4185, 160, 'hover', 45, CURRENT_TIMESTAMP - interval '2 hours'),
(2, 3, 37.7835, -122.4175, 140, 'photo', 30, NULL),

-- Scheduled mission waypoints
(3, 1, 37.7855, -122.4130, 80, 'photo', 30, NULL),
(3, 2, 37.7865, -122.4125, 90, 'video', 60, NULL),
(3, 3, 37.7860, -122.4120, 85, 'photo', 30, NULL);

-- Add reports for completed missions
INSERT INTO reports (mission_id, summary, flight_duration, coverage_area, created_at) VALUES
(1, 'Successfully completed city survey with high-resolution imagery. Weather conditions were optimal.', 
    '2 hours 15 minutes', 1200.5, CURRENT_TIMESTAMP - interval '1 day'),
(2, 'Partial completion of forest mapping. Paused due to low light conditions.',
    '4 hours 30 minutes', 800.2, CURRENT_TIMESTAMP - interval '3 hours');
