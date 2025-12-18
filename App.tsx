
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AssessmentForm } from './components/AssessmentForm';
import { ClassList } from './components/ClassList';
import { StudentHistory } from './components/StudentHistory';
import { TextGenerator } from './components/TextGenerator';
import { CompetencyManager } from './components/CompetencyManager';
import { supabase } from './services/supabase';
import { ViewState, Student, Assessment, SchoolClass, Competency } from './types';
import { Menu, GraduationCap, RefreshCw, Database, X, Settings, Code, CheckCircle } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_ASSESSMENTS, MOCK_CLASSES, MOCK_COMPETENCIES } from './constants';

const App: React.FC = () => {
  const [dataLoading, setDataLoading] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Inicialização inteligente: Tenta LocalStorage -> Caso contrário, Mocks
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('lp_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });
  
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('lp_assessments');
    return saved ? JSON.parse(saved) : MOCK_ASSESSMENTS;
  });
  
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('lp_classes');
    return saved ? JSON.parse(saved) : MOCK_CLASSES;
  });
  
  const [competencies, setCompetencies] = useState<Competency[]>(() => {
    const saved = localStorage.getItem('lp_competencies');
    return saved ? JSON.parse(saved) : MOCK_COMPETENCIES;
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Persistência automática no LocalStorage sempre que os estados mudarem
  useEffect(() => {
    localStorage.setItem('lp_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('lp_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('lp_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('lp_competencies', JSON.stringify(competencies));
  }, [competencies]);

  // Função para buscar dados do Supabase (Opcional)
  const fetchFromSupabase = useCallback(async () => {
    if (!supabase) return;
    setDataLoading(true);
    try {
      const { data: cls } = await supabase.from('school_classes').select('*');
      const { data: std } = await supabase.from('students').select('*');
      const { data: ast } = await supabase.from('assessments').select('*');
      const { data: cpt } = await supabase.from('competencies').select('*');

      if (cls && cls.length > 0) setClasses(cls.map(c => ({ id: c.id, name: c.name, gradeLevel: c.grade_level, year: c.year })));
      if (std && std.length > 0) setStudents(std.map(s => ({ id: s.id, name: s.name, classId: s.class_id, readingLevel: s.reading_level, avatarUrl: s.avatar_url })));
      if (ast && ast.length > 0) setAssessments(ast);
      if (cpt && cpt.length > 0) setCompetencies(cpt);
    } catch (e) {
      console.warn("Sincronização com Supabase falhou. Usando dados locais.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // --- FUNÇÕES DE GERENCIAMENTO (CRUD) ---

  const handleSaveStatus = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // Turmas
  const addClass = async (newClass: Omit<SchoolClass, 'id'>) => {
    const id = crypto.randomUUID();
    const item = { ...newClass, id };
    setClasses([...classes, item]);
    handleSaveStatus();
    if (supabase) await supabase.from('school_classes').insert([{ id, name: item.name, grade_level: item.gradeLevel, year: item.year }]);
  };

  const updateClass = async (updated: SchoolClass) => {
    setClasses(classes.map(c => c.id === updated.id ? updated : c));
    handleSaveStatus();
    if (supabase) await supabase.from('school_classes').update({ name: updated.name, grade_level: updated.gradeLevel, year: updated.year }).eq('id', updated.id);
  };

  const deleteClass = async (id: string) => {
    if (!window.confirm("Excluir esta turma apagará também todos os alunos dela. Confirmar?")) return;
    setClasses(classes.filter(c => c.id !== id));
    setStudents(students.filter(s => s.classId !== id));
    handleSaveStatus();
    if (supabase) await supabase.from('school_classes').delete().eq('id', id);
  };

  // Alunos
  const addStudent = async (newStudent: Omit<Student, 'id'>) => {
    const id = crypto.randomUUID();
    const item = { ...newStudent, id };
    setStudents([...students, item]);
    handleSaveStatus();
    if (supabase) await supabase.from('students').insert([{ id, name: item.name, class_id: item.classId, reading_level: item.readingLevel, avatar_url: item.avatarUrl }]);
  };

  const updateStudent = async (updated: Student) => {
    setStudents(students.map(s => s.id === updated.id ? updated : s));
    handleSaveStatus();
    if (supabase) await supabase.from('students').update({ name: updated.name, class_id: updated.classId, reading_level: updated.readingLevel, avatar_url: updated.avatarUrl }).eq('id', updated.id);
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm("Deseja excluir este aluno permanentemente?")) return;
    setStudents(students.filter(s => s.id !== id));
    setAssessments(assessments.filter(a => a.studentId !== id));
    handleSaveStatus();
    if (supabase) await supabase.from('students').delete().eq('id', id);
  };

  // Avaliações
  const addAssessment = async (newAst: Omit<Assessment, 'id'>) => {
    const id = crypto.randomUUID();
    const item = { ...newAst, id };
    setAssessments([item, ...assessments]);
    handleSaveStatus();
    setCurrentView(ViewState.DASHBOARD);
    if (supabase) await supabase.from('assessments').insert([{ ...item, student_id: item.studentId }]);
  };

  // Competências
  const addCompetency = async (newComp: Omit<Competency, 'id'>) => {
    const id = crypto.randomUUID();
    const item = { ...newComp, id };
    setCompetencies([...competencies, item]);
    handleSaveStatus();
    if (supabase) await supabase.from('competencies').insert([{ ...item }]);
  };

  const updateCompetency = async (updated: Competency) => {
    setCompetencies(competencies.map(c => c.id === updated.id ? updated : c));
    handleSaveStatus();
    if (supabase) await supabase.from('competencies').update({ ...updated }).eq('id', updated.id);
  };

  const deleteCompetency = async (id: string) => {
    setCompetencies(competencies.filter(c => c.id !== id));
    handleSaveStatus();
    if (supabase) await supabase.from('competencies').delete().eq('id', id);
  };

  const sqlScript = `
-- Script para o SQL Editor do Supabase (Acesso Público) --
CREATE TABLE IF NOT EXISTS school_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES school_classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reading_level TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  text_title TEXT,
  wpm INTEGER,
  accuracy INTEGER,
  comprehension INTEGER,
  math_score INTEGER,
  notes TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  weight INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE school_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE competencies DISABLE ROW LEVEL SECURITY;
  `.trim();

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      
      <Sidebar 
        currentView={currentView} 
        onNavigate={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 mr-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-xl">
              <Menu className="w-6 h-6" />
            </button>
            <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-2 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight ml-2">LeituraPro</span>
          </div>
          
          <div className="flex items-center gap-4">
            {saveStatus !== 'idle' && (
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${saveStatus === 'saving' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                {saveStatus === 'saving' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                {saveStatus === 'saving' ? 'Salvando...' : 'Alterações Salvas'}
              </div>
            )}
            <button 
              onClick={() => setShowSetupHelp(true)} 
              className="flex items-center gap-2 px-3 py-2 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all text-xs font-bold border border-primary-100"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Nuvem</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === ViewState.DASHBOARD && <Dashboard students={students} assessments={assessments} classes={classes} />}
            {currentView === ViewState.CLASSES && <ClassList classes={classes} students={students} onAddClass={addClass} onUpdateClass={updateClass} onDeleteClass={deleteClass} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />}
            {currentView === ViewState.STUDENTS && <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={addStudent} onUpdateStudent={updateStudent} onDeleteStudent={deleteStudent} onViewHistory={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} initialClassId={selectedClassId} />}
            {currentView === ViewState.STUDENT_HISTORY && students.find(s => s.id === selectedStudentId) && <StudentHistory student={students.find(s => s.id === selectedStudentId)!} assessments={assessments.filter(a => a.studentId === selectedStudentId)} onBack={() => setCurrentView(ViewState.STUDENTS)} />}
            {currentView === ViewState.ASSESSMENT && <AssessmentForm students={students} classes={classes} onSave={addAssessment} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />}
            {currentView === ViewState.GENERATOR && <TextGenerator />}
            {currentView === ViewState.COMPETENCIES && <CompetencyManager competencies={competencies} onAdd={addCompetency} onUpdate={updateCompetency} onDelete={deleteCompetency} />}
          </div>
        </div>
      </main>

      {showSetupHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-black text-gray-900">Configuração de Nuvem</h2>
              </div>
              <button onClick={() => setShowSetupHelp(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 text-green-900 font-black mb-4 uppercase tracking-wider text-sm">
                  <CheckCircle className="w-5 h-5" /> 
                  Seus dados estão seguros
                </h3>
                <p className="text-sm text-green-800 leading-relaxed font-medium">
                  Atualmente o aplicativo salva tudo no seu navegador (LocalStorage). Se você trocar de computador, os dados não estarão lá. Para sincronizar em qualquer lugar, use o Supabase.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-gray-900 font-black mb-4 uppercase tracking-wider text-sm">
                  <Code className="w-5 h-5 text-primary-600" /> 
                  Script SQL (SQL Editor):
                </h3>
                <div className="bg-gray-900 text-green-400 p-6 rounded-2xl text-[11px] font-mono overflow-x-auto relative">
                  <pre>{sqlScript}</pre>
                  <button onClick={() => { navigator.clipboard.writeText(sqlScript); alert('Copiado!'); }} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white font-bold">Copiar</button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white flex justify-end">
              <button onClick={() => setShowSetupHelp(false)} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 shadow-lg transition-all">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
