import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AssessmentForm } from './components/AssessmentForm';
import { ClassList } from './components/ClassList';
import { StudentHistory } from './components/StudentHistory';
import { TextGenerator } from './components/TextGenerator';
import { CompetencyManager } from './components/CompetencyManager';
import { ViewState, Student, Assessment, SchoolClass, Competency } from './types';
import { MOCK_STUDENTS, MOCK_ASSESSMENTS, MOCK_CLASSES, MOCK_COMPETENCIES } from './constants';
import { Menu, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [assessments, setAssessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);
  const [classes, setClasses] = useState<SchoolClass[]>(MOCK_CLASSES);
  const [competencies, setCompetencies] = useState<Competency[]>(MOCK_COMPETENCIES);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Class Handlers
  const handleAddClass = (newClass: Omit<SchoolClass, 'id'>) => {
    const cls: SchoolClass = { ...newClass, id: Math.random().toString(36).substr(2, 9) };
    setClasses([...classes, cls]);
  };

  const handleUpdateClass = (updatedClass: SchoolClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      setClasses(classes.filter(c => c.id !== id));
      setStudents(students.map(s => s.classId === id ? { ...s, classId: '' } : s));
    }
  };

  // Student Handlers
  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const student: Student = { ...newStudent, id: Math.random().toString(36).substr(2, 9) };
    setStudents([...students, student]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleViewHistory = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView(ViewState.STUDENT_HISTORY);
  };

  // Assessment Handlers
  const handleAddAssessment = (newAssessment: Omit<Assessment, 'id'>) => {
    const assessment: Assessment = { ...newAssessment, id: Math.random().toString(36).substr(2, 9) };
    setAssessments([...assessments, assessment]);
    setCurrentView(ViewState.DASHBOARD);
  };

  // Competency Handlers
  const handleAddCompetency = (newComp: Omit<Competency, 'id'>) => {
    const comp: Competency = { ...newComp, id: Math.random().toString(36).substr(2, 9) };
    setCompetencies([...competencies, comp]);
  };

  const handleUpdateCompetency = (updatedComp: Competency) => {
    setCompetencies(competencies.map(c => c.id === updatedComp.id ? updatedComp : c));
  };

  const handleDeleteCompetency = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta competência?')) {
      setCompetencies(competencies.filter(c => c.id !== id));
    }
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (view !== ViewState.STUDENTS) setSelectedClassId('');
    if (view !== ViewState.STUDENT_HISTORY) setSelectedStudentId('');
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard students={students} assessments={assessments} classes={classes} />;
      case ViewState.CLASSES:
        return <ClassList classes={classes} students={students} onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />;
      case ViewState.STUDENTS:
        return <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={handleAddStudent} onUpdateStudent={handleUpdateStudent} onDeleteStudent={handleDeleteStudent} onViewHistory={handleViewHistory} initialClassId={selectedClassId} />;
      case ViewState.STUDENT_HISTORY:
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) return <Dashboard students={students} assessments={assessments} classes={classes} />;
        return <StudentHistory student={student} assessments={assessments.filter(a => a.studentId === student.id)} onBack={() => setCurrentView(ViewState.STUDENTS)} />;
      case ViewState.ASSESSMENT:
        return <AssessmentForm students={students} classes={classes} onSave={handleAddAssessment} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.GENERATOR:
        return <TextGenerator />;
      case ViewState.COMPETENCIES:
        return (
          <CompetencyManager 
            competencies={competencies} 
            onAdd={handleAddCompetency} 
            onUpdate={handleUpdateCompetency} 
            onDelete={handleDeleteCompetency} 
          />
        );
      default:
        return <Dashboard students={students} assessments={assessments} classes={classes} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-50 md:z-auto`}>
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center md:hidden shrink-0 shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 mr-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-1.5 rounded-lg shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800 tracking-tight">LeituraPro AI</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;