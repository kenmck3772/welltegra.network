
export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
}

export interface Module {
  id: string;
  title: string;
  objective: string;
  lessons: Lesson[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CareerPath {
  startRole: string;
  midPath: string;
  endGoal: string;
  skills: string[];
  justification: string;
}

export interface ConceptTranslation {
  physicsExplanation: string;
  hobbyAnalogy: string;
  keyTakeaway: string;
  realWorldScenario: string;
  mathematicalLogic: string;
}

export interface BackgroundAnalysis {
  transferabilityScore: number;
  strengthsDeepDive: string;
  gapAnalysis: string;
  transitionStrategy: string;
  recommendedFocus: string[];
}

export type AppState = 'DASHBOARD' | 'LEARN' | 'MAPPER' | 'BRIDGE' | 'ASSESSMENT' | 'SIMULATOR' | 'EXAM_PREP';
