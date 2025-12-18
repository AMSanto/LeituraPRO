
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AssessmentForm } from './components/AssessmentForm';
import { ClassList } from './components/ClassList';
import { StudentHistory } from './components/StudentHistory';
import { TextGenerator } from './components/TextGenerator';
import { CompetencyManager } from './components/CompetencyManager';
import { Auth } from './components/Auth';
import { supabase } from './services/supabase';
import { ViewState, Student, Assessment, SchoolClass, Competency } from './types';
import { Menu, GraduationCap, LogOut, Loader2, RefreshCw, AlertTriangle, Settings, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // 1. Verificar Inicialização do Supabase
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-red-100 text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Erro de Configuração</h1>
          <p className="text-gray-600 mb-6">
            Não foi possível inicializar o cliente Supabase. Verifique suas credenciais.
          </p>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Abrir Dashboard Supabase <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // 2. Monitorar Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setStudents([]);
        setAssessments([]);
        setClasses([]);
        setCompetencies([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Buscar Dados
  const fetchUserData = async () => {
    if (!session || !supabase) return;
    setDataLoading(true);
    setDbError(null);
    try {
      const [clsRes, stdRes, astRes, cptRes] = await Promise.all([
        supabase.from('school_classes').select('*').order('name'),
        supabase.from('students').select('*').order('name'),
        supabase.from('assessments').select('*').order('date', { ascending: false }),
        supabase.from('competencies').select('*').order('name')
      ]);

      if (clsRes.error) throw clsRes.error;
      if (stdRes.error) throw stdRes.error;
      if (astRes.error) throw astRes.error;
      if (cptRes.error) throw cptRes.error;

      setClasses(clsRes.data || []);
      setStudents(stdRes.data || []);
      setAssessments(astRes.data || []);
      setCompetencies(cptRes.data || []);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      setDbError(error.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchUserData();
  }, [session]);

  // --- HANDLERS ---

  const handleAddClass = async (newClass: Omit<SchoolClass, 'id'>) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('school_classes').insert([{ ...newClass, user_id: session.user.id }]).select();
    if (error) alert(error.message);
    else if (data) setClasses([...classes, data[0]]);
  };

  const handleUpdateClass = async (updatedClass: SchoolClass) => {
    if (!supabase) return;
    const { error } = await supabase.from('school_classes').update(updatedClass).eq('id', updatedClass.id);
    if (error) alert(error.message);
    else setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleDeleteClass = async (id: string) => {
    if (!supabase) return;
    if (window.confirm('Excluir turma?')) {
      const { error } = await supabase.from('school_classes').delete().eq('id', id);
      if (error) alert(error.message);
      else setClasses(classes.filter(c => c.id !== id));
    }
  };

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('students').insert([{ ...newStudent, user_id: session.user.id }]).select();
    if (error) alert(error.message);
    else if (data) setStudents([...students, data[0]]);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    if (!supabase) return;
    const { error } = await supabase.from('students').update(updatedStudent).eq('id', updatedStudent.id);
    if (error) alert(error.message);
    else setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = async (id: string) => {
    if (!supabase) return;
    if (window.confirm('Excluir aluno?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) alert(error.message);
      else setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleAddAssessment = async (newAssessment: Omit<Assessment, 'id'>) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('assessments').insert([{ ...newAssessment, user_id: session.user.id }]).select();
    if (error) alert(error.message);
    else if (data) {
      setAssessments([data[0], ...assessments]);
      setCurrentView(ViewState.DASHBOARD);
    }
  };

  // HANDLERS COMPETÊNCIAS (INTEGRADOS AGORA)
  const handleAddCompetency = async (newComp: Omit<Competency, 'id'>) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('competencies').insert([{ ...newComp, user_id: session.user.id }]).select();
    if (error) alert(error.message);
    else if (data) setCompetencies([...competencies, data[0]]);
  };

  const handleUpdateCompetency = async (updatedComp: Competency) => {
    if (!supabase) return;
    const { error } = await supabase.from('competencies').update(updatedComp).eq('id', updatedComp.id);
    if (error) alert(error.message);
    else setCompetencies(competencies.map(c => c.id === updatedComp.id ? updatedComp : c));
  };

  const handleDeleteCompetency = async (id: string) => {
    if (!supabase) return;
    if (window.confirm('Deseja excluir esta competência?')) {
      const { error } = await supabase.from('competencies').delete().eq('id', id);
      if (error) alert(error.message);
      else setCompetencies(competencies.filter(c => c.id !== id));
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    if (window.confirm("Deseja realmente sair?")) {
      await supabase.auth.signOut();
    }
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (view !== ViewState.STUDENTS) setSelectedClassId('');
    if (view !== ViewState.STUDENT_HISTORY) setSelectedStudentId('');
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    if (dbError) {
      return (
        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Erro de Conexão</h2>
          <p className="text-gray-500 mt-2">{dbError}</p>
          <button onClick={fetchUserData} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold">Tentar Novamente</button>
        </div>
      );
    }

    if (dataLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin mb-4 text-primary-500" />
          <p className="font-bold text-gray-700">Sincronizando dados...</p>
        </div>
      );
    }

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard students={students} assessments={assessments} classes={classes} />;
      case ViewState.CLASSES:
        return <ClassList classes={classes} students={students} onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />;
      case ViewState.STUDENTS:
        return <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={handleAddStudent} onUpdateStudent={handleUpdateStudent} onDeleteStudent={handleDeleteStudent} onViewHistory={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} initialClassId={selectedClassId} />;
      case ViewState.STUDENT_HISTORY:
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) return <Dashboard students={students} assessments={assessments} classes={classes} />;
        return <StudentHistory student={student} assessments={assessments.filter(a => a.studentId === student.id)} onBack={() => setCurrentView(ViewState.STUDENTS)} />;
      case ViewState.ASSESSMENT:
        return <AssessmentForm students={students} classes={classes} onSave={handleAddAssessment} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.GENERATOR:
        return <TextGenerator />;
      case ViewState.COMPETENCIES:
        return <CompetencyManager competencies={competencies} onAdd={handleAddCompetency} onUpdate={handleUpdateCompetency} onDelete={handleDeleteCompetency} />;
      default:
        return <Dashboard students={students} assessments={assessments} classes={classes} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:z-auto`}>
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 mr-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-xl">
                <Menu className="w-6 h-6" />
            </button>
            <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-2 rounded-xl shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-gray-800 tracking-tight hidden sm:inline">LeituraPro AI</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Professor(a)</span>
                <span className="text-sm text-primary-700 font-bold">{session?.user?.email}</span>
            </div>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50">
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
