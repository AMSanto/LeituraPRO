
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AssessmentForm } from './components/AssessmentForm';
import { ClassList } from './components/ClassList';
import { StudentHistory } from './components/StudentHistory';
import { TextGenerator } from './components/TextGenerator';
import { CompetencyManager } from './components/CompetencyManager';
import { RemedialList } from './components/RemedialList';
import { ViewState, Student, Assessment, SchoolClass, Competency, RemedialRecord } from './types';
import { Menu, GraduationCap, CheckCircle, User, Settings, X, Users, School } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_ASSESSMENTS, MOCK_CLASSES, MOCK_COMPETENCIES } from './constants';

const App: React.FC = () => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('lp_teacher_name') || 'Professor(a)');

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

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('lp_students', JSON.stringify(students));
    localStorage.setItem('lp_assessments', JSON.stringify(assessments));
    localStorage.setItem('lp_classes', JSON.stringify(classes));
    localStorage.setItem('lp_competencies', JSON.stringify(competencies));
    localStorage.setItem('lp_teacher_name', teacherName);
  }, [students, assessments, classes, competencies, teacherName]);

  const handleSaveStatus = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 400);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const addClass = (newClass: Omit<SchoolClass, 'id'>) => {
    setClasses([...classes, { ...newClass, id: crypto.randomUUID() }]);
    handleSaveStatus();
  };

  const updateClass = (updated: SchoolClass) => {
    setClasses(classes.map(c => c.id === updated.id ? updated : c));
    handleSaveStatus();
  };

  const deleteClass = (id: string) => {
    if (confirm("Excluir esta turma apagará os vínculos dos alunos. Confirmar?")) {
      setClasses(classes.filter(c => c.id !== id));
      handleSaveStatus();
    }
  };

  const addStudent = (newStudent: Omit<Student, 'id'>) => {
    setStudents([...students, { ...newStudent, id: crypto.randomUUID(), remedialHistory: [] }]);
    handleSaveStatus();
  };

  const updateStudent = (updated: Student) => {
    setStudents(students.map(s => s.id === updated.id ? updated : s));
    handleSaveStatus();
  };

  const deleteStudent = (id: string) => {
    if (confirm("Excluir permanentemente este aluno?")) {
      setStudents(students.filter(s => s.id !== id));
      handleSaveStatus();
    }
  };

  const toggleRemedial = (studentId: string) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const entering = !s.inRemedial;
        const now = new Date().toISOString().split('T')[0];
        
        if (entering) {
          return { 
            ...s, 
            inRemedial: true, 
            remedialStartDate: now, 
            remedialEntryLevel: s.readingLevel 
          };
        } else {
          const record: RemedialRecord = {
            entryDate: s.remedialStartDate!,
            entryLevel: s.remedialEntryLevel || 'Não informado',
            exitDate: now,
            exitLevel: s.readingLevel,
            durationDays: Math.ceil(Math.abs(new Date(now).getTime() - new Date(s.remedialStartDate!).getTime()) / (1000 * 60 * 60 * 24))
          };
          return { 
            ...s, 
            inRemedial: false, 
            remedialStartDate: undefined,
            remedialEntryLevel: undefined,
            remedialHistory: [...(s.remedialHistory || []), record]
          };
        }
      }
      return s;
    }));
    handleSaveStatus();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar currentView={currentView} onNavigate={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} />
      
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
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Responsável</p>
                <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors uppercase">{teacherName}</p>
              </div>
              <div className="bg-gray-900 p-2.5 rounded-2xl group-hover:bg-primary-500 transition-all shadow-lg">
                <User size={20} className="text-white" />
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-7xl mx-auto">
            {currentView === ViewState.DASHBOARD && <Dashboard students={students} assessments={assessments} classes={classes} />}
            {currentView === ViewState.CLASSES && <ClassList classes={classes} students={students} onAddClass={addClass} onUpdateClass={updateClass} onDeleteClass={deleteClass} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />}
            {currentView === ViewState.STUDENTS && <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={addStudent} onUpdateStudent={updateStudent} onDeleteStudent={deleteStudent} onViewHistory={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} onToggleRemedial={toggleRemedial} initialClassId={selectedClassId} />}
            {currentView === ViewState.REMEDIAL && <RemedialList students={students} classes={classes} onToggleRemedial={toggleRemedial} onViewStudent={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} />}
            {currentView === ViewState.STUDENT_HISTORY && students.find(s => s.id === selectedStudentId) && <StudentHistory student={students.find(s => s.id === selectedStudentId)!} assessments={assessments.filter(a => a.studentId === selectedStudentId)} onBack={() => setCurrentView(ViewState.STUDENTS)} />}
            {currentView === ViewState.ASSESSMENT && <AssessmentForm students={students} classes={classes} onSave={(a) => { setAssessments([{...a, id: crypto.randomUUID()}, ...assessments]); setCurrentView(ViewState.DASHBOARD); }} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />}
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
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 block">Nome Completo</label>
                <input 
                  value={teacherName} 
                  onChange={e => setTeacherName(e.target.value)} 
                  className="w-full p-5 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-500 outline-none font-black text-lg transition-all" 
                />
              </div>
              <button onClick={() => setShowProfileModal(false)} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-2xl active:scale-95">SALVAR ALTERAÇÕES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
