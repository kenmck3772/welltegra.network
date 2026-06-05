-- Sample well data for BigQuery
-- Insert this into brahan-483303.wells.well_data

INSERT INTO `brahan-483303.wells.well_data`
(well_id, name, field, total_depth, reservoir_pressure)
VALUES
  ('volve-f1', '15/9-F-1 B', 'Volve', 3150.0, 329.6),
  ('volve-f4', '15/9-F-4', 'Volve', 3200.0, 325.0),
  ('alpha-01', 'Node-01 Alpha', 'Brahan', 2850.0, 280.0),
  ('bravo-02', 'Node-02 Bravo', 'Brahan', 2920.0, 265.0),
  ('charlie-03', 'Node-03 Charlie', 'Brahan', 3050.0, 290.0);
