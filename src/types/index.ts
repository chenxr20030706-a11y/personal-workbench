export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  route: string;
  order: number;
  visible: boolean;
  description: string;
  badge?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  date: string;
  abstract: string;
  tags: string[];
  week: number;
  year: number;
}

export interface ExperimentNote {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  week: number;
  year: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  status: 'reading' | 'finished' | 'want-to-read';
  isPhysical: boolean;
  needReread: boolean;
  tags: string[];
  startedDate?: string;
  finishedDate?: string;
  thoughts: string[];
  progress: number;
}

export interface ReadingStats {
  week: number;
  year: number;
  booksRead: number;
  totalMinutes: number;
  categories: Record<string, number>;
  dailyMinutes: { day: string; minutes: number }[];
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  poster: string;
  rating: number;
  review: string;
  watchCount: number;
  tags: string[];
  lastWatchedDate?: string;
  year: number;
}

export interface JobPosition {
  id: string;
  company: string;
  position: string;
  link: string;
  status: 'interested' | 'applied' | 'interview' | 'offer' | 'rejected';
  postedDate: string;
  category: string;
  interviewDate?: string;
  notes: string;
  salary?: string;
  location?: string;
}

export interface InterviewExperience {
  id: string;
  company: string;
  date: string;
  round: string;
  questions: string;
  summary: string;
  tags: string[];
}

export interface IeltsModule {
  id: 'listening' | 'speaking' | 'reading' | 'writing' | 'vocabulary';
  name: string;
  totalHours: number;
  targetScore: number;
  currentScore: number;
}

export interface StudyRecord {
  id: string;
  date: string;
  module: string;
  duration: number;
  content: string;
}

export interface CheckInRecord {
  date: string;
  completed: boolean;
  modules: string[];
}

export interface HealthData {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  steps?: number;
  exerciseMinutes?: number;
  sleepHours?: number;
  water?: number;
}

export interface NutrientSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AINutritionAdvice {
  overall: string;
  suggestions: string[];
  warnings: string[];
  score: number;
}

export interface MealRecord {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  time: string;
  takenDates: string[];
}

export interface FitnessGoal {
  id: string;
  type: 'weight' | 'body-fat' | 'muscle';
  targetValue: number;
  currentValue: number;
  startValue: number;
  startDate: string;
  targetDate: string;
  unit: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
}

// ===== 科研模块扩展类型 =====

export type ResearchFramework = 'PICO' | 'PEO' | 'SPIDER' | 'PCC' | 'none';

export interface ResearchQuestion {
  id: string;
  topic: string;
  framework: ResearchFramework;
  socraticQuestions: string[];
  answers: string[];
  refinedQuestion: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiteratureMatrixEntry {
  id: string;
  paperId?: string;
  title: string;
  authors: string;
  year: string;
  methods: string;
  mainFindings: string;
  limitations: string;
  relevance: string;
  addedAt: string;
}

export interface OutlineSubsection {
  id: string;
  name: string;
  description: string;
}

export interface OutlineSection {
  id: string;
  name: string;
  subsections: OutlineSubsection[];
}

export interface PaperOutline {
  id: string;
  title: string;
  researchQuestion: string;
  sections: OutlineSection[];
  createdAt: string;
}

export interface PaperAbstract {
  id: string;
  background: string;
  methods: string;
  results: string;
  conclusion: string;
  generatedAbstract: string;
  createdAt: string;
}

export interface ExperimentStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface ExperimentPlan {
  id: string;
  title: string;
  hypothesis: string;
  independentVariable: string;
  dependentVariable: string;
  controlGroup: string;
  sampleSize: string;
  steps: ExperimentStep[];
  createdAt: string;
}

export interface BilingualSegment {
  id: string;
  en: string;
  zh: string;
}

export interface Terminology {
  id: string;
  term: string;
  translation: string;
  definition?: string;
}

export interface FigureMarker {
  id: string;
  position: number;
  label: string;
  description: string;
}

export interface ReadingPaper {
  id: string;
  title: string;
  source: string;
  sourceValue: string;
  segments: BilingualSegment[];
  terminology: Terminology[];
  figureMarkers: FigureMarker[];
  notes: string;
  createdAt: string;
}

export type FrameworkTemplate = 'flow' | 'mechanism' | 'dataflow';

export interface FrameworkNode {
  id: string;
  label: string;
  type: 'root' | 'question' | 'method' | 'result';
  color: string;
}

export interface FrameworkEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FrameworkFigure {
  id: string;
  title: string;
  template: FrameworkTemplate;
  nodes: FrameworkNode[];
  edges: FrameworkEdge[];
  createdAt: string;
}

export interface PolishingSuggestion {
  original: string;
  suggestion: string;
  reason: string;
  type: 'grammar' | 'clarity' | 'academic' | 'conciseness';
}
