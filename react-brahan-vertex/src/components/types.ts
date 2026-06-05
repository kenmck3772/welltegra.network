// Shared types - consolidated to avoid re-export issues

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

export interface ToolComponent {
  id: string;
  name: string;
  length: number;
  weight: number;
  maxOD: number;
  color: number;
  topConnection: string;
  bottomConnection: string;
  latchProfile?: string;
  latchMechanism?: string;
  specialFeature?: string;
}

export interface WellData {
  tubingID: number;
  nippleID: number;
  whp: number;
}

export interface WellboreData {
  casingOD: number;
  casingID: number;
  tubingOD: number;
  tubingID: number;
  tubingDepth: number;
  packerDepth: number;
  nippleProfile: string;
  nippleDepth: number;
  perfTop: number;
  perfBottom: number;
  fluidDensity: number;
  fluidType: string;
  viscosity: number;
  surfaceTemp: number;
  bottomHoleTemp: number;
}

export interface SurveyPoint {
  md: number;
  inc: number;
  azm: number;
  tvd: number;
}

export type NotificationType = 'success' | 'warn' | 'error' | 'info';

export interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
}

export enum ActiveTab {
  Components = 'components',
  Wellbore = 'wellbore',
  Survey = 'survey',
  AIAssistant = 'aiAssistant'
}

export enum ComponentType {
  CASING = 'Casing',
  TUBING = 'Tubing',
  PACKER = 'Packer',
  PERFORATION = 'Perforation',
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  topDepth: number;
}

export interface Casing extends BaseComponent {
  type: ComponentType.CASING;
  size: number;
  weight: number;
  bottomDepth: number;
  notes?: string;
}

export interface Tubing extends BaseComponent {
  type: ComponentType.TUBING;
  size: number;
  weight: number;
  bottomDepth: number;
  tally?: string;
  notes?: string;
}

export interface Packer extends BaseComponent {
  type: ComponentType.PACKER;
  packerType: string;
}

export interface Perforation extends BaseComponent {
  type: ComponentType.PERFORATION;
  bottomDepth: number;
  shotsPerFoot: number;
}

export type WellComponent = Casing | Tubing | Packer | Perforation;

export interface Point3D {
  x: number;
  y: number;
  z: number;
  md: number;
}

export enum WellType {
  PLATFORM = 'Platform',
  SUBSEA = 'Subsea',
}

export type SubseaStructureType = 'None' | 'Template' | 'Manifold' | 'PLET';

export interface BaseWell {
  id: string;
  name: string;
  type: WellType;
  components: WellComponent[];
  deviationSurvey: SurveyPoint[];
  surfaceX: number;
  surfaceY: number;
  datumElevation: number;
}

export interface PlatformWell extends BaseWell {
  type: WellType.PLATFORM;
}

export interface SubseaWell extends BaseWell {
  type: WellType.SUBSEA;
  waterDepth: number;
  subseaStructure?: SubseaStructureType;
}

export type Well = PlatformWell | SubseaWell;
