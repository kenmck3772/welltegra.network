
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
  size: number; // inches
  weight: number; // lb/ft
  bottomDepth: number;
  notes?: string;
}

export interface Tubing extends BaseComponent {
  type: ComponentType.TUBING;
  size: number; // inches
  weight: number; // lb/ft
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

export interface SurveyPoint {
  md: number; // Measured Depth
  inc: number; // Inclination
  azm: number; // Azimuth
  tvd: number; // True Vertical Depth
}

export interface Point3D {
  x: number; // Easting
  y: number; // Northing
  z: number; // True Vertical Depth (TVD)
  md: number; // Measured Depth
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
  datumElevation: number; // RKB to MSL/Seabed datum
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
