
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
import { Menu, GraduationCap, CheckCircle, User, Settings, X, Users, School, Loader2, AlertTriangle } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_ASSESSMENTS, MOCK_CLASSES, MOCK_COMPETENCIES } from './constants';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('lp_students');
      return saved ? JSON.parse(saved) : MOCK_STUDENTS;
    } catch { return MOCK_STUDENTS; }
  });
  
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    try {
      const saved = localStorage.getItem('lp_assessments');
      return saved ? JSON.parse(saved) : MOCK_ASSESSMENTS;
    } catch { return MOCK_ASSESSMENTS; }
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    try {
      const saved = localStorage.getItem('lp_classes');
      return saved ? JSON.parse(saved) : MOCK_CLASSES;
    } catch { return MOCK_CLASSES; }
  });

  const [competencies, setCompetencies] = useState<Competency[]>(() => {
    try {
      const saved = localStorage.getItem('lp_competencies');
      return saved ? JSON.parse(saved) : MOCK_COMPETENCIES;
    } catch { return MOCK_COMPETENCIES; }
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Carregar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserProfile({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Usuário',
          role: session.user.user_metadata.role || UserRole.PROFESSOR,
          email: session.user.email || ''
        });
      }
      setAuthLoading(false);
    });

    // Escutar mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setCurrentView(ViewState.DASHBOARD);
      } else if (session?.user) {
        setUserProfile({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Usuário',
          role: session.user.user_metadata.role || UserRole.PROFESSOR,
          email: session.user.email || ''
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem('lp_students', JSON.stringify(students));
      localStorage.setItem('lp_assessments', JSON.stringify(assessments));
      localStorage.setItem('lp_classes', JSON.stringify(classes));
      localStorage.setItem('lp_competencies', JSON.stringify(competencies));
    }
  }, [students, assessments, classes, competencies, session]);

  const handleSaveStatus = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const toggleRemedial = (studentId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const entering = !s.inRemedial;
        const now = new Date().toISOString().split('T')[0];
        if (entering) {
          return { ...s, inRemedial: true, remedialStartDate: now, remedialEntryLevel: s.readingLevel };
        } else {
          const record: RemedialRecord = {
            entryDate: s.remedialStartDate!,
            entryLevel: s.remedialEntryLevel || 'Não informado',
            exitDate: now,
            exitLevel: s.readingLevel,
            durationDays: Math.ceil(Math.abs(new Date(now).getTime() - new Date(s.remedialStartDate!).getTime()) / (1000 * 60 * 60 * 24))
          };
          return { ...s, inRemedial: false, remedialStartDate: undefined, remedialEntryLevel: undefined, remedialHistory: [...(s.remedialHistory || []), record] };
        }
      }
      return s;
    }));
    handleSaveStatus();
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setAuthLoading(false);
    setShowProfileModal(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Verificando Credenciais...</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-gray-900 uppercase mb-2">Erro de Configuração</h1>
        <p className="text-gray-600 max-w-sm">O serviço de banco de dados não pôde ser inicializado. Verifique as chaves do Supabase.</p>
      </div>
    );
  }

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
            {saveStatus !== 'idle' && (
              <div className="text-[10px] font-black px-4 py-2 rounded-full bg-green-50 text-green-600 flex items-center gap-2 animate-fade-in tracking-[0.2em] uppercase border border-green-100">
                <CheckCircle size={12}/> {saveStatus === 'saving' ? 'SALVANDO' : 'DADOS OK'}
              </div>
            )}
            
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-4 pl-6 py-1 hover:bg-gray-50 rounded-[2rem] transition-all group border-l-2 border-gray-100"
            >
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
            {currentView === ViewState.CLASSES && <ClassList classes={classes} students={students} onAddClass={(nc) => { setClasses([...classes, {...nc, id: crypto.randomUUID(), teacherId: userProfile?.id}]); handleSaveStatus(); }} onUpdateClass={(uc) => setClasses(classes.map(c => c.id === uc.id ? uc : c))} onDeleteClass={(id) => setClasses(classes.filter(c => c.id !== id))} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />}
            {currentView === ViewState.STUDENTS && <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={(ns) => { setStudents([...students, {...ns, id: crypto.randomUUID()}]); handleSaveStatus(); }} onUpdateStudent={(us) => setStudents(students.map(s => s.id === us.id ? us : s))} onDeleteStudent={(id) => setStudents(students.filter(s => s.id !== id))} onViewHistory={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} onToggleRemedial={toggleRemedial} initialClassId={selectedClassId} />}
            {currentView === ViewState.REMEDIAL && <RemedialList students={students} classes={classes} onToggleRemedial={toggleRemedial} onViewStudent={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} />}
            {currentView === ViewState.STUDENT_HISTORY && students.find(s => s.id === selectedStudentId) && <StudentHistory student={students.find(s => s.id === selectedStudentId)!} assessments={assessments.filter(a => a.studentId === selectedStudentId)} onBack={() => setCurrentView(ViewState.STUDENTS)} />}
            {currentView === ViewState.ASSESSMENT && <AssessmentForm students={students} classes={classes} onSave={(a) => { setAssessments([{...a, id: crypto.randomUUID(), teacherId: userProfile?.id}, ...assessments]); setCurrentView(ViewState.DASHBOARD); }} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />}
            {currentView === ViewState.GENERATOR && <TextGenerator />}
            {currentView === ViewState.COMPETENCIES && <CompetencyManager competencies={competencies} onAdd={(c) => setCompetencies([...competencies, {...c, id: crypto.randomUUID()}])} onUpdate={(u) => setCompetencies(competencies.map(c => c.id === u.id ? u : c))} onDelete={(id) => setCompetencies(competencies.filter(c => c.id !== id))} />}
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
                <p className="font-black text-sm text-gray-900 flex items-center gap-2 uppercase">
                  {userProfile?.role}
                </p>
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
