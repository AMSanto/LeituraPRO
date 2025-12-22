
import React, { useState, useEffect, useRef } from 'react';
import { SchoolClass, Student } from '../types';
import { School, Plus, Users, ArrowRight, MoreVertical, Edit, Trash2, User, X, Check } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto px-1 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Turmas</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Unidades letivas registradas</p>
        </div>
        <button 
          onClick={() => { setClassToEdit(undefined); setIsModalOpen(true); }} 
          className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all shadow-lg shadow-primary-500/20 active:scale-95 text-[10px] uppercase tracking-widest shrink-0"
        >
          <Plus size={18}/> Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
             <School size={48} className="mb-4 opacity-10" />
             <p className="font-black text-[10px] uppercase tracking-widest">Nenhuma turma cadastrada</p>
          </div>
        ) : (
          classes.map(cls => {
            const count = students.filter(s => s.classId === cls.id).length;
            return (
              <div key={cls.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative flex flex-col group">
                 <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-50 p-3 rounded-2xl border border-primary-100"><School className="text-primary-600" size={24} /></div>
                  <div className="relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === cls.id ? null : cls.id)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors focus:outline-none"><MoreVertical size={20}/></button>
                    {activeMenuId === cls.id && (
                      <div ref={menuRef} className="absolute right-0 top-10 w-44 bg-white shadow-2xl border border-gray-100 rounded-2xl z-[50] overflow-hidden ring-1 ring-black/5 animate-fade-in">
                        <button onClick={() => { setClassToEdit(cls); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-5 py-3.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50"><Edit size={14} className="text-emerald-500"/> Editar</button>
                        <button onClick={() => { onDeleteClass(cls.id); setActiveMenuId(null); }} className="w-full text-left px-5 py-3.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"><Trash2 size={14}/> Excluir</button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight truncate">{cls.name}</h3>
                <p className="text-[9px] text-primary-700 font-black mb-6 uppercase tracking-widest">{cls.gradeLevel} • {cls.year}</p>
                
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 border border-gray-100/50">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-600"><User size={14} className="text-gray-400"/> {cls.teacher || 'A definir'}</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-600"><Users size={14} className="text-gray-400"/> {count} Alunos Inscritos</div>
                </div>

                <button onClick={() => onViewStudents(cls.id)} className="mt-auto w-full py-4 bg-primary-50 text-primary-700 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-100 transition-all active:scale-95 border border-primary-100">Gerenciar Alunos <ArrowRight size={14}/></button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL MASTER: ESTILO DA IMAGEM (CABEÇALHO CIANO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 animate-fade-in flex flex-col overflow-hidden max-h-[90vh] ring-1 ring-black/5">
            <div className="p-8 bg-primary-600 text-white flex justify-between items-center relative">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">
                  {classToEdit ? 'Editar Turma' : 'Nova Unidade'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">
                  Configurações de unidade letiva
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/20 rounded-full transition-all text-white focus:outline-none"><X size={24} /></button>
            </div>
            
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
            }} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identificação da Turma</label>
                <input required name="name" defaultValue={classToEdit?.name} placeholder="Ex: 5º Ano C (Tarde)" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-500 focus:bg-white font-bold outline-none text-sm transition-all shadow-inner" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Professor(a) Responsável</label>
                <input required name="teacher" defaultValue={classToEdit?.teacher} placeholder="Nome completo" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-500 focus:bg-white font-bold outline-none text-sm transition-all shadow-inner" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Série / Ciclo</label>
                  <input required name="gradeLevel" defaultValue={classToEdit?.gradeLevel} placeholder="Ex: Fundamental I" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-500 focus:bg-white font-bold outline-none text-sm transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Ano Letivo</label>
                  <input required name="year" type="number" defaultValue={classToEdit?.year || 2024} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-500 focus:bg-white font-bold outline-none text-sm transition-all shadow-inner" />
                </div>
              </div>

              <div className="flex gap-4 pt-6 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={16} /> CONFIRMAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
