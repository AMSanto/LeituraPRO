
import React, { useState } from 'react';
import { Student, SchoolClass } from '../types';
import { LifeBuoy, Clock, Users, CheckCircle2, TrendingUp, Plus, X, ArrowRight, Loader2, Calendar, Check } from 'lucide-react';

interface RemedialListProps {
  students: Student[];
  classes: SchoolClass[];
  onToggleRemedial: (studentId: string, details?: any) => void;
  onViewStudent: (studentId: string) => void;
}

export const RemedialList: React.FC<RemedialListProps> = ({ students, classes, onToggleRemedial, onViewStudent }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  
  // States para o novo formulário de reforço
  const [enrollData, setEnrollData] = useState({
    studentId: '',
    classId: '',
    startDate: new Date().toISOString().split('T')[0],
    predictedExitDate: '',
    notes: ''
  });
  
  const activeRemedial = students.filter(s => s.inRemedial);
  const historyRecords = students.flatMap(s => 
    (s.remedialHistory || []).map(record => ({ ...record, studentName: s.name, studentAvatar: s.avatarUrl, studentId: s.id }))
  ).sort((a, b) => new Date(b.exitDate || '').getTime() - new Date(a.exitDate || '').getTime());

  const calculateDays = (start: string) => {
    if (!start) return 0;
    const startDate = new Date(start);
    const endDate = new Date();
    const diff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData.studentId) return alert("Selecione um aluno");
    onToggleRemedial(enrollData.studentId, {
      startDate: enrollData.startDate,
      entryLevel: students.find(s => s.id === enrollData.studentId)?.readingLevel
    });
    setShowEnrollModal(false);
    setEnrollData({ studentId: '', classId: '', startDate: new Date().toISOString().split('T')[0], predictedExitDate: '', notes: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto px-1">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
            <LifeBuoy className="w-7 h-7 md:w-8 md:h-8 text-amber-600" />
            Central de Reforço
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Acompanhamento intensivo e nivelamento</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all shadow-lg shadow-amber-600/20 text-[10px] uppercase tracking-[0.2em] active:scale-95"
          >
            <Plus size={16} /> Matricular Aluno
          </button>
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button onClick={() => setActiveTab('active')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${activeTab === 'active' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400'}`}>ATIVOS</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>HISTÓRICO</button>
          </div>
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRemedial.length === 0 ? (
            <div className="col-span-full bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-16 md:p-24 text-center shadow-inner">
              <LifeBuoy className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest opacity-50">Sem alunos em intervenção.</p>
            </div>
          ) : (
            activeRemedial.map(student => (
              <div key={student.id} className="bg-white rounded-[2rem] border-2 border-amber-50 shadow-sm p-6 flex flex-col hover:border-amber-100 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <img src={student.avatarUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-amber-50" />
                  <div className="min-w-0">
                    <h3 className="font-black text-gray-900 text-base truncate uppercase tracking-tight">{student.name}</h3>
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-0.5">Em Curso</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
                    <p className="text-[8px] font-black text-amber-800 uppercase tracking-widest mb-1 opacity-60">Entrada</p>
                    <p className="text-[10px] font-black text-amber-900 uppercase">{student.remedialEntryLevel || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                    <p className="text-[8px] font-black text-blue-800 uppercase tracking-widest mb-1 opacity-60">Duração</p>
                    <p className="text-[10px] font-black text-blue-900 uppercase">{calculateDays(student.remedialStartDate!)} dias</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onViewStudent(student.id)} className="flex-1 bg-gray-50 text-gray-600 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100">Prontuário</button>
                  <button onClick={() => onToggleRemedial(student.id)} className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all">Alta</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Estudante</th>
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Nivelamento</th>
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyRecords.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <img src={record.studentAvatar} className="w-10 h-10 rounded-lg object-cover grayscale" />
                    <span className="font-black text-gray-900 text-sm uppercase">{record.studentName}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[9px] bg-gray-100 px-3 py-1.5 rounded-lg font-black text-gray-500 uppercase">{record.entryLevel} → {record.exitLevel || '-'}</span>
                  </td>
                  <td className="p-6 text-right text-[10px] font-black text-gray-400">{new Date(record.exitDate || '').toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE CADASTRO DE REFORÇO (ESTILO PREMIUM DA IMAGEM) */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 animate-fade-in flex flex-col overflow-hidden ring-1 ring-black/5">
            {/* Header Roxo Sólido */}
            <div className="p-8 bg-purple-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Cadastro de Reforço</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Defina o período e a turma de apoio</p>
              </div>
              <button onClick={() => setShowEnrollModal(false)} className="p-3 hover:bg-white/20 rounded-full transition-all text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleEnroll} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Estudante</label>
                <select 
                  required 
                  value={enrollData.studentId} 
                  onChange={e => setEnrollData({...enrollData, studentId: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 font-bold outline-none text-sm cursor-pointer"
                >
                  <option value="">Selecione um aluno...</option>
                  {students.filter(s => !s.inRemedial).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Turma de Reforço</label>
                <select 
                  required 
                  value={enrollData.classId} 
                  onChange={e => setEnrollData({...enrollData, classId: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 font-bold outline-none text-sm cursor-pointer"
                >
                  <option value="">Selecione a turma...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Data de Início</label>
                  <input 
                    type="date" 
                    value={enrollData.startDate}
                    onChange={e => setEnrollData({...enrollData, startDate: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 font-bold outline-none text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Previsão de Saída</label>
                  <input 
                    type="date"
                    value={enrollData.predictedExitDate}
                    onChange={e => setEnrollData({...enrollData, predictedExitDate: e.target.value})}
                    placeholder="dd/mm/aaaa"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 font-bold outline-none text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Anotações Pedagógicas</label>
                <textarea 
                  rows={3} 
                  value={enrollData.notes}
                  onChange={e => setEnrollData({...enrollData, notes: e.target.value})}
                  placeholder="Foco do apoio, dificuldades observadas..."
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-purple-500 font-bold outline-none text-sm resize-none" 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEnrollModal(false)} className="flex-1 py-4 font-black text-gray-400 text-[11px] uppercase tracking-[0.2em] hover:text-gray-600 transition-colors">CANCELAR</button>
                <button type="submit" className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2">
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
