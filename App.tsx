
import React, { useState, useEffect, useCallback } from 'react';
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
import { Menu, GraduationCap, LogOut, Loader2, RefreshCw, AlertTriangle, Settings, ExternalLink, ShieldAlert } from 'lucide-react';

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
          <p className="text-gray-600 mb-6">Não foi possível inicializar o cliente Supabase.</p>
        </div>
      </div>
    );
  }

  // 2. Monitorar Sessão com cleanup robusto
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
    };

    checkSession();

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

  // 3. Buscar Dados com tratamento de erro RLS
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id || !supabase) return;
    
    setDataLoading(true);
    setDbError(null);
    
    try {
      // Nota: As políticas RLS no servidor cuidarão de filtrar pelo user_id automaticamente
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
      console.error('Erro de permissão ou conexão:', error);
      setDbError(error.message === 'new row violates row-level security policy' 
        ? 'Violação de segurança: Você não tem permissão para esta operação.' 
        : `Falha ao carregar dados: ${error.message}`);
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchUserData();
  }, [session, fetchUserData]);

  // --- HANDLERS COM PROTEÇÃO DE ID ---

  const handleAction = async (action: () => Promise<any>, successMsg?: string) => {
    try {
      const { error } = await action();
      if (error) {
        if (error.code === '42501') throw new Error('Acesso negado por política de segurança (RLS).');
        throw error;
      }
      if (successMsg) console.log(successMsg);
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
      return false;
    }
    return true;
  };

  const handleAddClass = async (newClass: Omit<SchoolClass, 'id'>) => {
    const { data, error } = await supabase.from('school_classes').insert([{ ...newClass, user_id: session.user.id }]).select();
    if (!error && data) setClasses([...classes, data[0]]);
    else if (error) alert(`Erro ao criar turma: ${error.message}`);
  };

  const handleUpdateClass = async (updatedClass: SchoolClass) => {
    const { error } = await supabase.from('school_classes').update(updatedClass).eq('id', updatedClass.id).eq('user_id', session.user.id);
    if (!error) setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    else alert(`Erro ao atualizar: ${error.message}`);
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('Excluir turma?')) return;
    const { error } = await supabase.from('school_classes').delete().eq('id', id).eq('user_id', session.user.id);
    if (!error) setClasses(classes.filter(c => c.id !== id));
    else alert(`Erro ao excluir: ${error.message}`);
  };

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    const { data, error } = await supabase.from('students').insert([{ ...newStudent, user_id: session.user.id }]).select();
    if (!error && data) setStudents([...students, data[0]]);
    else alert(`Erro ao adicionar aluno: ${error.message}`);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const { error } = await supabase.from('students').update(updatedStudent).eq('id', updatedStudent.id).eq('user_id', session.user.id);
    if (!error) setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    else alert(`Erro ao atualizar aluno: ${error.message}`);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Excluir aluno?')) return;
    const { error } = await supabase.from('students').delete().eq('id', id).eq('user_id', session.user.id);
    if (!error) setStudents(students.filter(s => s.id !== id));
    else alert(`Erro ao excluir: ${error.message}`);
  };

  const handleAddAssessment = async (newAssessment: Omit<Assessment, 'id'>) => {
    const { data, error } = await supabase.from('assessments').insert([{ ...newAssessment, user_id: session.user.id }]).select();
    if (!error && data) {
      setAssessments([data[0], ...assessments]);
      setCurrentView(ViewState.DASHBOARD);
    } else alert(`Erro ao salvar avaliação: ${error.message}`);
  };

  const handleAddCompetency = async (newComp: Omit<Competency, 'id'>) => {
    const { data, error } = await supabase.from('competencies').insert([{ ...newComp, user_id: session.user.id }]).select();
    if (!error && data) setCompetencies([...competencies, data[0]]);
    else alert(`Erro: ${error.message}`);
  };

  const handleUpdateCompetency = async (updatedComp: Competency) => {
    const { error } = await supabase.from('competencies').update(updatedComp).eq('id', updatedComp.id).eq('user_id', session.user.id);
    if (!error) setCompetencies(competencies.map(c => c.id === updatedComp.id ? updatedComp : c));
    else alert(`Erro: ${error.message}`);
  };

  const handleDeleteCompetency = async (id: string) => {
    if (!window.confirm('Excluir competência?')) return;
    const { error } = await supabase.from('competencies').delete().eq('id', id).eq('user_id', session.user.id);
    if (!error) setCompetencies(competencies.filter(c => c.id !== id));
    else alert(`Erro: ${error.message}`);
  };

  const handleSignOut = async () => {
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
        <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito ou Falha</h2>
          <p className="text-gray-500 mt-2 max-w-md">{dbError}</p>
          <div className="flex gap-4 mt-8">
            <button onClick={fetchUserData} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Tentar Novamente
            </button>
            <button onClick={() => setDbError(null)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all">
              Ignorar
            </button>
          </div>
        </div>
      );
    }

    if (dataLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin mb-4 text-primary-500" />
          <p className="font-bold text-gray-700 animate-pulse">Protegendo sua sessão e carregando dados...</p>
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
            <span className="font-extrabold text-xl text-gray-800 tracking-tight hidden sm:inline">LeituraPro AntMarques</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Acesso Seguro</span>
                <span className="text-sm text-primary-700 font-bold truncate max-w-[150px]">{session?.user?.email}</span>
            </div>
            <button onClick={handleSignOut} title="Sair com segurança" className="text-gray-400 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50 transition-colors">
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
