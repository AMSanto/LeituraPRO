
import React, { useState, useEffect, useRef } from 'react';
import { Student, SchoolClass, Assessment, ViewState } from '../types';
import { Search, Plus, MoreVertical, BookOpen, Filter, Edit, Trash2, History, LifeBuoy, X, TrendingUp } from 'lucide-react';
import { generateStudentAnalysis } from '../services/geminiService';

interface StudentListProps {
  students: Student[];
  classes: SchoolClass[];
  assessments: Assessment[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewHistory: (id: string) => void;
  onToggleRemedial: (studentId: string) => void; // Adicionado
  initialClassId?: string;
}

export const StudentList: React.FC<StudentListProps> = ({ 
  students, classes, assessments, onAddStudent, onUpdateStudent, onDeleteStudent, onViewHistory, onToggleRemedial, initialClassId = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState(initialClassId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm">Gestão de desempenho individual</p>
        </div>
        <button onClick={() => { setStudentToEdit(undefined); setIsModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-black transition-all shadow-lg shadow-purple-600/20"><Plus size={20}/> ADICIONAR ALUNO</button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input placeholder="Buscar por nome do aluno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none ring-1 ring-gray-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm" />
        </div>
        <select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} className="md:w-64 p-3.5 rounded-2xl border-none ring-1 ring-gray-200 bg-white focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-700">
          <option value="">Todas as Turmas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(student => (
          <div key={student.id} className={`bg-white rounded-3xl border transition-all p-6 relative flex flex-col ${student.inRemedial ? 'border-amber-200 shadow-amber-100 shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img src={student.avatarUrl} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-gray-50 shadow-sm" />
                <div>
                  <h3 className="font-black text-gray-900 leading-tight text-lg">{student.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    <TrendingUp size={12} className="text-purple-500" /> {student.readingLevel}
                  </div>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><MoreVertical size={20}/></button>
                {activeMenuId === student.id && (
                  <div ref={menuRef} className="absolute right-0 top-10 w-48 bg-white shadow-2xl border border-gray-100 rounded-2xl z-20 overflow-hidden ring-1 ring-black/5 animate-fade-in">
                    <button onClick={() => { onViewHistory(student.id); setActiveMenuId(null); }} className="w-full text-left px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"><History size={16} className="text-blue-500"/> Histórico</button>
                    <button onClick={() => { setStudentToEdit(student); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"><Edit size={16} className="text-emerald-500"/> Editar</button>
                    <button onClick={() => { onDeleteStudent(student.id); setActiveMenuId(null); }} className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"><Trash2 size={16}/> Excluir</button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
               <div className="bg-gray-50 p-3 rounded-2xl">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Turma</p>
                 <p className="text-sm font-black text-gray-800 truncate">{classes.find(c => c.id === student.classId)?.name || '-'}</p>
               </div>
               <div className="bg-gray-50 p-3 rounded-2xl">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avaliações</p>
                 <p className="text-sm font-black text-gray-800">{assessments.filter(a => a.studentId === student.id).length}</p>
               </div>
            </div>

            <div className="mt-auto space-y-2">
              <button 
                onClick={() => onToggleRemedial(student.id)}
                className={`w-full py-3 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${
                  student.inRemedial 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50'
                }`}
              >
                <LifeBuoy size={16} />
                {student.inRemedial ? 'EM REFORÇO' : 'ENCAMINHAR REFORÇO'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <StudentModal classes={classes} studentToEdit={studentToEdit} onClose={() => setIsModalOpen(false)} onSave={(s) => { studentToEdit ? onUpdateStudent({...studentToEdit, ...s}) : onAddStudent(s); setIsModalOpen(false); }} />
      )}
    </div>
  );
};

const StudentModal: React.FC<{ classes: SchoolClass[], studentToEdit?: Student, onClose: () => void, onSave: (s: Omit<Student, 'id'>) => void }> = ({ classes, studentToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: studentToEdit?.name || '',
    classId: studentToEdit?.classId || (classes[0]?.id || ''),
    readingLevel: studentToEdit?.readingLevel || 'Iniciante',
    avatarUrl: studentToEdit?.avatarUrl || `https://picsum.photos/seed/${Math.random()}/200`
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-10 shadow-2xl animate-fade-in ring-1 ring-black/5">
        <h2 className="text-2xl font-black mb-8 text-gray-900">{studentToEdit ? 'EDITAR ALUNO' : 'NOVO ALUNO'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">Nome do Estudante</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-bold transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">Turma Vinculada</label>
            <select value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-bold transition-all">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">Nível de Leitura Atual</label>
            <select value={formData.readingLevel} onChange={e => setFormData({...formData, readingLevel: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-bold transition-all">
              <option>Iniciante</option><option>Em Desenvolvimento</option><option>Fluente</option><option>Avançado</option>
            </select>
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 text-sm hover:text-gray-600">CANCELAR</button>
            <button type="submit" className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all">SALVAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};
