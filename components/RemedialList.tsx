
import React, { useState } from 'react';
import { Student, SchoolClass } from '../types';
import { LifeBuoy, Clock, User, School, Calendar, ArrowRight, History, CheckCircle2, TrendingUp, Plus, Search, X, Users, Save } from 'lucide-react';

interface RemedialListProps {
  students: Student[];
  classes: SchoolClass[];
  onToggleRemedial: (studentId: string, startDate?: string, entryLevel?: string, exitLevel?: string) => void;
  onViewStudent: (studentId: string) => void;
}

export const RemedialList: React.FC<RemedialListProps> = ({ students, classes, onToggleRemedial, onViewStudent }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  // States para matrícula específica
  const [studentToEnroll, setStudentToEnroll] = useState<Student | null>(null);
  const [enrollDate, setEnrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [enrollLevel, setEnrollLevel] = useState('');

  // States para alta específica
  const [studentToDischarge, setStudentToDischarge] = useState<Student | null>(null);
  const [dischargeLevel, setDischargeLevel] = useState('');
  
  const activeRemedial = students.filter(s => s.inRemedial);
  
  const historyRecords = students.flatMap(s => 
    (s.remedialHistory || []).map(record => ({ ...record, studentName: s.name, studentAvatar: s.avatarUrl, studentId: s.id }))
  ).sort((a, b) => new Date(b.exitDate || '').getTime() - new Date(a.exitDate || '').getTime());

  const calculateDays = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const availableStudents = students.filter(s => !s.inRemedial && (selectedClassId ? s.classId === selectedClassId : true));

  const handleEnrollClick = (student: Student) => {
    setStudentToEnroll(student);
    setEnrollLevel(student.readingLevel);
  };

  const confirmEnroll = () => {
    if (studentToEnroll) {
      onToggleRemedial(studentToEnroll.id, enrollDate, enrollLevel);
      setStudentToEnroll(null);
    }
  };

  const handleDischargeClick = (student: Student) => {
    setStudentToDischarge(student);
    setDischargeLevel(student.readingLevel);
  };

  const confirmDischarge = () => {
    if (studentToDischarge) {
      onToggleRemedial(studentToDischarge.id, undefined, undefined, dischargeLevel);
      setStudentToDischarge(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <LifeBuoy className="w-7 h-7 text-amber-600" />
            </div>
            Reforço Escolar
          </h1>
          <p className="text-gray-500 text-sm">Gerencie o fluxo de alunos em recuperação e reforço</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black transition-all shadow-lg shadow-amber-600/20 active:scale-95"
          >
            <Plus size={20} /> MATRICULAR ALUNOS
          </button>
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'active' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EM CURSO ({activeRemedial.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              CONCLUÍDOS ({historyRecords.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'active' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRemedial.length === 0 ? (
            <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-24 text-center">
              <LifeBuoy className="w-20 h-20 text-gray-100 mx-auto mb-6" />
              <h3 className="text-xl font-black text-gray-900">O reforço está vazio</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Use o botão de matrícula para "puxar" alunos das turmas regulares que precisam de atenção extra.</p>
            </div>
          ) : (
            activeRemedial.map(student => (
              <div key={student.id} className="bg-white rounded-[2rem] border-2 border-amber-50 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-5 mb-6">
                    <img src={student.avatarUrl} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-50 shadow-sm" />
                    <div>
                      <h3 className="font-black text-gray-900 text-xl leading-tight">{student.name}</h3>
                      <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest mt-1.5 inline-block">
                        Status: Em Reforço
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Turma Original</span>
                      <span className="font-black text-gray-800">{classes.find(c => c.id === student.classId)?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Nível de Entrada</span>
                      <span className="font-black text-gray-800">{student.remedialEntryLevel}</span>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tempo de Permanência</span>
                      <span className="font-black text-amber-600 flex items-center gap-1.5 text-sm">
                        <Clock size={16}/> {calculateDays(student.remedialStartDate!)} DIAS
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50/30 border-t border-amber-100 flex gap-3">
                  <button onClick={() => onViewStudent(student.id)} className="flex-1 bg-white border-2 border-gray-100 text-gray-600 py-3.5 rounded-2xl text-[10px] font-black hover:bg-gray-100 transition-all uppercase tracking-widest">VER EVOLUÇÃO</button>
                  <button onClick={() => handleDischargeClick(student)} className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl text-[10px] font-black hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest">DAR ALTA</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estudante Egressante</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo de Nível</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Dias</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Conclusão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historyRecords.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <img src={record.studentAvatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                      <span className="font-black text-gray-900 text-base">{record.studentName}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-black uppercase mb-1">Entrou</span>
                        <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-black text-gray-500 uppercase">{record.entryLevel}</span>
                      </div>
                      <TrendingUp size={18} className="text-green-500 mt-4" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-black uppercase mb-1">Saiu</span>
                        <span className="text-xs bg-green-100 px-3 py-1.5 rounded-lg font-black text-green-700 uppercase">{record.exitLevel}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="inline-flex items-center gap-2 text-blue-600 font-black text-base bg-blue-50 px-4 py-2 rounded-2xl">
                      <CheckCircle2 size={18} /> {record.durationDays} DIAS
                    </div>
                  </td>
                  <td className="p-8 text-sm text-gray-500 font-black uppercase tracking-tighter">
                    {new Date(record.exitDate!).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {historyRecords.length === 0 && (
            <div className="p-24 text-center text-gray-300 font-black uppercase tracking-widest text-sm italic">Histórico de egressos vazio.</div>
          )}
        </div>
      )}

      {/* Modal Principal de Matrícula */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl animate-fade-in relative max-h-[90vh] flex flex-col ring-1 ring-white/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <Users className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Matricular no Reforço</h2>
              </div>
              <button onClick={() => setShowEnrollModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
            </div>
            
            <div className="space-y-4 mb-8">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] block ml-1">Filtrar por Turma Regular</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select 
                  value={selectedClassId} 
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none ring-2 ring-gray-100 outline-none font-black text-gray-700 focus:ring-amber-500 transition-all appearance-none shadow-sm"
                >
                  <option value="">Todas as Turmas do App</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.teacher}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 sticky top-0 bg-white py-2 z-10">Alunos Aptos para Inclusão:</p>
              {availableStudents.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-black italic border-2 border-dashed border-gray-100 rounded-3xl">Nenhum aluno disponível para matricular.</div>
              ) : (
                availableStudents.map(student => (
                  <div 
                    key={student.id}
                    className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-amber-50 rounded-2xl ring-2 ring-transparent transition-all group hover:ring-amber-200"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <img src={student.avatarUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-black text-gray-900 text-base">{student.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{classes.find(c => c.id === student.classId)?.name}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300" />
                           <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{student.readingLevel}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEnrollClick(student)}
                      className="bg-white border-2 border-gray-200 text-gray-400 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all shadow-sm active:scale-90"
                    >
                      PUXAR
                    </button>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setShowEnrollModal(false)} className="mt-8 w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98]">CONCLUIR SELEÇÃO</button>
          </div>
        </div>
      )}

      {/* Sub-modal: Detalhes da Matrícula */}
      {studentToEnroll && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-fade-in border border-amber-100">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8 flex items-center gap-2">
              <Plus className="text-amber-600"/> Dados da Matrícula
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <img src={studentToEnroll.avatarUrl} className="w-12 h-12 rounded-xl object-cover" />
                <p className="font-black text-gray-900 uppercase">{studentToEnroll.name}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Data de Início no Reforço</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-gray-50 border-none ring-2 ring-gray-100 rounded-2xl focus:ring-amber-500 font-bold"
                  value={enrollDate}
                  onChange={(e) => setEnrollDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nível de Entrada</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-none ring-2 ring-gray-100 rounded-2xl focus:ring-amber-500 font-bold"
                  value={enrollLevel}
                  onChange={(e) => setEnrollLevel(e.target.value)}
                >
                  <option>Iniciante</option>
                  <option>Em Desenvolvimento</option>
                  <option>Fluente</option>
                  <option>Avançado</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStudentToEnroll(null)} className="flex-1 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">CANCELAR</button>
                <button onClick={confirmEnroll} className="flex-1 bg-amber-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-600/20">MATRICULAR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Detalhes da Alta */}
      {studentToDischarge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-fade-in border border-green-100">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8 flex items-center gap-2">
              <CheckCircle2 className="text-green-600"/> Conclusão do Reforço
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <img src={studentToDischarge.avatarUrl} className="w-12 h-12 rounded-xl object-cover" />
                <p className="font-black text-gray-900 uppercase">{studentToDischarge.name}</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Entrou como</p>
                <p className="font-black text-gray-900">{studentToDischarge.remedialEntryLevel}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nível de Saída (Atualizado)</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-none ring-2 ring-gray-100 rounded-2xl focus:ring-green-500 font-bold"
                  value={dischargeLevel}
                  onChange={(e) => setDischargeLevel(e.target.value)}
                >
                  <option>Iniciante</option>
                  <option>Em Desenvolvimento</option>
                  <option>Fluente</option>
                  <option>Avançado</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStudentToDischarge(null)} className="flex-1 py-4 font-black text-gray-400 text-xs uppercase tracking-widest">CANCELAR</button>
                <button onClick={confirmDischarge} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20">FINALIZAR ALTA</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
