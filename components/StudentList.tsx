import React, { useState, useEffect, useRef } from 'react';
import { Student, SchoolClass } from '../types';
import { Search, Plus, MoreVertical, BookOpen, User, School, Filter, Printer, Edit, Trash2, Image as ImageIcon, History, Upload } from 'lucide-react';
import { generateStudentAnalysis } from '../services/geminiService';
import { Assessment } from '../types';

interface StudentListProps {
  students: Student[];
  classes: SchoolClass[];
  assessments: Assessment[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewHistory: (id: string) => void;
  initialClassId?: string;
}

export const StudentList: React.FC<StudentListProps> = ({ 
  students, 
  classes, 
  assessments, 
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onViewHistory,
  initialClassId = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState(initialClassId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // State for Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update filter if prop changes (deep linking)
  useEffect(() => {
    if (initialClassId) {
      setFilterClassId(initialClassId);
    }
  }, [initialClassId]);

  // Helper to get class name
  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || 'Sem turma';

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClassId ? s.classId === filterClassId : true;
    return matchesSearch && matchesClass;
  });

  const handleGenerateReport = async (student: Student) => {
    setLoadingAi(true);
    setAiAnalysis(null);
    setSelectedStudent(student);
    
    const studentClass = classes.find(c => c.id === student.classId);
    const enrichedStudent = { ...student, grade: studentClass?.gradeLevel || 'N/A' };

    const studentAssessments = assessments.filter(a => a.studentId === student.id);
    const report = await generateStudentAnalysis(enrichedStudent, studentAssessments);
    
    setAiAnalysis(report);
    setLoadingAi(false);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setAiAnalysis(null);
  };

  const handleOpenAddModal = () => {
    setStudentToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (id: string) => {
    onDeleteStudent(id);
    setActiveMenuId(null);
  };
  
  const handleHistoryClick = (id: string) => {
      onViewHistory(id);
      setActiveMenuId(null);
  }

  const handlePrintAnalysis = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Alunos</h1>
          <p className="text-gray-500 text-sm">Gerencie o desempenho individual</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Aluno
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Class Filter */}
        <div className="relative md:w-1/3">
          <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm appearance-none"
          >
            <option value="">Todas as Turmas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>

        {/* Text Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por nome do aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum aluno encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div key={student.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-100 bg-gray-100" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                       <School className="w-3 h-3" />
                       {getClassName(student.classId)}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === student.id ? null : student.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {activeMenuId === student.id && (
                    <div ref={menuRef} className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden animate-fade-in">
                       <button 
                        onClick={() => handleHistoryClick(student.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <History className="w-4 h-4" /> Ver Histórico
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(student)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(student.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                   {student.readingLevel}
                 </span>
                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                   {assessments.filter(a => a.studentId === student.id).length} Avaliações
                 </span>
              </div>

              <button 
                onClick={() => handleGenerateReport(student)}
                className="w-full mt-2 py-2 px-3 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Ver Análise IA
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <StudentModal 
          classes={classes}
          studentToEdit={studentToEdit}
          onClose={() => setIsModalOpen(false)} 
          onSave={(s) => {
            if (studentToEdit) {
              onUpdateStudent({ ...studentToEdit, ...s });
            } else {
              // If filtering by class, auto-select that class in the modal if user didn't specify
              if (filterClassId && !s.classId) {
                 s.classId = filterClassId;
              }
              onAddStudent(s);
            }
          }} 
        />
      )}

      {/* AI Report Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl print:shadow-none print:max-w-none print:max-h-none print:w-full print:h-full print:rounded-none">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white print:static print:border-none">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 print:hidden">
                   <User className="w-5 h-5" />
                </div>
                Análise de {selectedStudent.name}
              </h2>
              <div className="flex items-center gap-2 print:hidden">
                 <button 
                  onClick={handlePrintAnalysis}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Imprimir Relatório"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-500 animate-pulse">A IA está analisando o histórico do aluno...</p>
                </div>
              ) : (
                <div className="prose prose-indigo max-w-none print:prose-sm">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end print:hidden">
              <button onClick={closeModal} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for Adding/Editing Student
interface StudentModalProps {
  classes: SchoolClass[];
  studentToEdit?: Student;
  onClose: () => void;
  onSave: (s: Omit<Student, 'id'>) => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ classes, studentToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    name: studentToEdit?.name || '', 
    classId: studentToEdit?.classId || (classes.length > 0 ? classes[0].id : ''), 
    readingLevel: studentToEdit?.readingLevel || 'Iniciante',
    avatarUrl: studentToEdit?.avatarUrl || ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      avatarUrl: formData.avatarUrl.trim() || `https://picsum.photos/seed/${Math.random()}/200`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {studentToEdit ? 'Editar Aluno' : 'Adicionar Novo Aluno'}
        </h2>
        {classes.length === 0 ? (
          <div className="text-center py-4">
             <p className="text-red-500 mb-4">Você precisa cadastrar uma turma antes de adicionar alunos.</p>
             <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Perfil</label>
              <div className="flex items-center gap-4">
                {formData.avatarUrl && (
                  <img src={formData.avatarUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Carregar foto...</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG. Se vazio, será gerada uma imagem aleatória.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <select required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Leitura</label>
              <select className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                 value={formData.readingLevel} onChange={e => setFormData({...formData, readingLevel: e.target.value})}>
                <option value="Pré-leitor">Pré-leitor</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                <option value="Fluente">Fluente</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {studentToEdit ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}