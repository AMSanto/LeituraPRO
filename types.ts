
export interface RemedialRecord {
  entryDate: string;
  entryLevel: string;
  exitDate?: string;
  exitLevel?: string;
  durationDays?: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string;
  year: number;
  teacher: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  readingLevel: string;
  avatarUrl: string;
  inRemedial?: boolean;
  remedialStartDate?: string;
  remedialEntryLevel?: string;
  remedialHistory?: RemedialRecord[]; // Histórico de passagens pelo reforço
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: 'Leitura' | 'Matemática' | 'Socioemocional' | 'Geral';
  weight: number;
}

export interface AssessmentCriteria {
  fluency: {
    rhythm: boolean;
    pauses: boolean;
    intonation: boolean;
    security: boolean;
  };
  decoding: {
    recognition: boolean;
    noOmissions: boolean;
    complexWords: boolean;
  };
  comprehension: {
    mainIdea: boolean;
    explicit: boolean;
    implicit: boolean;
    inference: boolean;
    titleRelation: boolean;
  };
  math?: {
    numberSense: boolean;
    operations: boolean;
    problemSolving: boolean;
    logicReasoning: boolean;
    geometry: boolean;
  };
}

export interface Assessment {
  id: string;
  studentId: string;
  date: string;
  textTitle: string;
  wpm: number;
  accuracy: number;
  comprehension: number;
  mathScore?: number;
  criteria?: AssessmentCriteria;
  notes: string;
  aiFeedback?: string;
}

// Added missing interface for reading material generated via AI
export interface ReadingMaterial {
  title: string;
  content: string;
  level: string;
  suggestedQuestions: string[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CLASSES = 'CLASSES',
  STUDENTS = 'STUDENTS',
  STUDENT_HISTORY = 'STUDENT_HISTORY',
  ASSESSMENT = 'ASSESSMENT',
  GENERATOR = 'GENERATOR',
  COMPETENCIES = 'COMPETENCIES',
  REMEDIAL = 'REMEDIAL'
}
