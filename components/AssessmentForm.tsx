import React, { useState } from 'react';
import { Student, Assessment, SchoolClass, AssessmentCriteria } from '../types';
import { Save, AlertCircle, CheckSquare, Square, Calculator, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface AssessmentFormProps {
  students: Student[];
  classes: SchoolClass[];
  onSave: (assessment: Omit<Assessment, 'id'>) => void;
  onCancel: () => void;
}

type TabType = 'PORTUGUESE' | 'MATH';

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ students, classes, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PORTUGUESE');
  const [formData, setFormData] = useState({
    studentId: students.length > 0 ? students[0].id : '',
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

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Sem alunos cadastrados</h3>
        <p className="text-gray-500 mt-2">Cadastre seus alunos antes de iniciar uma avaliação.</p>
        <button onClick={onCancel} className="mt-4 text-primary-600 font-semibold hover:underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Registro de Avaliação</h2>
            <p className="text-gray-500 text-sm">Acompanhamento qualitativo e quantitativo</p>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Header Data */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Estudante</label>
              <select 
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-primary-50 transition-all outline-none appearance-none"
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
              >
                <option value="">Selecione um aluno...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">Data</label>
              <input 
                type="date" 
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-primary-50 transition-all outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">Referência</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Texto A1"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-primary-50 transition-all outline-none"
                value={formData.textTitle}
                onChange={e => setFormData({...formData, textTitle: e.target.value})}
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('PORTUGUESE')}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'PORTUGUESE' ? 'bg-white shadow-lg text-primary-600 scale-105' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Português
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MATH')}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'MATH' ? 'bg-white shadow-lg text-amber-600 scale-105' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calculator className="w-4 h-4" /> Matemática
            </button>
          </div>

          <div className="min-h-[300px] bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
            {activeTab === 'PORTUGUESE' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Fluência
                  </h4>
                  <div className="grid gap-2">
                    <Checkbox label="Ritmo" checked={criteria.fluency.rhythm} onChange={() => toggleCriteria('fluency', 'rhythm')} />
                    <Checkbox label="Entonação" checked={criteria.fluency.intonation} onChange={() => toggleCriteria('fluency', 'intonation')} />
                    <Checkbox label="Segurança" checked={criteria.fluency.security} onChange={() => toggleCriteria('fluency', 'security')} />
                  </div>
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Palavras/Minuto (WPM)</label>
                    <input type="number" className="w-full bg-white border border-gray-200 rounded-xl p-2.5" value={formData.wpm} onChange={e => setFormData({...formData, wpm: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Decodificação
                  </h4>
                  <div className="grid gap-2">
                    <Checkbox label="Reconhecimento" checked={criteria.decoding.recognition} onChange={() => toggleCriteria('decoding', 'recognition')} />
                    <Checkbox label="Sem Omissões" checked={criteria.decoding.noOmissions} onChange={() => toggleCriteria('decoding', 'noOmissions')} />
                    <Checkbox label="Palavras Longas" checked={criteria.decoding.complexWords} onChange={() => toggleCriteria('decoding', 'complexWords')} />
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div> Compreensão
                  </h4>
                  <div className="grid gap-2">
                    <Checkbox label="Ideia Principal" checked={criteria.comprehension.mainIdea} onChange={() => toggleCriteria('comprehension', 'mainIdea')} />
                    <Checkbox label="Fatos Explícitos" checked={criteria.comprehension.explicit} onChange={() => toggleCriteria('comprehension', 'explicit')} />
                    <Checkbox label="Inferências" checked={criteria.comprehension.inference} onChange={() => toggleCriteria('comprehension', 'inference')} />
                  </div>
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Nota Interpretativa (1-10)</label>
                    <input type="range" min="1" max="10" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500" value={formData.comprehension} onChange={e => setFormData({...formData, comprehension: Number(e.target.value)})} />
                    <div className="text-center font-bold text-primary-600 mt-1">{formData.comprehension}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Checkbox label="Senso Numérico" checked={!!criteria.math?.numberSense} onChange={() => toggleCriteria('math', 'numberSense')} />
                  <Checkbox label="Operações" checked={!!criteria.math?.operations} onChange={() => toggleCriteria('math', 'operations')} />
                  <Checkbox label="Lógica" checked={!!criteria.math?.logicReasoning} onChange={() => toggleCriteria('math', 'logicReasoning')} />
                  <Checkbox label="Geometria" checked={!!criteria.math?.geometry} onChange={() => toggleCriteria('math', 'geometry')} />
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
                  <p className="text-amber-800 font-bold mb-4">Nota de Desempenho Matemático</p>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({...formData, mathScore: n})}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${formData.mathScore === n ? 'bg-amber-500 text-white scale-110 shadow-lg' : 'bg-white text-amber-600 hover:bg-amber-100'}`}
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Parecer Pedagógico</label>
            <textarea 
              rows={3}
              placeholder="Descreva observações específicas do momento da avaliação..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-primary-50 outline-none transition-all resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-8 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancelar</button>
            <button type="submit" className="px-10 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 transition-all hover:scale-[1.02] flex items-center gap-2">
              <Save className="w-5 h-5" /> Salvar Avaliação
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
    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
      checked ? 'bg-primary-50 border-primary-500 text-primary-900' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
    }`}
  >
    {checked ? <CheckSquare className="w-5 h-5 text-primary-600" /> : <Square className="w-5 h-5" />}
    <span className="text-sm font-bold">{label}</span>
  </button>
);