import React, { useState, useEffect } from 'react';
import { Student, Assessment, SchoolClass, AssessmentCriteria, Subject } from '../types';
import { Save, AlertCircle, CheckSquare, Square, Book, Calculator, Brain, Users, Lightbulb, FilterX } from 'lucide-react';

interface AssessmentFormProps {
  students: Student[];
  classes: SchoolClass[];
  initialClassId?: string;
  onSave: (assessment: Omit<Assessment, 'id'>) => void;
  onCancel: () => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ students, classes, initialClassId, onSave, onCancel }) => {
  const [subject, setSubject] = useState<Subject>('Reading');
  
  // Filtrar alunos baseados na turma inicial se fornecida
  const filteredStudentsList = initialClassId 
    ? students.filter(s => s.classId === initialClassId)
    : students;

  const [formData, setFormData] = useState({
    studentId: filteredStudentsList.length > 0 ? filteredStudentsList[0].id : '',
    date: new Date().toISOString().split('T')[0],
    textTitle: '',
    wpm: 0,
    accuracy: 90,
    comprehension: 7,
    notes: ''
  });

  // Garantir que o studentId inicial mude se a lista filtrada mudar
  useEffect(() => {
    if (filteredStudentsList.length > 0 && !filteredStudentsList.find(s => s.id === formData.studentId)) {
        setFormData(prev => ({ ...prev, studentId: filteredStudentsList[0].id }));
    }
  }, [initialClassId, filteredStudentsList, formData.studentId]);

  const [criteria, setCriteria] = useState<AssessmentCriteria>({
    fluency: { rhythm: false, pauses: false, intonation: false, security: false },
    decoding: { recognition: false, noOmissions: false, complexWords: false },
    math: { logicalReasoning: false, problemSolving: false, modeling: false, criticalThinking: false, cooperation: false },
    comprehension: { mainIdea: false, explicit: false, implicit: false, inference: false, titleRelation: false }
  });

  const toggleCriteria = (category: keyof AssessmentCriteria, field: string) => {
    setCriteria(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof AssessmentCriteria] as any,
        [field]: !(prev[category as keyof AssessmentCriteria] as any)[field]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, subject, criteria });
  };

  const getClassName = () => {
    return classes.find(c => c.id === initialClassId)?.name || 'Todos os Alunos';
  }

  if (filteredStudentsList.length === 0) return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
      <FilterX className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500 font-bold mb-2">Nenhum aluno nesta turma.</p>
      <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">Adicione alunos à turma <b>{getClassName()}</b> para poder avaliá-los.</p>
      <button onClick={onCancel} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Voltar</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-gray-900">Nova Avaliação IA</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-100 px-2 py-0.5 rounded">
                Turma: {getClassName()}
               </span>
               {initialClassId && (
                 <p className="text-[10px] text-gray-400 font-medium italic">(Filtro Ativo)</p>
               )}
            </div>
          </div>
          
          <div className="flex bg-gray-200 p-1.5 rounded-2xl shadow-inner">
            <button 
              type="button"
              onClick={() => setSubject('Reading')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${subject === 'Reading' ? 'bg-white text-violet-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Book className="w-4 h-4" /> Leitura
            </button>
            <button 
              type="button"
              onClick={() => setSubject('Math')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${subject === 'Math' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Calculator className="w-4 h-4" /> Matemática
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Selecionar Aluno</label>
              <select 
                required
                className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-violet-500 outline-none transition-all font-bold text-gray-800 bg-gray-50/30"
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
              >
                {filteredStudentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Data da Avaliação</label>
              <input type="date" className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-violet-500 outline-none font-bold text-gray-700" 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                {subject === 'Reading' ? 'Título da Leitura' : 'Tópico ou Problema'}
              </label>
              <input type="text" required placeholder={subject === 'Reading' ? 'Ex: Os Três Porquinhos' : 'Ex: Desafio das Formas'}
                className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-violet-500 outline-none font-bold"
                value={formData.textTitle} onChange={e => setFormData({...formData, textTitle: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {subject === 'Reading' ? (
              <>
                <div className="space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                    <Book className="w-4 h-4 text-violet-600" /> Fluência
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <CheckboxItem label="Ritmo adequado" checked={criteria.fluency?.rhythm || false} onChange={() => toggleCriteria('fluency', 'rhythm')} />
                    <CheckboxItem label="Pausas corretas" checked={criteria.fluency?.pauses || false} onChange={() => toggleCriteria('fluency', 'pauses')} />
                    <CheckboxItem label="Demonstra segurança" checked={criteria.fluency?.security || false} onChange={() => toggleCriteria('fluency', 'security')} />
                    <CheckboxItem label="Reconhece sem soletrar" checked={criteria.decoding?.recognition || false} onChange={() => toggleCriteria('decoding', 'recognition')} />
                  </div>
                </div>
                <div className="space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Compreensão
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <CheckboxItem label="Identifica Ideia Principal" checked={criteria.comprehension?.mainIdea || false} onChange={() => toggleCriteria('comprehension', 'mainIdea')} />
                    <CheckboxItem label="Interpreta Implícitos" checked={criteria.comprehension?.implicit || false} onChange={() => toggleCriteria('comprehension', 'implicit')} />
                    <CheckboxItem label="Relaciona com o Título" checked={criteria.comprehension?.titleRelation || false} onChange={() => toggleCriteria('comprehension', 'titleRelation')} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-600" /> Raciocínio
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <CheckboxItem label="Lógica Sequencial" checked={criteria.math?.logicalReasoning || false} onChange={() => toggleCriteria('math', 'logicalReasoning')} />
                    <CheckboxItem label="Resolução Autônoma" checked={criteria.math?.problemSolving || false} onChange={() => toggleCriteria('math', 'problemSolving')} />
                    <CheckboxItem label="Modelagem de Situação" checked={criteria.math?.modeling || false} onChange={() => toggleCriteria('math', 'modeling')} />
                  </div>
                </div>
                <div className="space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" /> Socioemocional
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <CheckboxItem label="Argumentação Crítica" checked={criteria.math?.criticalThinking || false} onChange={() => toggleCriteria('math', 'criticalThinking')} />
                    <CheckboxItem label="Cooperação com Pares" checked={criteria.math?.cooperation || false} onChange={() => toggleCriteria('math', 'cooperation')} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-4 text-center">Desempenho Geral (%)</label>
              <input type="range" min="0" max="100" step="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600" 
                value={formData.accuracy} onChange={e => setFormData({...formData, accuracy: Number(e.target.value)})} />
              <div className="text-center text-3xl font-black text-violet-600 mt-4">{formData.accuracy}%</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-4 text-center">Compreensão (1-10)</label>
              <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} type="button" onClick={() => setFormData({...formData, comprehension: n})}
                    className={`h-10 rounded-xl text-xs font-black transition-all transform active:scale-90 ${formData.comprehension === n ? 'bg-violet-600 text-white shadow-lg ring-4 ring-violet-100' : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-200'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Observações Pedagógicas Adicionais</label>
            <textarea rows={4} className="w-full border-2 border-gray-100 rounded-2xl p-5 focus:border-violet-500 outline-none resize-none font-medium text-gray-700 bg-gray-50/30"
              placeholder="O que você notou de especial nesta avaliação?"
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-gray-50">
            <button type="button" onClick={onCancel} className="px-10 py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition-all order-2 sm:order-1">
              Descartar
            </button>
            <button type="submit" className="px-12 py-4 bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:shadow-violet-200 active:scale-95 transition-all order-1 sm:order-2 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Concluir e Analisar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckboxItem: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <div onClick={onChange} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all transform active:scale-[0.98] ${checked ? 'bg-violet-50 border-violet-200 text-violet-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}>
    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-violet-600 border-violet-600' : 'border-gray-200'}`}>
      {checked && <CheckSquare className="w-4 h-4 text-white" />}
    </div>
    <span className="text-sm font-black tracking-tight select-none">{label}</span>
  </div>
);