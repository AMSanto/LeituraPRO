import React from 'react';
import { Student, Assessment } from '../types';
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock, Book } from 'lucide-react';

interface StudentHistoryProps {
  student: Student;
  assessments: Assessment[];
  onBack: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({ student, assessments, onBack }) => {
  // Ordenar avaliações da mais recente para a mais antiga
  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Leitura</h1>
          <p className="text-gray-500">Acompanhamento detalhado: {student.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <img 
              src={student.avatarUrl} 
              alt={student.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-50 mb-4" 
            />
            <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
            <div className="mt-2 inline-flex px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              {student.readingLevel}
            </div>
            <div className="mt-6 w-full space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Total de Leituras</span>
                 <span className="font-semibold">{assessments.length}</span>
               </div>
               <div className="w-full h-px bg-gray-100"></div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Média WPM</span>
                 <span className="font-semibold">
                   {assessments.length > 0 
                     ? Math.round(assessments.reduce((acc, curr) => acc + curr.wpm, 0) / assessments.length) 
                     : 0}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-3 space-y-4">
          {sortedAssessments.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 border-dashed text-center">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma avaliação registrada para este aluno.</p>
            </div>
          ) : (
            sortedAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-3">
                     <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-900">{assessment.textTitle}</h3>
                       <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                         <Calendar className="w-3 h-3" />
                         {new Date(assessment.date).toLocaleDateString('pt-BR')}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex gap-4">
                     <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                       <div className="text-xs text-gray-500 font-medium uppercase">WPM</div>
                       <div className="font-bold text-gray-900 text-lg flex items-center gap-1 justify-center">
                         <Clock className="w-4 h-4 text-gray-400" />
                         {assessment.wpm}
                       </div>
                     </div>
                     <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                       <div className="text-xs text-gray-500 font-medium uppercase">Precisão</div>
                       <div className="font-bold text-gray-900 text-lg flex items-center gap-1 justify-center">
                         <CheckCircle className="w-4 h-4 text-gray-400" />
                         {assessment.accuracy}%
                       </div>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                   {/* Notas */}
                   <div>
                     <p className="text-sm font-medium text-gray-700 mb-1">Observações do Professor:</p>
                     <p className="text-gray-600 text-sm italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                       "{assessment.notes || 'Sem observações.'}"
                     </p>
                   </div>

                   {/* Critérios (Se existirem) */}
                   {assessment.criteria && (
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                       <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                         <h4 className="text-xs font-bold text-blue-700 mb-2">Fluência</h4>
                         <ul className="text-xs space-y-1 text-gray-600">
                           <li className={assessment.criteria.fluency.rhythm ? 'text-green-600 font-medium' : 'text-red-400'}>• Ritmo</li>
                           <li className={assessment.criteria.fluency.pauses ? 'text-green-600 font-medium' : 'text-red-400'}>• Pausas</li>
                           <li className={assessment.criteria.fluency.intonation ? 'text-green-600 font-medium' : 'text-red-400'}>• Entonação</li>
                         </ul>
                       </div>
                       <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                         <h4 className="text-xs font-bold text-green-700 mb-2">Decodificação</h4>
                         <ul className="text-xs space-y-1 text-gray-600">
                           <li className={assessment.criteria.decoding.recognition ? 'text-green-600 font-medium' : 'text-red-400'}>• Reconhecimento</li>
                           <li className={assessment.criteria.decoding.noOmissions ? 'text-green-600 font-medium' : 'text-red-400'}>• Sem omissões</li>
                         </ul>
                       </div>
                       <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                         <h4 className="text-xs font-bold text-purple-700 mb-2">Compreensão ({assessment.comprehension}/10)</h4>
                         <ul className="text-xs space-y-1 text-gray-600">
                           <li className={assessment.criteria.comprehension.mainIdea ? 'text-green-600 font-medium' : 'text-red-400'}>• Ideia Principal</li>
                           <li className={assessment.criteria.comprehension.inference ? 'text-green-600 font-medium' : 'text-red-400'}>• Inferência</li>
                         </ul>
                       </div>
                     </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};