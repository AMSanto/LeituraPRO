
import React, { useState, useMemo } from 'react';
import { Student, Assessment, SchoolClass, AssessmentCriteria } from '../types';
import { Save, AlertCircle, CheckSquare, Square, Calculator, BookOpen, ChevronLeft, School, User } from 'lucide-react';

interface AssessmentFormProps {
  students: Student[];
  classes: SchoolClass[];
  onSave: (assessment: Omit<Assessment, 'id'>) => void;
  onCancel: () => void;
}

type TabType = 'PORTUGUESE' | 'MATH';

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ students, classes, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PORTUGUESE');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    textTitle: '',
    wpm: 0,
    accuracy: 95,
    comprehension: 5,
    mathScore: 5,
    notes: ''
  });

  const [criteria, setCriteria] = useState<AssessmentCriteria>({
    fluency: { rhythm: false, pauses: false, intonation: false, security: false },
    decoding: { recognition: false, noOmissions: false, complexWords: false },
    comprehension: { mainIdea: false, explicit: false, implicit: false, inference: false, titleRelation: false },
    math: { numberSense: false, operations: false, problemSolving: false, logicReasoning: false, geometry: false }
  });

  // Filtra alunos baseados na turma selecionada
  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const toggleCriteria = (category: keyof AssessmentCriteria, field: string) => {
    setCriteria(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [field]: !(prev[category] as any)?.[field]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert("Selecione um aluno.");
    if (!formData.textTitle) return alert("Informe o título ou referência.");
    
    onSave({
      ...formData,
      criteria
    });
  };

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Nenhuma turma cadastrada</h3>
        <p className="text-gray-500 mt-2">Você precisa de turmas e alunos para realizar avaliações.</p>
        <button onClick={onCancel} className="mt-4 text-primary-600 font-black uppercase tracking-widest hover:underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Nova Avaliação</h2>
            <p className="text-gray-500 text-sm">Preencha os dados de desempenho do aluno</p>
          </div>
          <button onClick={onCancel} className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-all shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Hierarchical Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <School size={12}/> 1. Selecione a Turma
              </label>
              <select 
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold"
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(e.target.value);
                  setFormData(prev => ({ ...prev, studentId: '' })); // Reset aluno ao mudar turma
                }}
              >
                <option value="">Escolha a turma...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <User size={12}/> 2. Selecione o Aluno
              </label>
              <select 
                required
                disabled={!selectedClassId}
                className={`w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold ${!selectedClassId ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
              >
                <option value="">{selectedClassId ? 'Escolha o aluno...' : 'Selecione uma turma primeiro'}</option>
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Data da Avaliação</label>
              <input 
                type="date" 
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Referência do Texto</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Conto Infantil Nível 2"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold"
                value={formData.textTitle}
                onChange={e => setFormData({...formData, textTitle: e.target.value})}
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 p-2 rounded-2xl w-fit mx-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('PORTUGUESE')}
              className={`px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === 'PORTUGUESE' ? 'bg-white shadow-xl text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Português
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MATH')}
              className={`px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === 'MATH' ? 'bg-white shadow-xl text-amber-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calculator className="w-4 h-4" /> Matemática
            </button>
          </div>

          <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
            {activeTab === 'PORTUGUESE' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div> Fluência
                  </h4>
                  <div className="space-y-3">
                    <Checkbox label="Ritmo" checked={criteria.fluency.rhythm} onChange={() => toggleCriteria('fluency', 'rhythm')} />
                    <Checkbox label="Entonação" checked={criteria.fluency.intonation} onChange={() => toggleCriteria('fluency', 'intonation')} />
                    <Checkbox label="Segurança" checked={criteria.fluency.security} onChange={() => toggleCriteria('fluency', 'security')} />
                  </div>
                  <div className="pt-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WPM (Palavras/Min)</label>
                    <input type="number" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 font-black text-xl text-center focus:border-primary-500 outline-none transition-all" value={formData.wpm} onChange={e => setFormData({...formData, wpm: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div> Decodificação
                  </h4>
                  <div className="space-y-3">
                    <Checkbox label="Reconhecimento" checked={criteria.decoding.recognition} onChange={() => toggleCriteria('decoding', 'recognition')} />
                    <Checkbox label="Sem Omissões" checked={criteria.decoding.noOmissions} onChange={() => toggleCriteria('decoding', 'noOmissions')} />
                    <Checkbox label="Palavras Longas" checked={criteria.decoding.complexWords} onChange={() => toggleCriteria('decoding', 'complexWords')} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50"></div> Compreensão
                  </h4>
                  <div className="space-y-3">
                    <Checkbox label="Ideia Principal" checked={criteria.comprehension.mainIdea} onChange={() => toggleCriteria('comprehension', 'mainIdea')} />
                    <Checkbox label="Fatos Explícitos" checked={criteria.comprehension.explicit} onChange={() => toggleCriteria('comprehension', 'explicit')} />
                    <Checkbox label="Inferências" checked={criteria.comprehension.inference} onChange={() => toggleCriteria('comprehension', 'inference')} />
                  </div>
                  <div className="pt-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Nota Interpretativa: {formData.comprehension}</label>
                    <input type="range" min="1" max="10" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500" value={formData.comprehension} onChange={e => setFormData({...formData, comprehension: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Checkbox label="Senso Numérico" checked={!!criteria.math?.numberSense} onChange={() => toggleCriteria('math', 'numberSense')} />
                  <Checkbox label="Operações" checked={!!criteria.math?.operations} onChange={() => toggleCriteria('math', 'operations')} />
                  <Checkbox label="Lógica" checked={!!criteria.math?.logicReasoning} onChange={() => toggleCriteria('math', 'logicReasoning')} />
                  <Checkbox label="Geometria" checked={!!criteria.math?.geometry} onChange={() => toggleCriteria('math', 'geometry')} />
                </div>
                <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-100 text-center shadow-inner">
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-6">Nota de Desempenho Matemático</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({...formData, mathScore: n})}
                        className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-sm ${formData.mathScore === n ? 'bg-amber-500 text-white scale-110 shadow-amber-500/30' : 'bg-white text-amber-600 hover:bg-amber-100'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Observações e Parecer</label>
            <textarea 
              rows={4}
              placeholder="Descreva observações específicas do momento da leitura..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-6 focus:bg-white focus:border-primary-500 outline-none transition-all resize-none font-medium"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
            <button type="button" onClick={onCancel} className="px-10 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-all">Descartar</button>
            <button type="submit" className="px-12 py-5 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
              <Save className="w-5 h-5" /> Finalizar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
      checked ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
    }`}
  >
    {checked ? <CheckSquare className="w-5 h-5 text-primary-600" /> : <Square className="w-5 h-5 opacity-30" />}
    <span className="text-sm font-black uppercase tracking-tight">{label}</span>
  </button>
);
