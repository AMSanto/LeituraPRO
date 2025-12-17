import React, { useState, useEffect, useRef } from 'react';
import { SchoolClass, Student } from '../types';
import { School, Plus, Users, ArrowRight, MoreVertical, Edit, Trash2, ClipboardCheck } from 'lucide-react';

interface ClassListProps {
  classes: SchoolClass[];
  students: Student[];
  onAddClass: (newClass: Omit<SchoolClass, 'id'>) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onViewStudents: (classId: string) => void;
  onStartAssessment: (classId: string) => void;
}

export const ClassList: React.FC<ClassListProps> = ({ 
  classes, 
  students, 
  onAddClass, 
  onUpdateClass,
  onDeleteClass,
  onViewStudents,
  onStartAssessment
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<SchoolClass | undefined>(undefined);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setClassToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setClassToEdit(cls);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteClass(id);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
          <p className="text-gray-500">Acesse rapidamente os alunos e inicie avaliações</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => {
          const studentCount = students.filter(s => s.classId === cls.id).length;
          return (
            <div key={cls.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative group">
               <div className="flex items-start justify-between mb-4">
                <div className="bg-violet-50 p-3 rounded-xl">
                  <School className="w-6 h-6 text-violet-600" />
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                    {cls.year}
                    </span>
                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === cls.id ? null : cls.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {activeMenuId === cls.id && (
                            <div ref={menuRef} className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden animate-fade-in">
                                <button 
                                    onClick={() => handleOpenEdit(cls)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" /> Editar Nome
                                </button>
                                <button 
                                    onClick={() => handleDelete(cls.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Excluir Turma
                                </button>
                            </div>
                        )}
                    </div>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-1">{cls.name}</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">{cls.gradeLevel}</p>
              
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-xl mb-6 border border-gray-100">
                <Users className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-gray-700">{studentCount} Alunos cadastrados</span>
              </div>

              <div className="mt-auto grid grid-cols-1 gap-2">
                <button 
                  onClick={() => onStartAssessment(cls.id)}
                  className="w-full py-2.5 px-4 bg-violet-600 text-white hover:bg-violet-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Avaliar Turma
                </button>
                <button 
                  onClick={() => onViewStudents(cls.id)}
                  className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  Ver Alunos
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <ClassModal 
            classToEdit={classToEdit}
            onClose={() => setIsModalOpen(false)} 
            onSave={(c) => {
                if (classToEdit) {
                    onUpdateClass({ ...classToEdit, ...c });
                } else {
                    onAddClass(c);
                }
            }} 
        />
      )}
    </div>
  );
};

const ClassModal: React.FC<{ classToEdit?: SchoolClass, onClose: () => void, onSave: (c: Omit<SchoolClass, 'id'>) => void }> = ({ classToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    name: classToEdit?.name || '', 
    gradeLevel: classToEdit?.gradeLevel || '', 
    year: classToEdit?.year || new Date().getFullYear() 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-black mb-6 text-gray-900">{classToEdit ? 'Editar Turma' : 'Criar Nova Turma'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nome da Turma</label>
            <input 
              required 
              type="text" 
              placeholder="Ex: 2º Ano A (Tarde)"
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-violet-500 outline-none transition-all font-medium" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Série / Nível Escolar</label>
            <input 
              required 
              type="text" 
              placeholder="Ex: Fundamental I"
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-violet-500 outline-none transition-all font-medium" 
              value={formData.gradeLevel} 
              onChange={e => setFormData({...formData, gradeLevel: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Ano Letivo</label>
            <input 
              required 
              type="number" 
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-violet-500 outline-none transition-all font-medium" 
              value={formData.year} 
              onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} 
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
            <button type="submit" className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-200 active:scale-95 transition-all">
              {classToEdit ? 'Salvar Alterações' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};