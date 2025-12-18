
import React, { useState, useEffect, useRef } from 'react';
import { SchoolClass, Student } from '../types';
import { School, Plus, Users, ArrowRight, MoreVertical, Edit, Trash2, User } from 'lucide-react';

interface ClassListProps {
  classes: SchoolClass[];
  students: Student[];
  onAddClass: (newClass: Omit<SchoolClass, 'id'>) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onViewStudents: (classId: string) => void;
}

export const ClassList: React.FC<ClassListProps> = ({ 
  classes, 
  students, 
  onAddClass, 
  onUpdateClass,
  onDeleteClass,
  onViewStudents 
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-500">Gerencie as turmas e anos letivos</p>
        </div>
        <button onClick={() => { setClassToEdit(undefined); setIsModalOpen(true); }} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"><Plus size={20}/> Nova Turma</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => {
          const count = students.filter(s => s.classId === cls.id).length;
          return (
            <div key={cls.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative flex flex-col">
               <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-xl"><School className="text-blue-600" /></div>
                <div className="relative">
                  <button onClick={() => setActiveMenuId(activeMenuId === cls.id ? null : cls.id)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><MoreVertical size={20}/></button>
                  {activeMenuId === cls.id && (
                    <div ref={menuRef} className="absolute right-0 top-8 w-40 bg-white shadow-xl border border-gray-100 rounded-xl z-10 overflow-hidden">
                      <button onClick={() => { setClassToEdit(cls); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Edit size={14}/> Editar</button>
                      <button onClick={() => { onDeleteClass(cls.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Excluir</button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900">{cls.name}</h3>
              <p className="text-xs text-primary-700 font-bold mb-4 uppercase tracking-wider">{cls.gradeLevel} • {cls.year}</p>
              
              <div className="bg-gray-50 rounded-xl p-3 mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600"><User size={14} className="text-gray-400"/> {cls.teacher || 'Sem professor'}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Users size={14} className="text-gray-400"/> {count} Alunos</div>
              </div>

              <button onClick={() => onViewStudents(cls.id)} className="mt-auto w-full py-3 bg-primary-50 text-primary-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-100 transition-colors">Ver Alunos <ArrowRight size={16}/></button>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6">{classToEdit ? 'Editar Turma' : 'Nova Turma'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const payload = { 
                name: d.get('name') as string, 
                gradeLevel: d.get('gradeLevel') as string, 
                year: Number(d.get('year')),
                teacher: d.get('teacher') as string
              };
              classToEdit ? onUpdateClass({...classToEdit, ...payload}) : onAddClass(payload);
              setIsModalOpen(false);
            }} className="space-y-4">
              <input required name="name" defaultValue={classToEdit?.name} placeholder="Nome da Turma" className="w-full p-4 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-500" />
              <input required name="teacher" defaultValue={classToEdit?.teacher} placeholder="Nome do Professor" className="w-full p-4 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-500" />
              <input required name="gradeLevel" defaultValue={classToEdit?.gradeLevel} placeholder="Série / Nível" className="w-full p-4 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-500" />
              <input required name="year" type="number" defaultValue={classToEdit?.year || 2024} placeholder="Ano Letivo" className="w-full p-4 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary-500" />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
