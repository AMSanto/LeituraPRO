
import React, { useState, useMemo } from 'react';
import { Student, Assessment, SchoolClass, AssessmentCriteria, ProficiencyLevel } from '../types';
import { Save, AlertCircle, Calculator, BookOpen, ChevronLeft, School, User, CheckCircle2 } from 'lucide-react';

interface AssessmentFormProps {
  students: Student[];
  classes: SchoolClass[];
  onSave: (assessment: Omit<Assessment, 'id'>) => void;
  onCancel: () => void;
}

type TabType = 'PORTUGUESE' | 'MATH';

const LEVELS: ProficiencyLevel[] = ['Insuficiente', 'Básico', 'Adequado', 'Avançado'];

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
    fluency: 'Básico',
    decoding: 'Básico',
    comprehension: 'Básico',
    math: { 
      numberSense: false, 
      logicReasoning: false, 
      operations: false, 
      geometry: false 
    }
  });

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const handleLevelSelect = (category: 'fluency' | 'decoding' | 'comprehension', level: ProficiencyLevel) => {
    setCriteria(prev => ({
      ...prev,
      [category]: level
    }));
  };

  const toggleMathCriteria = (field: keyof NonNullable<AssessmentCriteria['math']>) => {
    setCriteria(prev => ({
      ...prev,
      math: {
        ...prev.math!,
        [field]: !prev.math?.[field]
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
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-6 md:p-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Nenhuma turma cadastrada</h3>
        <p className="text-gray-500 mt-2 text-sm">Você precisa de turmas e alunos para realizar avaliações.</p>
        <button onClick={onCancel} className="mt-4 text-primary-600 font-black uppercase tracking-widest hover:underline text-xs">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 md:pb-20">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Nova Avaliação</h2>
            <p className="text-gray-500 text-xs md:text-sm">Registro de desempenho por competência</p>
          </div>
          <button onClick={onCancel} className="p-2 md:p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <School size={12}/> 1. Turma
              </label>
              <select 
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-sm"
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(e.target.value);
                  setFormData(prev => ({ ...prev, studentId: '' }));
                }}
              >
                <option value="">Escolha a turma...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <User size={12}/> 2. Aluno
              </label>
              <select 
                required
                disabled={!selectedClassId}
                className={`w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-sm ${!selectedClassId ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
              >
                <option value="">{selectedClassId ? 'Escolha o aluno...' : 'Selecione uma turma primeiro'}</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Data</label>
              <input type="date" required className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Atividade / Texto</label>
              <input type="text" required placeholder="Ex: Avaliação de Fluência 01" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-sm" value={formData.textTitle} onChange={e => setFormData({...formData, textTitle: e.target.value})} />
            </div>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-fit mx-auto shadow-inner">
            <button type="button" onClick={() => setActiveTab('PORTUGUESE')} className={`flex-1 sm:flex-none px-4 md:px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'PORTUGUESE' ? 'bg-white shadow-xl text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}><BookOpen className="w-4 h-4" /> Português</button>
            <button type="button" onClick={() => setActiveTab('MATH')} className={`flex-1 sm:flex-none px-4 md:px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'MATH' ? 'bg-white shadow-xl text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}><Calculator className="w-4 h-4" /> Matemática</button>
          </div>

          <div className="bg-gray-50/50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-gray-100">
            {activeTab === 'PORTUGUESE' ? (
              <div className="space-y-8 md:space-y-10 animate-fade-in">
                <div className="grid grid-cols-1 gap-6 md:gap-8">
                  <LevelSelector label="Fluência" current={criteria.fluency} onSelect={(l) => handleLevelSelect('fluency', l)} />
                  <LevelSelector label="Decodificação" current={criteria.decoding} onSelect={(l) => handleLevelSelect('decoding', l)} />
                  <LevelSelector label="Compreensão" current={criteria.comprehension} onSelect={(l) => handleLevelSelect('comprehension', l)} />
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <div className="max-w-xs mx-auto sm:mx-0">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-center sm:text-left">WPM (Palavras por Minuto)</label>
                    <input type="number" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 font-black text-xl text-center focus:border-primary-500 outline-none transition-all" value={formData.wpm} onChange={e => setFormData({...formData, wpm: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-8 md:space-y-10 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MathCheckbox label="Senso Numérico" checked={!!criteria.math?.numberSense} onChange={() => toggleMathCriteria('numberSense')} />
                  <MathCheckbox label="Raciocínio Lógico" checked={!!criteria.math?.logicReasoning} onChange={() => toggleMathCriteria('logicReasoning')} />
                  <MathCheckbox label="Operações" checked={!!criteria.math?.operations} onChange={() => toggleMathCriteria('operations')} />
                  <MathCheckbox label="Geometria" checked={!!criteria.math?.geometry} onChange={() => toggleMathCriteria('geometry')} />
                </div>
                <div className="bg-amber-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 border-amber-100 text-center shadow-inner">
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-4 md:mb-6">Nota de Desempenho (1 a 10)</p>
                  <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} type="button" onClick={() => setFormData({...formData, mathScore: n})} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-black text-xs md:text-sm transition-all ${formData.mathScore === n ? 'bg-amber-500 text-white scale-110 shadow-lg' : 'bg-white text-amber-600 hover:bg-amber-100'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Observações do Professor</label>
            <textarea rows={4} placeholder="Descreva as dificuldades ou avanços percebidos..." className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 focus:bg-white focus:border-primary-500 outline-none transition-all resize-none font-medium text-sm" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 pt-4 md:pt-6">
            <button type="button" onClick={onCancel} className="px-10 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all order-2 sm:order-1">Cancelar</button>
            <button type="submit" className="px-8 md:px-12 py-4 md:py-5 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"><Save className="w-4 h-4 md:w-5 md:h-5" /> Salvar Avaliação</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LevelSelector: React.FC<{ label: string, current: ProficiencyLevel, onSelect: (l: ProficiencyLevel) => void }> = ({ label, current, onSelect }) => {
  const getColors = (level: ProficiencyLevel) => {
    switch (level) {
      case 'Insuficiente': return 'bg-red-500 text-white';
      case 'Básico': return 'bg-amber-500 text-white';
      case 'Adequado': return 'bg-emerald-500 text-white';
      case 'Avançado': return 'bg-blue-500 text-white';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LEVELS.map(level => (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            className={`py-3 px-2 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
              current === level 
                ? `${getColors(level)} border-transparent shadow-lg scale-105 z-10` 
                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

const MathCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all text-left ${
      checked ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
    }`}
  >
    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-amber-500 border-amber-500' : 'border-gray-200'}`}>
      {checked && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />}
    </div>
    <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">{label}</span>
  </button>
);
