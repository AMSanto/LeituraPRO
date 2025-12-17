import React, { useState } from 'react';
import { Student, Assessment, SchoolClass, AssessmentCriteria } from '../types';
import { Save, AlertCircle, CheckSquare, Square } from 'lucide-react';

interface AssessmentFormProps {
  students: Student[];
  classes: SchoolClass[];
  onSave: (assessment: Omit<Assessment, 'id'>) => void;
  onCancel: () => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ students, classes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: students.length > 0 ? students[0].id : '',
    date: new Date().toISOString().split('T')[0],
    textTitle: '',
    wpm: 0,
    accuracy: 95,
    comprehension: 5,
    notes: ''
  });

  const [criteria, setCriteria] = useState<AssessmentCriteria>({
    fluency: {
      rhythm: false,
      pauses: false,
      intonation: false,
      security: false
    },
    decoding: {
      recognition: false,
      noOmissions: false,
      complexWords: false
    },
    comprehension: {
      mainIdea: false,
      explicit: false,
      implicit: false,
      inference: false,
      titleRelation: false
    }
  });

  const toggleCriteria = (category: keyof AssessmentCriteria, field: string) => {
    setCriteria(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      criteria
    });
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Nenhum aluno cadastrado</h3>
        <p className="text-gray-500 max-w-md mt-2">Você precisa cadastrar alunos antes de realizar uma avaliação.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Nova Avaliação de Leitura</h2>
          <p className="text-sm text-gray-500">Avalie os critérios de fluência, decodificação e compreensão.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
              <select 
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
              >
                {students.map(s => {
                  const sClass = classes.find(c => c.id === s.classId);
                  return (
                    <option key={s.id} value={s.id}>{s.name} ({sClass?.gradeLevel || 'Sem turma'})</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Leitura</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Texto</label>
              <input 
                type="text" 
                required
                placeholder="Ex: O Sapo Curioso"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.textTitle}
                onChange={e => setFormData({...formData, textTitle: e.target.value})}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Critérios de Avaliação */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Fluência */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Fluência de Leitura
              </h3>
              <div className="space-y-3">
                <CheckboxItem 
                  label="Lê com ritmo adequado" 
                  checked={criteria.fluency.rhythm} 
                  onChange={() => toggleCriteria('fluency', 'rhythm')} 
                />
                <CheckboxItem 
                  label="Faz pausas corretas" 
                  checked={criteria.fluency.pauses} 
                  onChange={() => toggleCriteria('fluency', 'pauses')} 
                />
                <CheckboxItem 
                  label="Apresenta entonação" 
                  checked={criteria.fluency.intonation} 
                  onChange={() => toggleCriteria('fluency', 'intonation')} 
                />
                <CheckboxItem 
                  label="Demonstra segurança" 
                  checked={criteria.fluency.security} 
                  onChange={() => toggleCriteria('fluency', 'security')} 
                />
              </div>
              <div className="pt-2">
                 <label className="block text-xs font-medium text-gray-500 mb-1">Palavras por Minuto (WPM)</label>
                 <input 
                  type="number" 
                  min="0"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={formData.wpm}
                  onChange={e => setFormData({...formData, wpm: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* 2. Decodificação */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">2</span>
                Decodificação
              </h3>
              <div className="space-y-3">
                <CheckboxItem 
                  label="Reconhece sem soletrar" 
                  checked={criteria.decoding.recognition} 
                  onChange={() => toggleCriteria('decoding', 'recognition')} 
                />
                <CheckboxItem 
                  label="Sem trocas ou omissões" 
                  checked={criteria.decoding.noOmissions} 
                  onChange={() => toggleCriteria('decoding', 'noOmissions')} 
                />
                <CheckboxItem 
                  label="Lê palavras longas/complexas" 
                  checked={criteria.decoding.complexWords} 
                  onChange={() => toggleCriteria('decoding', 'complexWords')} 
                />
              </div>
               <div className="pt-2">
                 <label className="block text-xs font-medium text-gray-500 mb-1">Precisão Estimada (%)</label>
                 <input 
                  type="number" 
                  min="0"
                  max="100"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  value={formData.accuracy}
                  onChange={e => setFormData({...formData, accuracy: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* 3. Compreensão */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">3</span>
                Compreensão
              </h3>
              <div className="space-y-3">
                <CheckboxItem 
                  label="Identifica ideia principal" 
                  checked={criteria.comprehension.mainIdea} 
                  onChange={() => toggleCriteria('comprehension', 'mainIdea')} 
                />
                <CheckboxItem 
                  label="Localiza info. explícitas" 
                  checked={criteria.comprehension.explicit} 
                  onChange={() => toggleCriteria('comprehension', 'explicit')} 
                />
                <CheckboxItem 
                  label="Identifica info. implícitas" 
                  checked={criteria.comprehension.implicit} 
                  onChange={() => toggleCriteria('comprehension', 'implicit')} 
                />
                <CheckboxItem 
                  label="Faz inferências simples" 
                  checked={criteria.comprehension.inference} 
                  onChange={() => toggleCriteria('comprehension', 'inference')} 
                />
                <CheckboxItem 
                  label="Relaciona com o título" 
                  checked={criteria.comprehension.titleRelation} 
                  onChange={() => toggleCriteria('comprehension', 'titleRelation')} 
                />
              </div>
               <div className="pt-2">
                 <label className="block text-xs font-medium text-gray-500 mb-1">Nota Geral (1-10)</label>
                 <select 
                   className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                   value={formData.comprehension}
                   onChange={e => setFormData({...formData, comprehension: Number(e.target.value)})}
                 >
                   {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                 </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
            <textarea 
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Observações adicionais sobre o desempenho do aluno..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Save className="w-5 h-5" />
              Salvar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckboxItem: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <div 
    onClick={onChange}
    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
      checked 
        ? 'bg-blue-50 border-blue-200 text-blue-900' 
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
    }`}
  >
    {checked ? <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" /> : <Square className="w-5 h-5 text-gray-400 shrink-0" />}
    <span className="text-sm font-medium select-none">{label}</span>
  </div>
);