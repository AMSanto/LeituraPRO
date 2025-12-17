export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string;
  year: number;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  readingLevel: string;
  avatarUrl: string;
}

export type Subject = 'Reading' | 'Math';

export interface AssessmentCriteria {
  // Reading Specific
  fluency?: {
    rhythm: boolean;
    pauses: boolean;
    intonation: boolean;
    security: boolean;
  };
  decoding?: {
    recognition: boolean;
    noOmissions: boolean;
    complexWords: boolean;
  };
  // Math Specific
  math?: {
    logicalReasoning: boolean; // Raciocínio Lógico
    problemSolving: boolean;   // Resolver Problemas
    modeling: boolean;         // Modelar Situações
    criticalThinking: boolean; // Pensamento Crítico
    cooperation: boolean;      // Cooperação
  };
  comprehension?: {
    mainIdea: boolean;
    explicit: boolean;
    implicit: boolean;
    inference: boolean;
    titleRelation: boolean;
  };
}

export interface Assessment {
  id: string;
  studentId: string;
  subject: Subject;
  date: string;
  textTitle: string; // Ou "Tópico da Aula" para Matemática
  wpm?: number; // Opcional para Math
  accuracy: number; // Precisão na leitura ou no cálculo
  comprehension: number; 
  criteria?: AssessmentCriteria;
  notes: string;
  aiFeedback?: string;
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
  GENERATOR = 'GENERATOR'
}