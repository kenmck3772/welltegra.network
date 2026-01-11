
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
  // Fluid & Environmental Data
  fluidDensity: number; // ppg
  fluidType: string;
  viscosity: number; // cP
  surfaceTemp: number; // degF
  bottomHoleTemp: number; // degF
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
