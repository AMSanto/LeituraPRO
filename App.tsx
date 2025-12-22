
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AssessmentForm } from './components/AssessmentForm';
import { ClassList } from './components/ClassList';
import { StudentHistory } from './components/StudentHistory';
import { TextGenerator } from './components/TextGenerator';
import { CompetencyManager } from './components/CompetencyManager';
import { RemedialList } from './components/RemedialList';
import { CoordinationPanel } from './components/CoordinationPanel';
import { Auth } from './components/Auth';
import { ViewState, Student, Assessment, SchoolClass, Competency, RemedialRecord, UserRole, UserProfile } from './types';
import { Menu, GraduationCap, CheckCircle, User, X, Users, School, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // 1. Gerenciamento de Sessão e Perfil
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        clearData();
      } else if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase!.from('profiles').select('*').eq('id', uid).single();
    if (data) setUserProfile(data);
  };

  const clearData = () => {
    setStudents([]);
    setAssessments([]);
    setClasses([]);
    setCurrentView(ViewState.DASHBOARD);
  };

  // 2. Carregamento de Dados Real
  useEffect(() => {
    if (session && supabase) {
      loadAllData();
    }
  }, [session]);

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [resClasses, resStudents, resAssessments] = await Promise.all([
        supabase!.from('classes').select('*'),
        supabase!.from('students').select('*, remedial_history(*)'),
        supabase!.from('assessments').select('*').order('date', { ascending: false })
      ]);

      if (resClasses.data) setClasses(resClasses.data);
      if (resStudents.data) {
        setStudents(resStudents.data.map(s => ({
          ...s,
          remedialHistory: s.remedial_history // Mapeamento para camelCase se necessário
        })));
      }
      if (resAssessments.data) setAssessments(resAssessments.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSaveStatus = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 600);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // 3. Operações de CRUD com Supabase
  const addStudent = async (ns: Omit<Student, 'id'>) => {
    handleSaveStatus();
    const { data, error } = await supabase!.from('students').insert([ns]).select();
    if (data) setStudents([...students, data[0]]);
  };

  const updateStudent = async (us: Student) => {
    handleSaveStatus();
    const { error } = await supabase!.from('students').update(us).eq('id', us.id);
    if (!error) setStudents(students.map(s => s.id === us.id ? us : s));
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Excluir este aluno permanentemente?")) return;
    const { error } = await supabase!.from('students').delete().eq('id', id);
    if (!error) setStudents(students.filter(s => s.id !== id));
  };

  const addClass = async (nc: Omit<SchoolClass, 'id'>) => {
    handleSaveStatus();
    const { data, error } = await supabase!.from('classes').insert([{ ...nc, teacher_id: userProfile?.id }]).select();
    if (data) setClasses([...classes, data[0]]);
  };

  const saveAssessment = async (a: Omit<Assessment, 'id'>) => {
    handleSaveStatus();
    const { data, error } = await supabase!.from('assessments').insert([{ ...a, teacher_id: userProfile?.id }]).select();
    if (data) {
      setAssessments([data[0], ...assessments]);
      setCurrentView(ViewState.DASHBOARD);
    }
  };

  const toggleRemedial = async (studentId: string, startDate?: string, entryLevel?: string, exitLevel?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleSaveStatus();
    const entering = !student.inRemedial;
    const now = new Date().toISOString().split('T')[0];

    if (entering) {
      const update = { inRemedial: true, remedialStartDate: startDate || now, remedialEntryLevel: entryLevel || student.readingLevel };
      await supabase!.from('students').update(update).eq('id', studentId);
      setStudents(students.map(s => s.id === studentId ? { ...s, ...update } : s));
    } else {
      const record = {
        student_id: studentId,
        entry_date: student.remedialStartDate,
        entry_level: student.remedialEntryLevel,
        exit_date: now,
        exit_level: exitLevel || student.readingLevel,
        duration_days: Math.ceil(Math.abs(new Date(now).getTime() - new Date(student.remedialStartDate!).getTime()) / (1000 * 60 * 60 * 24))
      };
      
      await Promise.all([
        supabase!.from('remedial_history').insert([record]),
        supabase!.from('students').update({ 
          inRemedial: false, 
          remedialStartDate: null, 
          remedialEntryLevel: null,
          readingLevel: exitLevel || student.readingLevel 
        }).eq('id', studentId)
      ]);
      
      loadAllData(); // Recarrega para garantir sincronia do histórico
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Autenticando...</p>
    </div>
  );

  if (!session) return <Auth />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar currentView={currentView} onNavigate={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} userRole={userProfile?.role} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0 z-30 shadow-sm px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 md:hidden hover:bg-gray-100 rounded-xl"><Menu /></button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-2xl border border-purple-100">
                <Users size={16} className="text-purple-600" />
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">ALUNOS: <span className="text-gray-900 text-sm ml-1">{students.length}</span></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <School size={16} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">TURMAS: <span className="text-gray-900 text-sm ml-1">{classes.length}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {dataLoading && <Loader2 size={16} className="animate-spin text-primary-500" />}
            {saveStatus !== 'idle' && (
              <div className="text-[10px] font-black px-4 py-2 rounded-full bg-green-50 text-green-600 flex items-center gap-2 animate-fade-in tracking-[0.2em] uppercase border border-green-100">
                <CheckCircle size={12}/> {saveStatus === 'saving' ? 'SINCRONIZANDO' : 'SINC. OK'}
              </div>
            )}
            
            <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-4 pl-6 py-1 hover:bg-gray-50 rounded-[2rem] transition-all group border-l-2 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{userProfile?.role === UserRole.COORDINATION ? 'Coordenação' : 'Professor'}</p>
                <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors uppercase">{userProfile?.name}</p>
              </div>
              <div className="bg-gray-900 p-2.5 rounded-2xl group-hover:bg-primary-500 transition-all shadow-lg">
                <User size={20} className="text-white" />
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentView === ViewState.DASHBOARD && <Dashboard students={students} assessments={assessments} classes={classes} />}
            {currentView === ViewState.COORDINATION_PANEL && <CoordinationPanel assessments={assessments} students={students} classes={classes} />}
            {currentView === ViewState.CLASSES && <ClassList classes={classes} students={students} onAddClass={addClass} onUpdateClass={async (c) => { await supabase!.from('classes').update(c).eq('id', c.id); setClasses(classes.map(cl => cl.id === c.id ? c : cl)); }} onDeleteClass={async (id) => { if(confirm("Excluir turma?")) { await supabase!.from('classes').delete().eq('id', id); setClasses(classes.filter(c => c.id !== id)); } }} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />}
            {currentView === ViewState.STUDENTS && <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={addStudent} onUpdateStudent={updateStudent} onDeleteStudent={deleteStudent} onViewHistory={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} onToggleRemedial={toggleRemedial} initialClassId={selectedClassId} />}
            {currentView === ViewState.REMEDIAL && <RemedialList students={students} classes={classes} onToggleRemedial={toggleRemedial} onViewStudent={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} />}
            {currentView === ViewState.STUDENT_HISTORY && students.find(s => s.id === selectedStudentId) && <StudentHistory student={students.find(s => s.id === selectedStudentId)!} assessments={assessments.filter(a => a.studentId === selectedStudentId)} onBack={() => setCurrentView(ViewState.STUDENTS)} />}
            {currentView === ViewState.ASSESSMENT && <AssessmentForm students={students} classes={classes} onSave={saveAssessment} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />}
            {currentView === ViewState.GENERATOR && <TextGenerator />}
          </div>
        </div>
      </main>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-sm p-12 shadow-2xl animate-fade-in ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">MEU PERFIL</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
            </div>
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">E-mail</p>
                <p className="font-bold text-xs text-gray-600 mb-4">{userProfile?.email}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nível de Acesso</p>
                <p className="font-black text-sm text-gray-900 flex items-center gap-2 uppercase">{userProfile?.role}</p>
              </div>
              <button onClick={handleSignOut} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl">ENCERRAR SESSÃO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
