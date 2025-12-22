
import React from 'react';
import { Student, Assessment, ProficiencyLevel } from '../types';
import { ArrowLeft, Calendar, FileText, Clock, Book, Calculator, TrendingUp } from 'lucide-react';

interface StudentHistoryProps {
  student: Student;
  assessments: Assessment[];
  onBack: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({ student, assessments, onBack }) => {
  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getLevelColor = (level?: ProficiencyLevel) => {
    switch (level) {
      case 'Insuficiente': return 'bg-red-50 text-red-600 border-red-100';
      case 'Básico': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Adequado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Avançado': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 hover:bg-gray-200 rounded-2xl transition-all shadow-sm bg-white"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Prontuário de Evolução</h1>
          <p className="text-gray-500 font-medium">{student.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center sticky top-8">
            <img src={student.avatarUrl} alt={student.name} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-gray-50 mb-6 shadow-xl" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{student.name}</h2>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100">
              {student.readingLevel}
            </div>
            
            <div className="mt-8 w-full space-y-4">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-black uppercase">Avaliações</span>
                 <span className="font-black text-gray-900">{assessments.length}</span>
               </div>
               <div className="h-px bg-gray-50"></div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-black uppercase">Média WPM</span>
                 <span className="font-black text-primary-600 text-lg">
                   {assessments.length > 0 ? Math.round(assessments.reduce((acc, curr) => acc + curr.wpm, 0) / assessments.length) : 0}
                 </span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-black uppercase">Média MAT</span>
                 <span className="font-black text-amber-600 text-lg">
                   {assessments.length > 0 ? (assessments.reduce((acc, curr) => acc + (curr.mathScore || 0), 0) / assessments.length).toFixed(1) : 0}
                 </span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {sortedAssessments.length === 0 ? (
            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
              <Book className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest">Nenhum registro encontrado.</p>
            </div>
          ) : (
            sortedAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-50 pb-6">
                   <div className="flex items-center gap-4">
                     <div className="bg-primary-500 p-4 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                       <FileText className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{assessment.textTitle}</h3>
                       <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                         <Calendar className="w-3 h-3" />
                         {new Date(assessment.date).toLocaleDateString('pt-BR')}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex gap-4">
                     <div className="text-center px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                       <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Fluência</div>
                       <div className="font-black text-primary-600 text-xl flex items-center gap-2">
                         <Clock size={18} /> {assessment.wpm} <span className="text-[8px] opacity-50">WPM</span>
                       </div>
                     </div>
                     <div className="text-center px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                       <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Matemática</div>
                       <div className="font-black text-amber-600 text-xl flex items-center gap-2">
                         <Calculator size={18} /> {assessment.mathScore || '-'}
                       </div>
                     </div>
                   </div>
                </div>

                <div className="space-y-8">
                   {/* Níveis de Português */}
                   {assessment.criteria && (
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ProficiencyBadge label="Fluência" level={assessment.criteria.fluency} colorClass={getLevelColor(assessment.criteria.fluency)} />
                        <ProficiencyBadge label="Decodificação" level={assessment.criteria.decoding} colorClass={getLevelColor(assessment.criteria.decoding)} />
                        <ProficiencyBadge label="Compreensão" level={assessment.criteria.comprehension} colorClass={getLevelColor(assessment.criteria.comprehension)} />
                     </div>
                   )}

                   {/* Critérios de Matemática */}
                   {assessment.criteria?.math && (
                     <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                       <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp size={12}/> Habilidades Matemáticas</p>
                       <div className="flex flex-wrap gap-2">
                         {assessment.criteria.math.numberSense && <MathSkillBadge label="Senso Numérico" />}
                         {assessment.criteria.math.logicReasoning && <MathSkillBadge label="Raciocínio Lógico" />}
                         {assessment.criteria.math.operations && <MathSkillBadge label="Operações" />}
                         {assessment.criteria.math.geometry && <MathSkillBadge label="Geometria" />}
                       </div>
                     </div>
                   )}

                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Observações Pedagógicas</p>
                     <p className="text-gray-600 text-sm font-medium bg-gray-50/80 p-5 rounded-2xl border border-gray-100 leading-relaxed italic">
                       "{assessment.notes || 'Sem observações adicionais.'}"
                     </p>
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

const ProficiencyBadge: React.FC<{ label: string, level: ProficiencyLevel, colorClass: string }> = ({ label, level, colorClass }) => (
  <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${colorClass}`}>
    <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">{label}</span>
    <span className="text-xs font-black uppercase tracking-tight">{level}</span>
  </div>
);

const MathSkillBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
    {label}
  </span>
);
