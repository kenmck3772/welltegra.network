import { LogEntry, TraumaData, PressureData, NDRProject } from './types';

// Mock Log Data for Ghost-Sync
export const MOCK_BASE_LOG: LogEntry[] = Array.from({ length: 100 }, (_, i) => ({
  depth: 1200 + i * 2,
  gr: 40 + Math.sin(i * 0.2) * 20 + Math.random() * 10
}));

export const MOCK_GHOST_LOG: LogEntry[] = MOCK_BASE_LOG.map(entry => ({
  depth: entry.depth + 14.5, // 14.5m offset
  gr: entry.gr + (Math.random() - 0.5) * 5
}));

// Mock NDR Projects
export const MOCK_NDR_PROJECTS: NDRProject[] = [
  {
    projectId: 'THISTLE1978well0001',
    name: 'Thistle A7 Legacy',
    quadrant: '211',
    status: 'RELEASED',
    releaseDate: '1985-06-01',
    type: 'well',
    sizeGb: 1.2,
    sha512: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hasDatumShiftIssues: true
  },
  {
    projectId: 'TYRA2021well0042',
    name: 'Tyra Alpha Pulse',
    quadrant: 'Danish Sector',
    status: 'RELEASED',
    releaseDate: '2022-11-15',
    type: 'well',
    sizeGb: 0.8,
    sha512: 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc2638bc',
    hasDatumShiftIssues: false
  },
  {
    projectId: 'QUAD211-1992well0007',
    name: 'Brent Delta Forensic',
    quadrant: '211',
    status: 'RESTRICTED',
    releaseDate: '2028-01-01',
    type: 'well',
    sizeGb: 4.5,
    sha512: '89a80e43d9426f0c43109a90e4f3a9e6e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8',
    hasDatumShiftIssues: true
  },
  {
    projectId: 'DUNLIN1982well0015',
    name: 'Dunlin Alpha Core',
    quadrant: '211',
    status: 'RELEASED',
    releaseDate: '1989-02-14',
    type: 'well',
    sizeGb: 2.1,
    sha512: 'a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e9f8',
    hasDatumShiftIssues: false
  }
];

// Mock Trauma Data for 3D Node
export const MOCK_TRAUMA_DATA: TraumaData[] = [];
for (let d = 1240; d < 1250; d += 0.5) {
  for (let f = 1; f <= 40; f++) {
    let deviation = Math.random() * 0.5;
    let corrosion = Math.random() * 15; // 0-100 index
    let temperature = 60 + (d - 1240) * 2 + Math.random() * 5; // 60-80C range
    let wallLoss = Math.random() * 5; // 0-25% range
    let waterLeakage = Math.random() * 5; // 0-100 index
    let stress = Math.random() * 10; // 0-100 index

    // Simulate Thistle A7 "C-Lock" Scar at 1245.5m
    if (d === 1245.5 && f > 10 && f < 15) {
      deviation = 4.8;
      corrosion = 72; // High corrosion at trauma site
      temperature = 88; // Friction/Leak heat
      wallLoss = 22; // Significant metal loss
      waterLeakage = 92; // Massive hydraulic bypass
      stress = 88; // Massive structural stress
    }
    
    // Simulate some corrosion pitting elsewhere
    if (d === 1248.5 && f > 30 && f < 35) {
      corrosion = 45;
      wallLoss = 12;
      waterLeakage = 15;
      stress = 30;
    }

    MOCK_TRAUMA_DATA.push({ fingerId: f, depth: d, deviation, corrosion, temperature, wallLoss, waterLeakage, stress });
  }
}

// Mock Pressure Data for Sawtooth Pulse
export const MOCK_PRESSURE_DATA: PressureData[] = [
  { timestamp: '00:00', pressure: 250 },
  { timestamp: '04:00', pressure: 450 },
  { timestamp: '08:00', pressure: 650 },
  { timestamp: '12:00', pressure: 850 },
  { timestamp: '12:01', pressure: 250 },
  { timestamp: '16:00', pressure: 450 },
  { timestamp: '20:00', pressure: 650 },
  { timestamp: '23:59', pressure: 850 },
];