
export enum Section {
  OVERVIEW = 'Well Integrity Overview',
  TREES = 'Christmas Trees',
  ISSUES = 'Integrity Issues',
  MAINTENANCE = 'Maintenance History',
  PROCEDURES = 'Test Procedures',
  SETTINGS = 'Hub Configuration',
}

export interface MaintenanceRecord {
  date: string;
  action: string;
  cost: number;
  status: 'Completed' | 'Scheduled' | 'Failed';
}

export interface HubConfig {
  driftThreshold: number;
  driftWindow: number;
}

export interface PredictiveAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  recommendation: string;
  timestamp: string;
  suggestedDate?: string;
  telemetry?: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }[];
  linkedMaintenance?: MaintenanceRecord[];
}

export type ContentType = 'text' | 'svg' | 'chart' | 'error' | 'settings' | 'live-telemetry' | 'tree-unit';

export interface ContentPiece {
  type: ContentType;
  data: any;
}

export interface Content {
  title: string;
  pieces: ContentPiece[];
}
