
import React, { useState } from 'react';
import { Student, Assessment, ProficiencyLevel } from '../types';
import { ArrowLeft, Calendar, FileText, Clock, Book, Calculator, TrendingUp, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { generateStudentAnalysis } from '../services/geminiService';

interface StudentHistoryProps {
  student: Student;
  assessments: Assessment[];
  onBack: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({ student, assessments, onBack }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleGenerateAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await generateStudentAnalysis(student, assessments);
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

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
    <div className="space-y-6 animate-fade-in pb-20 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 hover:bg-gray-200 rounded-2xl transition-all shadow-sm bg-white shrink-0"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Prontuário de Evolução</h1>
            <p className="text-gray-500 font-medium text-xs md:text-sm">{student.name}</p>
          </div>
        </div>
        
        <button 
          onClick={handleGenerateAnalysis}
          disabled={analyzing || assessments.length === 0}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
            analyzing ? 'bg-gray-100 text-gray-400' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
          }`}
        >
          {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {analyzing ? 'Analisando...' : 'Análise com IA'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center sticky top-8">
            <img src={student.avatarUrl} alt={student.name} className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] object-cover border-4 border-gray-50 mb-6 shadow-xl" />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{student.name}</h2>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary-100">
              {student.readingLevel}
            </div>
            
            <div className="mt-8 w-full space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-gray-400">Total Avaliações</span>
                 <span className="text-gray-900">{assessments.length}</span>
               </div>
               <div className="h-px bg-gray-50"></div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-gray-400">Média Fluência</span>
                 <span className="text-primary-600 text-base">
                   {assessments.length > 0 ? Math.round(assessments.reduce((acc, curr) => acc + curr.wpm, 0) / assessments.length) : 0} WPM
                 </span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-primary-500/20 animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles size={120} />
               </div>
               <div className="relative z-10">
                 <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary-100">
                   <MessageSquare size={14} /> Relatório de IA (Gemini)
                 </h3>
                 <p className="text-sm md:text-base leading-relaxed font-medium">
                   {aiAnalysis}
                 </p>
               </div>
            </div>
          )}

          {sortedAssessments.length === 0 ? (
            <div className="bg-white p-12 md:p-20 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
              <Book className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Aguardando primeira avaliação...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Timeline de Desempenho</h3>
              {sortedAssessments.map((assessment) => (
                <div key={assessment.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                     <div className="flex items-center gap-4">
                       <div className="bg-primary-500 p-3 rounded-2xl text-white shadow-lg shadow-primary-500/10">
                         <FileText size={20} />
                       </div>
                       <div>
                         <h3 className="font-black text-gray-900 text-base uppercase tracking-tight">{assessment.textTitle}</h3>
                         <div className="flex items-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                           <Calendar className="w-3 h-3" />
                           {new Date(assessment.date).toLocaleDateString('pt-BR')}
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex gap-4">
                       <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Fluência</div>
                         <div className="font-black text-primary-600 text-lg flex items-center justify-center gap-1.5">
                           <Clock size={16} /> {assessment.wpm}
                         </div>
                       </div>
                       <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Matemática</div>
                         <div className="font-black text-amber-600 text-lg flex items-center justify-center gap-1.5">
                           <Calculator size={16} /> {assessment.mathScore || '-'}
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {assessment.criteria && (
                      <>
                        <ProficiencyBadge label="Ritmo" level={assessment.criteria.fluency} colorClass={getLevelColor(assessment.criteria.fluency)} />
                        <ProficiencyBadge label="Decodificação" level={assessment.criteria.decoding} colorClass={getLevelColor(assessment.criteria.decoding)} />
                        <ProficiencyBadge label="Compreensão" level={assessment.criteria.comprehension} colorClass={getLevelColor(assessment.criteria.comprehension)} />
                      </>
                    )}
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Comentários do Professor</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {assessment.notes || 'Sem observações registradas.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProficiencyBadge: React.FC<{ label: string, level: ProficiencyLevel, colorClass: string }> = ({ label, level, colorClass }) => (
  <div className={`p-3 rounded-xl border flex flex-col gap-0.5 transition-all ${colorClass}`}>
    <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">{label}</span>
    <span className="text-[10px] font-black uppercase tracking-tight truncate">{level}</span>
  </div>
);
