
import React, { useState, useEffect, useRef } from 'react';
import { Student, SchoolClass, Assessment } from '../types';
import { Search, Plus, MoreVertical, Edit, Trash2, History, LifeBuoy, TrendingUp, Camera, X, Check } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  classes: SchoolClass[];
  assessments: Assessment[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewHistory: (id: string) => void;
  onToggleRemedial: (studentId: string) => void;
  initialClassId?: string;
}

export const StudentList: React.FC<StudentListProps> = ({ 
  students, classes, assessments, onAddStudent, onUpdateStudent, onDeleteStudent, onViewHistory, onToggleRemedial, initialClassId = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState(initialClassId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    classId: '',
    readingLevel: 'Iniciante',
    avatarUrl: 'https://picsum.photos/seed/new/200'
  });
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      if (studentToEdit) {
        setFormData({
          name: studentToEdit.name,
          classId: studentToEdit.classId,
          readingLevel: studentToEdit.readingLevel,
          avatarUrl: studentToEdit.avatarUrl,
          inRemedial: studentToEdit.inRemedial,
          remedialStartDate: studentToEdit.remedialStartDate,
          remedialEntryLevel: studentToEdit.remedialEntryLevel,
          remedialHistory: studentToEdit.remedialHistory
        });
      } else {
        setFormData({
          name: '',
          classId: filterClassId || (classes.length > 0 ? classes[0].id : ''),
          readingLevel: 'Iniciante',
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
        });
      }
    }
  }, [isModalOpen, studentToEdit, classes, filterClassId]);

  useEffect(() => {
    const click = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenuId(null); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

  const filtered = students.filter(s => {
    const mSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const mClass = filterClassId ? s.classId === filterClassId : true;
    return mSearch && mClass;
  });

  const handleSave = () => {
    if (!formData.name.trim()) return alert("O nome é obrigatório.");
    if (!formData.classId) return alert("Selecione uma turma.");
    
    if (studentToEdit) {
      onUpdateStudent({ ...studentToEdit, ...formData });
    } else {
      onAddStudent(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto px-1 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Alunos</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Gestão de progresso individual</p>
        </div>
        <button 
          onClick={() => { setStudentToEdit(undefined); setIsModalOpen(true); }} 
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all shadow-lg shadow-purple-600/20 active:scale-95 text-[10px] uppercase tracking-widest shrink-0"
        >
          <Plus size={18}/> Novo Aluno
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input placeholder="Buscar aluno por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-4 rounded-2xl border-none ring-1 ring-gray-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-bold shadow-sm" />
        </div>
        <select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} className="w-full md:w-64 p-4 rounded-2xl border-none ring-1 ring-gray-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-700 text-sm shadow-sm cursor-pointer appearance-none">
          <option value="">Todas as Turmas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
             <Plus size={48} className="mb-4 opacity-10" />
             <p className="font-black text-[10px] uppercase tracking-widest">Nenhum aluno encontrado</p>
          </div>
        ) : (
          filtered.map(student => (
            <div key={student.id} className={`bg-white rounded-3xl border transition-all p-5 md:p-6 relative flex flex-col ${student.inRemedial ? 'border-amber-200 shadow-amber-100 ring-1 ring-amber-50' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={student.avatarUrl} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover ring-4 ring-gray-50 shadow-sm" />
                  <div>
                    <h3 className="font-black text-gray-900 leading-tight text-base md:text-lg truncate max-w-[140px] md:max-w-[200px] uppercase tracking-tight">{student.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      <TrendingUp size={10} className="text-purple-500" /> {student.readingLevel}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><MoreVertical size={18}/></button>
                  {activeMenuId === student.id && (
                    <div ref={menuRef} className="absolute right-0 top-10 w-48 bg-white shadow-2xl border border-gray-100 rounded-2xl z-[50] overflow-hidden ring-1 ring-black/5 animate-fade-in">
                      <button onClick={() => { onViewHistory(student.id); setActiveMenuId(null); }} className="w-full text-left px-5 py-3.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50"><History size={14} className="text-blue-500"/> Histórico</button>
                      <button onClick={() => { setStudentToEdit(student); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-5 py-3.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50"><Edit size={14} className="text-emerald-500"/> Editar</button>
                      <button onClick={() => { onDeleteStudent(student.id); setActiveMenuId(null); }} className="w-full text-left px-5 py-3.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"><Trash2 size={14}/> Excluir</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                 <div className="bg-gray-50 p-3 rounded-2xl">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Turma</p>
                   <p className="text-xs font-black text-gray-800 truncate">{classes.find(c => c.id === student.classId)?.name || 'N/A'}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-2xl">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Avaliações</p>
                   <p className="text-xs font-black text-gray-800">{assessments.filter(a => a.studentId === student.id).length}</p>
                 </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => onToggleRemedial(student.id)}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                    student.inRemedial 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                      : 'bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <LifeBuoy size={14} />
                  {student.inRemedial ? 'FINALIZAR REFORÇO' : 'ENVIAR PARA REFORÇO'}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL MASTER: ESTILO DA IMAGEM (CABEÇALHO ROXO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 animate-fade-in flex flex-col overflow-hidden max-h-[90vh] ring-1 ring-black/5">
            <div className="p-8 bg-purple-600 text-white flex justify-between items-center relative">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">
                  {studentToEdit ? 'Editar Cadastro' : 'Novo Estudante'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">
                  Defina o perfil e a turma de apoio
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/20 rounded-full transition-all text-white focus:outline-none"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group">
                  <img src={formData.avatarUrl} className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-gray-50 shadow-xl group-hover:brightness-90 transition-all" />
                  <button type="button" onClick={() => document.getElementById('avatar-upload')?.click()} className="absolute bottom-1 right-1 p-3 bg-purple-600 text-white rounded-2xl shadow-lg active:scale-90 hover:bg-purple-700 transition-colors">
                    <Camera size={18} />
                  </button>
                  <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({ ...formData, avatarUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Foto de Perfil</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner" placeholder="Nome do estudante" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Turma</label>
                    <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none font-bold text-sm cursor-pointer shadow-inner appearance-none">
                      <option value="">Selecione...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nível de Leitura</label>
                    <select required value={formData.readingLevel} onChange={e => setFormData({...formData, readingLevel: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none font-bold text-sm cursor-pointer shadow-inner appearance-none">
                      <option>Iniciante</option>
                      <option>Em Desenvolvimento</option>
                      <option>Fluente</option>
                      <option>Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] hover:text-gray-600 transition-colors">CANCELAR</button>
                  <button type="submit" className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                    {/* Fixed: Added Check icon to imports and using it here */}
                    <Check size={16} /> {studentToEdit ? 'ATUALIZAR' : 'CONFIRMAR'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
