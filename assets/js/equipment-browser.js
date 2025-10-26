const toolCatalog = {
  Toolstring: [
    { id: 'TS-001', name: 'Rope Socket', vendor: 'Generic', length: 1.5, od: 1.875, dailyRate: 50, mobCost: 100, use: 'Connects wireline to the toolstring.', specs: ["1.875\" OD", '1.5 ft length', '5/16\" wire', 'Tensile: 15,000 lbs'], history: [ { date: '2024-03-15', well: 'A-12', event: 'Failure', note: 'Wire pulled at crimp. NPT: 8 hrs.' }, { date: '2023-11-01', well: 'B-04', event: 'Success', note: 'Ran gauge cutter to 10,000 ft.' } ] },
    { id: 'TS-002', name: 'Accelerator', vendor: 'Generic', length: 3.0, od: 1.875, dailyRate: 150, mobCost: 200, use: 'Enhances jarring impact by storing energy.', specs: ["1.875\" OD", '3.0 ft length', 'Stores/releases hydraulic energy'], history: [ { date: '2024-01-10', well: 'C-04', event: 'Success', note: 'Freed stuck plug.' } ] },
    { id: 'TS-003', name: 'Stem', vendor: 'Generic', length: 5.0, od: 1.875, dailyRate: 75, mobCost: 150, use: 'Provides weight to the toolstring for jarring or setting tools.', specs: ["1.875\" OD", '5.0 ft length', 'Weight: 80 lbs'], history: [ { date: '2024-01-20', well: 'C-09', event: 'Success', note: 'Used in fishing assembly.' } ] },
    { id: 'TS-004', name: 'Roller Stem', vendor: 'Generic', length: 5.0, od: 2.125, dailyRate: 120, mobCost: 200, use: 'Reduces friction in deviated wells using multiple roller sets.', specs: ["2.125\" OD", '5.0 ft length', '8 roller points'], history: [] },
    { id: 'TS-005', name: 'Roller Bogie', vendor: 'Generic', length: 3.0, od: 2.5, dailyRate: 130, mobCost: 200, use: 'Centralizes toolstring in high-angle wells.', specs: [], history: [] },
    { id: 'TS-006', name: 'Power Jar', vendor: 'Generic', length: 4.0, od: 2.125, dailyRate: 200, mobCost: 300, use: 'Hydraulic jar for upward impacts, rechargeable from surface.', specs: ["2.125\" OD", '4.0 ft length', 'Up to 25,000 lbs impact'], history: [] },
    { id: 'TS-007', name: 'Spang Jar', vendor: 'Generic', length: 4.0, od: 2.125, dailyRate: 150, mobCost: 250, use: 'Mechanical jar for upward or downward impacts.', specs: ["2.125\" OD", '4.0 ft length', 'Stroke: 18 in'], history: [ { date: '2023-11-11', well: 'F-15', event: 'Success', note: 'Sheared pin on shifting tool.' } ] },
    { id: 'TS-008', name: 'Tubular / Linear Jar', vendor: 'Generic', length: 4.5, od: 1.875, dailyRate: 180, mobCost: 250, use: 'Smooth-body mechanical jar, often used in fishing.', specs: [], history: [] },
    { id: 'TS-009', name: 'SR-over', vendor: 'Generic', length: 0.5, od: 1.875, dailyRate: 30, mobCost: 50, use: 'Crossover connector (e.g., Sucker Rod to Quick-Lock).', specs: [], history: [] },
    { id: 'TS-010', name: 'QLS x-over', vendor: 'Generic', length: 0.5, od: 1.875, dailyRate: 30, mobCost: 50, use: 'Quick-lock system crossover.', specs: [], history: [] },
    { id: 'TS-011', name: 'Knuckle Jar', vendor: 'Generic', length: 2.0, od: 1.875, dailyRate: 100, mobCost: 150, use: 'Provides jarring flexibility and articulation.', specs: [], history: [] },
    { id: 'TS-012', name: 'Heavy Weight Stem', vendor: 'Generic', length: 5.0, od: 2.125, dailyRate: 100, mobCost: 180, use: 'Provides extra weight in larger tubing.', specs: [], history: [] },
    { id: 'TS-013', name: 'Spring Roller Centraliser', vendor: 'Generic', length: 2.5, od: 2.875, dailyRate: 90, mobCost: 120, use: 'Centralizes toolstring with spring-loaded rollers.', specs: [], history: [] },
    { id: 'TS-014', name: 'Pressure Temp Gauge', vendor: 'Generic', length: 6.0, od: 1.75, dailyRate: 500, mobCost: 400, use: 'Records downhole pressure and temperature.', specs: ["1.75\" OD", '15,000 psi', '350°F Temp'], history: [ { date: '2024-02-10', well: 'D-01', event: 'Failure', note: 'Electronics failed at 300°F. NPT: 22 hrs.' }, { date: '2023-12-05', well: 'A-12', event: 'Success', note: 'Successful PBU survey.' } ] },
    { id: 'TS-015', name: 'Bow Spring Centraliser', vendor: 'Generic', length: 2.5, od: 2.875, dailyRate: 90, mobCost: 120, use: 'Centralizes toolstring using flexible bow springs.', specs: [], history: [] },
    { id: 'TS-016', name: 'Swivel', vendor: 'Generic', length: 1.5, od: 1.875, dailyRate: 80, mobCost: 100, use: 'Allows toolstring rotation below a certain point.', specs: [], history: [] },
    { id: 'TS-017', name: 'Knuckle Joint', vendor: 'Generic', length: 1.5, od: 1.875, dailyRate: 80, mobCost: 100, use: 'Provides articulation for toolstring alignment.', specs: [], history: [] },
    { id: 'TS-018', name: 'CAT tool / HIIT tool', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 250, mobCost: 300, use: 'Casing/tubing inspection tool (e.g., calliper).', specs: [], history: [ { date: '2024-01-30', well: 'B-09', event: 'Success', note: 'Found pitting at 4,500 ft.' } ] }
  ],
  Fishing: [
    { id: 'FSH-001', name: '2 Prong Grab', vendor: 'Generic', length: 2.5, od: 2.25, dailyRate: 120, mobCost: 200, use: 'Retrieves loose wire.', specs: [], history: [] },
    { id: 'FSH-002', name: '3/4 Prong Grab', vendor: 'Generic', length: 2.5, od: 2.25, dailyRate: 120, mobCost: 200, use: 'Retrieves loose wire.', specs: [], history: [] },
    { id: 'FSH-003', name: 'Internal Spear', vendor: 'Generic', length: 3.0, od: 1.875, dailyRate: 140, mobCost: 220, use: 'Latches inside a fish.', specs: [], history: [] },
    { id: 'FSH-004', name: 'Cutter Bar', vendor: 'Generic', length: 1.0, od: 1.875, dailyRate: 100, mobCost: 150, use: 'Cuts wire or small debris.', specs: [], history: [] },
    { id: 'FSH-005', name: 'Go-Devil', vendor: 'Generic', length: 2.0, od: 1.5, dailyRate: 80, mobCost: 100, use: 'Dropped to shear a cutting tool.', specs: [], history: [] },
    { id: 'FSH-006', name: 'Drive Down Bailer', vendor: 'Generic', length: 6.0, od: 1.875, dailyRate: 200, mobCost: 250, use: 'Removes sand/debris.', specs: [], history: [] },
    { id: 'FSH-007', name: 'Pump Bailer', vendor: 'Generic', length: 6.0, od: 1.875, dailyRate: 220, mobCost: 260, use: 'Removes sand/debris.', specs: [], history: [] },
    { id: 'FSH-008', name: 'Hydrostatic Bailer', vendor: 'Generic', length: 7.0, od: 2.125, dailyRate: 250, mobCost: 300, use: 'Removes sand/debris.', specs: [], history: [] },
    { id: 'FSH-009', name: 'Heavy Duty Pulling Tool', vendor: 'Generic', length: 3.5, od: 2.25, dailyRate: 300, mobCost: 350, use: 'Retrieves tools with external fishnecks.', specs: [], history: [ { date: '2024-04-01', well: 'F-02', event: 'Failure', note: 'Shear pin released prematurely. NPT: 12 hrs.' } ] },
    { id: 'FSH-010', name: 'Heavy Duty Releasable Overshot', vendor: 'Generic', length: 4.0, od: 2.875, dailyRate: 350, mobCost: 400, use: 'Catches external fishneck.', specs: [], history: [] },
    { id: 'FSH-011', name: 'Alligator Grab', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Grabs irregular junk.', specs: [], history: [] },
    { id: 'FSH-012', name: 'Bowen Finder Retriever', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Locates and retrieves wire.', specs: [], history: [] },
    { id: 'FSH-013', name: 'Tool Carrier', vendor: 'Generic', length: 4.0, od: 1.875, dailyRate: 100, mobCost: 150, use: 'Carries other tools.', specs: [], history: [] },
    { id: 'FSH-014', name: 'Bell Guide', vendor: 'Generic', length: 1.0, od: 2.5, dailyRate: 60, mobCost: 80, use: 'Guides toolstring into restrictions.', specs: [], history: [] },
    { id: 'FSH-015', name: 'Wire Scratcher', vendor: 'Generic', length: 2.0, od: 2.5, dailyRate: 80, mobCost: 100, use: 'Scratches tubing wall.', specs: [], history: [] },
    { id: 'FSH-016', name: 'Finder Spear', vendor: 'Generic', length: 2.5, od: 1.875, dailyRate: 100, mobCost: 120, use: 'Locates top of wire.', specs: [], history: [] },
    { id: 'FSH-017', name: 'Wire Spear', vendor: 'Generic', length: 2.5, od: 1.875, dailyRate: 100, mobCost: 120, use: 'Retrieves wire.', specs: [], history: [] },
    { id: 'FSH-018', name: 'Sidewall Cutter', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 180, mobCost: 220, use: 'Cuts objects on tubing wall.', specs: [], history: [] }
  ],
  'LIBs etc': [
    { id: 'LIB-001', name: 'Serrated Gauge Cutter', vendor: 'Generic', length: 2.0, od: 2.875, dailyRate: 100, mobCost: 150, use: 'Drifts and cleans tubing.', specs: [], history: [] },
    { id: 'LIB-002', name: 'Gauge Cutter', vendor: 'Generic', length: 2.0, od: 2.875, dailyRate: 100, mobCost: 150, use: 'Drifts tubing.', specs: [], history: [] },
    { id: 'LIB-003', name: 'Lead Impression Block', vendor: 'Generic', length: 2.0, od: 1.875, dailyRate: 80, mobCost: 100, use: 'Records fish top profile.', specs: [], history: [] },
    { id: 'LIB-004', name: 'Tar Baby', vendor: 'Generic', length: 2.0, od: 1.875, dailyRate: 80, mobCost: 100, use: 'Lead impression block alternative.', specs: [], history: [] },
    { id: 'LIB-005', name: 'Blind Box', vendor: 'Generic', length: 2.0, od: 1.875, dailyRate: 80, mobCost: 100, use: 'Breaks/shapes top of fish.', specs: [], history: [] },
    { id: 'LIB-006', name: 'Solid Wire Finder', vendor: 'Generic', length: 2.5, od: 2.125, dailyRate: 90, mobCost: 110, use: 'Locates top of wire.', specs: [], history: [] },
    { id: 'LIB-007', name: 'Tubing Swage', vendor: 'Generic', length: 3.0, od: 2.8, dailyRate: 150, mobCost: 200, use: 'Repairs collapsed tubing.', specs: [], history: [] },
    { id: 'LIB-008', name: 'Fluted Centraliser', vendor: 'Generic', length: 2.0, od: 2.5, dailyRate: 80, mobCost: 100, use: 'Centralizes toolstring.', specs: [], history: [] },
    { id: 'LIB-009', name: 'Magnet', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 130, mobCost: 160, use: 'Retrieves ferrous debris.', specs: [], history: [] },
    { id: 'LIB-010', name: 'Wire Scratcher', vendor: 'Generic', length: 2.5, od: 2.8, dailyRate: 80, mobCost: 100, use: 'Cleans tubing wall.', specs: [], history: [] },
    { id: 'LIB-011', name: 'Tubing End Locator', vendor: 'Generic', length: 2.0, od: 2.5, dailyRate: 100, mobCost: 120, use: 'Locates end of tubing.', specs: [], history: [] },
    { id: 'LIB-012', name: 'Shock Absorber', vendor: 'Generic', length: 3.0, od: 1.875, dailyRate: 120, mobCost: 150, use: 'Dampens toolstring shock.', specs: [], history: [] },
    { id: 'LIB-013', name: 'Tubing Broach', vendor: 'Generic', length: 3.0, od: 2.8, dailyRate: 140, mobCost: 180, use: 'Cleans/opens restrictions.', specs: [], history: [] }
  ],
  'Pulling Tools': [
    { id: 'PUL-001', name: 'JD Series', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool (jar down).', specs: [], history: [] },
    { id: 'PUL-002', name: 'JU Series', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool (jar up).', specs: [], history: [] },
    { id: 'PUL-003', name: 'S Series', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PUL-004', name: 'R Series', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PUL-005', name: 'GS Series', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PUL-006', name: 'GU Series', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PUL-007', name: 'PRS', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PUL-008', name: 'B Shifting Tool', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Shifts sliding sleeves.', specs: [], history: [] },
    { id: 'PUL-009', name: 'D2 Shifting Tool', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Shifts sliding sleeves.', specs: [], history: [] }
  ],
  'Gas Lift': [
    { id: 'GL-001', name: 'Merla KOT', vendor: 'Merla', length: 2.5, od: 1.75, dailyRate: 130, mobCost: 180, use: 'Kick over tool.', specs: [], history: [] },
    { id: 'GL-002', name: 'Camco OM/OK Series', vendor: 'Camco', length: 2.5, od: 1.75, dailyRate: 130, mobCost: 180, use: 'Kick over tool.', specs: [], history: [] },
    { id: 'GL-003', name: 'Gas Lift Valve', vendor: 'Camco', length: 2.0, od: 1.5, dailyRate: 100, mobCost: 150, use: 'Gas lift valve.', specs: [], history: [] },
    { id: 'GL-004', name: 'JK/RK Running Tool', vendor: 'Camco', length: 3.0, od: 1.75, dailyRate: 140, mobCost: 190, use: 'Running tool for GL valve.', specs: [], history: [] },
    { id: 'GL-005', name: 'JDS + Spacer Bar', vendor: 'Camco', length: 4.0, od: 1.75, dailyRate: 120, mobCost: 170, use: 'Running tool component.', specs: [], history: [] },
    { id: 'GL-006', name: 'Gas Lift Valve Catcher', vendor: 'Generic', length: 3.0, od: 2.125, dailyRate: 100, mobCost: 150, use: 'Catches GL valve if dropped.', specs: [], history: [] }
  ],
  Otis: [
    { id: 'OT-001', name: 'Otis R/X Line Running Tool', vendor: 'Otis', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Running tool for Otis plugs.', specs: [], history: [] },
    { id: 'OT-002', name: 'Otis Plug', vendor: 'Otis', length: 2.5, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Otis X-line blanking plug.', specs: ["2.875\" OD", '10,000 psi', 'Fits 3.5\" XN nipple'], history: [] },
    { id: 'OT-003', name: 'Otis Equalising Prong', vendor: 'Otis', length: 2.0, od: 1.5, dailyRate: 80, mobCost: 100, use: 'Equalizes pressure across plug.', specs: [], history: [] },
    { id: 'OT-004', name: 'Otis Lock Mandrel', vendor: 'Otis', length: 2.5, od: 2.875, dailyRate: 180, mobCost: 220, use: 'Lock mandrel for tools.', specs: [], history: [] },
    { id: 'OT-005', name: 'WRSSV', vendor: 'Otis', length: 8.0, od: 3.25, dailyRate: 600, mobCost: 500, use: 'Wireline retrievable safety valve.', specs: [], history: [] },
    { id: 'OT-006', name: 'BBD', vendor: 'Otis', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Specialty tool.', specs: [], history: [] },
    { id: 'OT-007', name: 'Running Equalising Prong', vendor: 'Otis', length: 2.0, od: 1.5, dailyRate: 80, mobCost: 100, use: 'Equalises pressure.', specs: [], history: [] },
    { id: 'OT-008', name: 'Spacer Tube', vendor: 'Otis', length: 3.0, od: 2.125, dailyRate: 60, mobCost: 80, use: 'Spacer for toolstring.', specs: [], history: [] },
    { id: 'OT-009', name: 'N Test Tool', vendor: 'Otis', length: 3.0, od: 2.125, dailyRate: 140, mobCost: 180, use: 'Tests N-profile nipples.', specs: [], history: [] }
  ],
  Baker: [
    { id: 'BK-001', name: 'A-running Tool c/w D Probe', vendor: 'Baker', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Running tool.', specs: [], history: [] },
    { id: 'BK-002', name: 'Sure-Set Lock', vendor: 'Baker', length: 3.0, od: 2.875, dailyRate: 180, mobCost: 220, use: 'Lock mandrel.', specs: [], history: [] },
    { id: 'BK-003', name: 'H-bottom Equalising Prong', vendor: 'Baker', length: 2.0, od: 1.5, dailyRate: 80, mobCost: 100, use: 'Equalising prong.', specs: [], history: [] },
    { id: 'BK-004', name: 'Sure Set Standing Valve', vendor: 'Baker', length: 3.0, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Standing valve.', specs: [], history: [] },
    { id: 'BK-005', name: 'C1 Running Tool', vendor: 'Baker', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Running tool.', specs: [], history: [] },
    { id: 'BK-006', name: 'FB-RB 2 Standing Valve', vendor: 'Baker', length: 3.0, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Standing valve.', specs: [], history: [] },
    { id: 'BK-007', name: 'FWG/RZG Plug', vendor: 'Baker', length: 2.5, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Blanking plug.', specs: [], history: [] },
    { id: 'BK-008', name: 'FWB/RZB Bomb Hanger', vendor: 'Baker', length: 2.5, od: 2.875, dailyRate: 150, mobCost: 200, use: 'Hanger for gauges.', specs: [], history: [] },
    { id: 'BK-009', name: 'FSG Plug', vendor: 'Baker', length: 2.5, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Blanking plug.', specs: [], history: [] },
    { id: 'BK-010', name: 'FMH/RKH Plug', vendor: 'Baker', length: 2.5, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Blanking plug.', specs: [], history: [] }
  ],
  Camco: [
    { id: 'CM-001', name: 'DB Plug', vendor: 'Camco', length: 2.5, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Blanking plug.', specs: [], history: [] },
    { id: 'CM-002', name: 'DBP Prong', vendor: 'Camco', length: 2.0, od: 1.5, dailyRate: 80, mobCost: 100, use: 'Equalising prong.', specs: [], history: [] },
    { id: 'CM-003', name: 'Z-6 Running Tool', vendor: 'Camco', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Running tool.', specs: [], history: [] },
    { id: 'CM-004', name: 'PRS Pulling Tool', vendor: 'Camco', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'CM-005', name: 'DB Lock c/w A1 Injection Valve', vendor: 'Camco', length: 3.5, od: 2.875, dailyRate: 250, mobCost: 300, use: 'Injection valve assembly.', specs: [], history: [] },
    { id: 'CM-006', name: 'DB Lock', vendor: 'Camco', length: 2.5, od: 2.875, dailyRate: 180, mobCost: 220, use: 'Lock mandrel.', specs: [], history: [] }
  ],
  PES: [
    { id: 'PES-001', name: 'Bridge Plug', vendor: 'PES', length: 4.0, od: 3.5, dailyRate: 300, mobCost: 350, use: 'Bridge plug.', specs: [], history: [] },
    { id: 'PES-002', name: 'PO Pulling Tool', vendor: 'PES', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PES-003', name: 'Drift', vendor: 'PES', length: 3.0, od: 2.8, dailyRate: 100, mobCost: 150, use: 'Drift run.', specs: [], history: [] },
    { id: 'PES-004', name: 'Straddle', vendor: 'PES', length: 10.0, od: 3.25, dailyRate: 400, mobCost: 450, use: 'Straddle pack-off.', specs: [], history: [] },
    { id: 'PES-005', name: 'PK Pulling Tool', vendor: 'PES', length: 3.0, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] }
  ],
  Petroline: [
    { id: 'PET-001', name: 'QX Plug', vendor: 'Petroline', length: 2.5, od: 2.875, dailyRate: 200, mobCost: 250, use: 'Blanking plug.', specs: [], history: [] },
    { id: 'PET-002', name: 'QX Running Tool', vendor: 'Petroline', length: 3.0, od: 2.125, dailyRate: 160, mobCost: 210, use: 'Running tool.', specs: [], history: [] },
    { id: 'PET-003', name: 'H-Bottom Prong', vendor: 'Petroline', length: 2.0, od: 1.5, dailyRate: 80, mobCost: 100, use: 'Equalising prong.', specs: [], history: [] },
    { id: 'PET-004', name: 'QX Pulling Probe', vendor: 'Petroline', length: 2.5, od: 2.125, dailyRate: 150, mobCost: 200, use: 'Pulling tool.', specs: [], history: [] },
    { id: 'PET-005', name: 'QXT c/w ABD BPV', vendor: 'Petroline', length: 3.5, od: 2.875, dailyRate: 250, mobCost: 300, use: 'Back pressure valve.', specs: [], history: [] }
  ],
  'Rig Up': [
    { id: 'RU-001', name: 'Rig Up Diagram Component', vendor: 'Generic', length: 0, od: 0, dailyRate: 0, mobCost: 0, use: 'Component for rig-up schematic.', specs: [], history: [] }
  ],
  'Trees & Valves': [
    { id: 'TR-001', name: 'Lo Torque Valve', vendor: 'Generic', length: 0, od: 0, dailyRate: 0, mobCost: 0, use: 'Surface valve.', specs: [], history: [] }
  ]
};

const personnelCatalog = {
  'PERS-001': { id: 'PERS-001', name: 'Wellsite Engineer', dailyRate: 3600 },
  'PERS-004': { id: 'PERS-004', name: 'Wireline Engineer', dailyRate: 2640 },
  'PERS-005': { id: 'PERS-005', name: 'Coiled Tubing Supervisor', dailyRate: 2280 },
  'PERS-006': { id: 'PERS-006', name: 'Wireline Operator', dailyRate: 1800 }
};

const builderState = {
  toolstring: [],
  personnel: []
};

const formatCurrency = (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Fishing':
      return '🎣';
    case 'Gas Lift':
      return '🛢️';
    case 'Otis':
      return '🧰';
    case 'Baker':
      return '⚙️';
    case 'Camco':
      return '🏭';
    case 'PES':
      return '🧱';
    case 'Petroline':
      return '🔩';
    case 'Rig Up':
      return '🗂️';
    case 'Trees & Valves':
      return '🚪';
    default:
      return '🧱';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const catalogViewButton = document.getElementById('catalog-view-button');
  const builderViewButton = document.getElementById('builder-view-button');
  const catalogView = document.getElementById('catalog-view');
  const builderView = document.getElementById('builder-view');
  const searchInput = document.getElementById('catalog-search');
  const catalogTabs = document.getElementById('catalog-tabs');
  const catalogGrid = document.getElementById('catalog-grid');
  const searchResults = document.getElementById('search-results');
  const searchResultsGrid = document.getElementById('search-results-grid');
  const noSearchResults = document.getElementById('no-search-results');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalVendor = document.getElementById('modal-vendor');
  const modalCode = document.getElementById('modal-code');
  const modalUse = document.getElementById('modal-use');
  const modalSpecs = document.getElementById('modal-specs');
  const modalCostRate = document.getElementById('modal-cost-rate');
  const modalCostMob = document.getElementById('modal-cost-mob');
  const modalHistory = document.getElementById('modal-history');
  const modalPanels = document.querySelectorAll('.modal-panel');
  const modalTabsButtons = document.querySelectorAll('.modal-tab');
  const modalClose = document.getElementById('modal-close');
  const modalAddButton = document.getElementById('modal-add-to-builder');
  const toast = document.getElementById('toast');
  const builderToolstring = document.getElementById('builder-toolstring');
  const builderPersonnel = document.getElementById('builder-personnel');
  const metricLength = document.getElementById('builder-metric-length');
  const metricOd = document.getElementById('builder-metric-od');
  const metricEquip = document.getElementById('builder-metric-equip');
  const metricPers = document.getElementById('builder-metric-pers');
  const metricTotal = document.getElementById('builder-metric-total');

  let activeCategory = 'All';
  let modalTool = null;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2400);
  };

  const updateMetrics = () => {
    const totalLength = builderState.toolstring.reduce((sum, tool) => sum + (tool.length || 0), 0);
    const maxOd = builderState.toolstring.reduce((max, tool) => Math.max(max, tool.od || 0), 0);
    const equipCost = builderState.toolstring.reduce((sum, tool) => sum + (tool.dailyRate || 0), 0);
    const personnelCost = builderState.personnel.reduce((sum, person) => sum + (person.dailyRate || 0), 0);

    metricLength.textContent = `${totalLength.toFixed(2)} ft`;
    metricOd.textContent = `${maxOd.toFixed(2)} in`;
    metricEquip.textContent = formatCurrency(equipCost);
    metricPers.textContent = formatCurrency(personnelCost);
    metricTotal.textContent = formatCurrency(equipCost + personnelCost);
  };

  const renderBuilderList = (container, items, type) => {
    if (items.length === 0) {
      container.textContent = type === 'tool' ? 'No tools added.' : 'No personnel added.';
      container.classList.add('text-slate-400');
      return;
    }
    container.classList.remove('text-slate-400');
    container.innerHTML = items
      .map((item, index) => {
        if (type === 'tool') {
          return `<div class="mb-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white"><span>${item.name} <span class="text-xs text-slate-400">(${(item.od || 0).toFixed(2)}\" OD &middot; ${(item.length || 0).toFixed(1)} ft)</span></span><button type="button" class="text-xs font-semibold text-red-300 hover:text-red-200" data-remove-tool="${index}">Remove</button></div>`;
        }
        return `<div class="mb-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white"><span>${item.name}</span><button type="button" class="text-xs font-semibold text-red-300 hover:text-red-200" data-remove-personnel="${index}">Remove</button></div>`;
      })
      .join('');
  };

  const updateBuilder = () => {
    renderBuilderList(builderToolstring, builderState.toolstring, 'tool');
    renderBuilderList(builderPersonnel, builderState.personnel, 'personnel');
    updateMetrics();
  };

  const addToolToBuilder = (tool) => {
    builderState.toolstring.push(tool);
    updateBuilder();
    showToast(`${tool.name} added to job plan`);
  };

  const addPersonnelToBuilder = (personId) => {
    const person = personnelCatalog[personId];
    if (!person) return;
    builderState.personnel.push({ ...person });
    updateBuilder();
    showToast(`${person.name} added to job plan`);
  };

  const clearSearchResults = () => {
    searchResults.classList.add('hidden');
    noSearchResults.classList.add('hidden');
    searchResultsGrid.innerHTML = '';
  };

  const renderToolCards = (tools, targetGrid) => {
    targetGrid.innerHTML = tools
      .map((tool) => {
        const category = Object.keys(toolCatalog).find((key) => toolCatalog[key].some((item) => item.id === tool.id)) ?? 'Toolstring';
        const icon = getCategoryIcon(category);
        return `<button type="button" class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-5 text-left shadow hover:border-cyan-400 focus:outline-none focus-visible:ring focus-visible:ring-cyan-400" data-tool-id="${tool.id}"><span class="text-3xl" aria-hidden="true">${icon}</span><span class="text-lg font-semibold text-white">${tool.name}</span><span class="text-sm text-slate-400">${tool.vendor}</span><span class="text-xs text-slate-500">${tool.id}</span></button>`;
      })
      .join('');
  };

  const openModal = (tool) => {
    modalTool = tool;
    modalTitle.textContent = tool.name;
    modalVendor.textContent = tool.vendor;
    modalCode.textContent = tool.id;
    modalUse.textContent = tool.use || 'No usage notes provided.';
    modalSpecs.innerHTML = '';
    if (tool.specs && tool.specs.length > 0) {
      tool.specs.forEach((spec) => {
        const li = document.createElement('li');
        li.textContent = spec;
        modalSpecs.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No specifications captured.';
      modalSpecs.appendChild(li);
    }
    modalCostRate.textContent = `Daily Rate: ${formatCurrency(tool.dailyRate || 0)}`;
    modalCostMob.textContent = `Mobilisation: ${formatCurrency(tool.mobCost || 0)}`;
    modalHistory.innerHTML = '';
    if (tool.history && tool.history.length > 0) {
      tool.history.forEach((entry) => {
        const wrapper = document.createElement('article');
        wrapper.className = 'rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3';
        const badgeColour = entry.event === 'Failure' ? 'text-red-300' : 'text-emerald-300';
        wrapper.innerHTML = `<div class="flex items-center justify-between"><span class="text-sm font-semibold ${badgeColour}">${entry.event} &middot; ${entry.well}</span><span class="text-xs text-slate-400">${entry.date}</span></div><p class="mt-2 text-sm text-slate-200">${entry.note}</p>`;
        modalHistory.appendChild(wrapper);
      });
    } else {
      const empty = document.createElement('p');
      empty.className = 'text-sm text-slate-400';
      empty.textContent = 'No recorded NPT or performance history.';
      modalHistory.appendChild(empty);
    }

    modalTabsButtons.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === 'specs');
      tab.classList.toggle('text-cyan-300', tab.dataset.tab === 'specs');
      tab.classList.toggle('text-slate-400', tab.dataset.tab !== 'specs');
    });
    modalPanels.forEach((panel) => {
      if (panel.dataset.panel === 'specs') {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    modalBackdrop.classList.remove('hidden');
  };

  const closeModal = () => {
    modalBackdrop.classList.add('hidden');
    modalTool = null;
  };

  const allTools = Object.values(toolCatalog).flat();

  const renderCatalogTabs = () => {
    const categories = ['All', ...Object.keys(toolCatalog)];
    catalogTabs.innerHTML = categories
      .map((category) => {
        const isActive = category === activeCategory;
        const baseClasses = 'rounded-full border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring focus-visible:ring-cyan-300';
        const classes = isActive
          ? `${baseClasses} border-cyan-400 bg-cyan-600 text-white`
          : `${baseClasses} border-slate-800 bg-slate-900/60 text-slate-300 hover:border-cyan-400`;
        return `<button type="button" class="${classes}" data-category="${category}">${category}</button>`;
      })
      .join('');
  };

  const renderCatalog = () => {
    const toolsToRender = activeCategory === 'All' ? allTools : toolCatalog[activeCategory] ?? [];
    renderToolCards(toolsToRender, catalogGrid);
  };

  catalogTabs.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const category = target.dataset.category;
    if (!category) return;
    activeCategory = category;
    renderCatalogTabs();
    renderCatalog();
    clearSearchResults();
  });

  catalogGrid.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('[data-tool-id]');
    if (!(button instanceof HTMLElement)) return;
    const tool = allTools.find((item) => item.id === button.dataset.toolId);
    if (tool) {
      openModal(tool);
    }
  });

  searchResultsGrid.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('[data-tool-id]');
    if (!(button instanceof HTMLElement)) return;
    const tool = allTools.find((item) => item.id === button.dataset.toolId);
    if (tool) {
      openModal(tool);
    }
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      clearSearchResults();
      renderCatalogTabs();
      renderCatalog();
      return;
    }

    const results = allTools.filter((tool) =>
      tool.name.toLowerCase().includes(query) ||
      tool.vendor.toLowerCase().includes(query) ||
      tool.id.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      searchResults.classList.remove('hidden');
      searchResultsGrid.innerHTML = '';
      noSearchResults.classList.remove('hidden');
      return;
    }

    searchResults.classList.remove('hidden');
    noSearchResults.classList.add('hidden');
    renderToolCards(results, searchResultsGrid);
  });

  modalTabsButtons.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      if (!targetTab) return;
      modalTabsButtons.forEach((btn) => {
        btn.classList.toggle('active', btn === tab);
        btn.classList.toggle('text-cyan-300', btn === tab);
        btn.classList.toggle('text-slate-400', btn !== tab);
      });
      modalPanels.forEach((panel) => {
        if (panel.dataset.panel === targetTab) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  modalClose.addEventListener('click', closeModal);

  modalAddButton.addEventListener('click', () => {
    if (!modalTool) return;
    addToolToBuilder(modalTool);
    closeModal();
    catalogViewButton.click();
    builderViewButton.click();
  });

  document.getElementById('save-job-plan').addEventListener('click', () => {
    const jobPlan = {
      tools: builderState.toolstring,
      personnel: builderState.personnel,
      totals: {
        length: metricLength.textContent,
        od: metricOd.textContent,
        equipment: metricEquip.textContent,
        personnel: metricPers.textContent,
        total: metricTotal.textContent
      }
    };
    console.table(jobPlan);
    showToast('Job plan saved');
  });

  builderToolstring.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const removeIndex = target.dataset.removeTool;
    if (removeIndex !== undefined) {
      builderState.toolstring.splice(Number(removeIndex), 1);
      updateBuilder();
    }
  });

  builderPersonnel.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const removeIndex = target.dataset.removePersonnel;
    if (removeIndex !== undefined) {
      builderState.personnel.splice(Number(removeIndex), 1);
      updateBuilder();
    }
  });

  document.querySelectorAll('[data-add-personnel]').forEach((button) => {
    button.addEventListener('click', () => addPersonnelToBuilder(button.dataset.addPersonnel));
  });

  document.getElementById('clear-toolstring-builder').addEventListener('click', () => {
    builderState.toolstring = [];
    updateBuilder();
  });

  document.getElementById('clear-personnel-builder').addEventListener('click', () => {
    builderState.personnel = [];
    updateBuilder();
  });

  document.getElementById('reset-builder').addEventListener('click', () => {
    builderState.toolstring = [];
    builderState.personnel = [];
    updateBuilder();
  });

  builderViewButton.addEventListener('click', () => {
    catalogView.classList.add('hidden');
    builderView.classList.remove('hidden');
    builderViewButton.classList.add('bg-cyan-600', 'text-white');
    builderViewButton.classList.remove('bg-slate-800', 'text-slate-200');
    catalogViewButton.classList.add('bg-slate-800', 'text-slate-200');
    catalogViewButton.classList.remove('bg-cyan-600', 'text-white');
  });

  catalogViewButton.addEventListener('click', () => {
    builderView.classList.add('hidden');
    catalogView.classList.remove('hidden');
    catalogViewButton.classList.add('bg-cyan-600', 'text-white');
    catalogViewButton.classList.remove('bg-slate-800', 'text-slate-200');
    builderViewButton.classList.add('bg-slate-800', 'text-slate-200');
    builderViewButton.classList.remove('bg-cyan-600', 'text-white');
  });

  renderCatalogTabs();
  renderCatalog();
  updateBuilder();
});
