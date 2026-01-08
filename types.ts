
export enum ClassType {
  HYBRID = 'Functional Hybrid',
  STRONGMAN = 'Strongman Focus',
  ENDURANCE = 'Endurance',
  PILATES = 'Pilates Mat / Yoga'
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
}

export interface Benchmark {
  id: string;
  name: string;
  category: 'Girl' | 'Hero' | 'Lift' | 'Custom';
  description: string;
}

export interface AnnualPhase {
  month: string;
  goal: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Peak';
  focus: string;
}

export interface AnnualPlan {
  id: string;
  year: number;
  name: string;
  phases: AnnualPhase[];
}

export interface TrainingCycle {
  id: string;
  name: string;
  goal: string;
  totalWeeks: number;
  currentWeek: number;
  startDate: string;
  macroPhaseLink?: string;
}

export interface WorkoutRequest {
  type: ClassType;
  focus?: string;
  cycleContext?: TrainingCycle | null;
  annualContext?: AnnualPlan | null;
  equipmentContext?: Equipment[];
  benchmarksContext?: Benchmark[];
  recentHistory?: GeneratedWorkout[];
  date?: string;
}

export interface GeneratedWorkout {
  id: string;
  markdown: string;
  type: ClassType;
  date: string;
  timestamp: number;
  updatedAt?: number;
}
