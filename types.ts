
export enum UserRole {
  PROFESSOR = 'PROFESSOR',
  COORDINATION = 'COORDINATION'
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

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
  teacherId?: string; // ID do professor responsável
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
  remedialHistory?: RemedialRecord[];
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
  teacherId?: string;
}

// Fixed missing Competency export
export interface Competency {
  id: string;
  name: string;
  description: string;
  category: 'Leitura' | 'Matemática' | 'Socioemocional' | 'Geral';
  weight: number;
}

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
  REMEDIAL = 'REMEDIAL',
  COORDINATION_PANEL = 'COORDINATION_PANEL'
}
