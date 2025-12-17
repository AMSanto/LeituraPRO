import { Student, Assessment, SchoolClass } from "./types";

export const MOCK_CLASSES: SchoolClass[] = [
  { id: 'c1', name: 'Turma 2A', gradeLevel: '2º Ano', year: 2024 },
  { id: 'c2', name: 'Turma 2B', gradeLevel: '2º Ano', year: 2024 },
];

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Alice Silva', classId: 'c1', readingLevel: 'Intermediário', avatarUrl: 'https://picsum.photos/seed/alice/200' },
  { id: '2', name: 'Bernardo Costa', classId: 'c1', readingLevel: 'Fluente', avatarUrl: 'https://picsum.photos/seed/bernardo/200' },
];

export const MOCK_ASSESSMENTS: Assessment[] = [
  { 
    id: '101', 
    studentId: '1', 
    subject: 'Reading',
    date: '2024-02-15', 
    textTitle: 'O Gato de Botas', 
    accuracy: 85, 
    comprehension: 7, 
    notes: 'Boa fluência, dificuldade em inferência.',
    criteria: {
      fluency: { rhythm: true, pauses: true, intonation: false, security: true },
      comprehension: { mainIdea: true, explicit: true, implicit: false, inference: false, titleRelation: true }
    }
  },
  { 
    id: '102', 
    studentId: '1', 
    subject: 'Math',
    date: '2024-03-20', 
    textTitle: 'Desafio de Lógica: Formas', 
    accuracy: 92, 
    comprehension: 9, 
    notes: 'Demonstrou raciocínio rápido em padrões geométricos.',
    criteria: {
      math: { logicalReasoning: true, problemSolving: true, modeling: false, criticalThinking: true, cooperation: true }
    }
  }
];