import React from 'react';
import { Student, Assessment } from '../types';
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock, Book, Calculator, Brain, Users } from 'lucide-react';

interface StudentHistoryProps {
  student: Student;
  assessments: Assessment[];
  onBack: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({ student, assessments, onBack }) => {
  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white hover:bg-violet-50 rounded-xl shadow-sm transition-all text-violet-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Evolução do Aluno</h1>
          <p className="text-gray-500 font-medium">{student.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img src={student.avatarUrl} alt={student.name} className="w-24 h-24 rounded-full object-cover border-4 border-violet-100" />
              <div className="absolute -bottom-2 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
            </div>
            <h2 className="text-lg font-black text-gray-900">{student.name}</h2>
            <span className="mt-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {student.readingLevel}
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4" /> Resumo de Atividades</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs opacity-90">
                <span>Total Leitura</span>
                <span className="font-bold">{assessments.filter(a => a.subject === 'Reading').length}</span>
              </div>
              <div className="flex justify-between text-xs opacity-90">
                <span>Total Matemática</span>
                <span className="font-bold">{assessments.filter(a => a.subject === 'Math').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {sortedAssessments.length === 0 ? (
            <div className="bg-white p-20 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">Inicie sua primeira avaliação com este aluno.</p>
            </div>
          ) : (
            sortedAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-8 border-l-violet-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                   <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${assessment.subject === 'Math' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                       {assessment.subject === 'Math' ? <Calculator className="w-6 h-6" /> : <Book className="w-6 h-6" />}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${assessment.subject === 'Math' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                           {assessment.subject === 'Math' ? 'Matemática' : 'Leitura'}
                         </span>
                         <span className="text-gray-400 text-xs font-medium">{new Date(assessment.date).toLocaleDateString('pt-BR')}</span>
                       </div>
                       <h3 className="font-black text-gray-900 text-lg leading-tight">{assessment.textTitle}</h3>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     <div className="text-center">
                       <div className="text-[10px] text-gray-400 font-bold uppercase">Precisão</div>
                       <div className="text-xl font-black text-gray-900">{assessment.accuracy}%</div>
                     </div>
                     <div className="w-px h-8 bg-gray-100"></div>
                     <div className="text-center">
                       <div className="text-[10px] text-gray-400 font-bold uppercase">Nota</div>
                       <div className="text-xl font-black text-violet-600">{assessment.comprehension}/10</div>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notas Pedagógicas</p>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                      "{assessment.notes || 'Nenhum detalhe adicional registrado.'}"
                    </p>
                  </div>
                  
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Principais Indicadores</p>
                    <div className="flex flex-wrap gap-2">
                      {assessment.subject === 'Reading' ? (
                        <>
                          <IndicatorBadge active={assessment.criteria?.fluency?.security} label="Segurança" />
                          <IndicatorBadge active={assessment.criteria?.fluency?.intonation} label="Entonação" />
                          <IndicatorBadge active={assessment.criteria?.comprehension?.inference} label="Inferência" />
                        </>
                      ) : (
                        <>
                          <IndicatorBadge active={assessment.criteria?.math?.logicalReasoning} label="Lógica" color="blue" />
                          <IndicatorBadge active={assessment.criteria?.math?.problemSolving} label="Problemas" color="blue" />
                          <IndicatorBadge active={assessment.criteria?.math?.criticalThinking} label="Crítica" color="blue" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const IndicatorBadge = ({ active, label, color = 'violet' }: { active?: boolean, label: string, color?: string }) => (
  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
    active 
      ? `bg-${color}-100 border-${color}-200 text-${color}-700 shadow-sm` 
      : 'bg-white border-gray-100 text-gray-300'
  }`}>
    {label}
  </span>
);