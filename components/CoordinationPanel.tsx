
import React, { useMemo } from 'react';
import { Assessment, Student, SchoolClass } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck, Users, School, FileText, TrendingUp, User } from 'lucide-react';

interface CoordinationPanelProps {
  assessments: Assessment[];
  students: Student[];
  classes: SchoolClass[];
}

export const CoordinationPanel: React.FC<CoordinationPanelProps> = ({ assessments, students, classes }) => {
  const teacherStats = useMemo(() => {
    const teachers = Array.from(new Set(classes.map(c => c.teacher)));
    return teachers.map(teacherName => {
      const teacherClasses = classes.filter(c => c.teacher === teacherName);
      const classIds = teacherClasses.map(c => c.id);
      const teacherStudents = students.filter(s => classIds.includes(s.classId));
      const studentIds = teacherStudents.map(s => s.id);
      const teacherAssessments = assessments.filter(a => studentIds.includes(a.studentId));
      const avgWpm = teacherAssessments.length > 0 
        ? Math.round(teacherAssessments.reduce((acc, curr) => acc + curr.wpm, 0) / teacherAssessments.length)
        : 0;
      return {
        name: teacherName,
        classesCount: teacherClasses.length,
        studentsCount: teacherStudents.length,
        assessmentsCount: teacherAssessments.length,
        avgWpm: avgWpm
      };
    });
  }, [assessments, students, classes]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-primary-600" />
            Painel Coordenação
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Análise macro de performance docente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Docentes" value={teacherStats.length} icon={User} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Turmas Ativas" value={classes.length} icon={School} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Corpo Discente" value={students.length} icon={Users} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Avaliações" value={assessments.length} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary-500" />
            Engajamento por Professor
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="assessmentsCount" radius={[6, 6, 0, 0]}>
                  {teacherStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Métricas Detalhadas</h3>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar">
            <table className="w-full text-left min-w-[500px]">
              <thead className="sticky top-0 bg-white border-b border-gray-50 z-10">
                <tr>
                  <th className="p-5 md:p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Professor(a)</th>
                  <th className="p-5 md:p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Alunos</th>
                  <th className="p-5 md:p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Méd. WPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teacherStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 md:p-6">
                      <div className="font-black text-gray-900 text-sm leading-tight mb-1">{stat.name}</div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{stat.classesCount} Turmas Atribuidas</div>
                    </td>
                    <td className="p-5 md:p-6 text-center font-bold text-gray-600 text-sm">{stat.studentsCount}</td>
                    <td className="p-5 md:p-6">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-black text-primary-600 text-sm">{stat.avgWpm}</span>
                        <div className="hidden sm:block w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary-500 h-full transition-all" style={{ width: `${Math.min(stat.avgWpm, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: any; color: string; bg: string }> = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:translate-y-[-2px]">
    <div className={`${bg} ${color} p-4 rounded-2xl shadow-inner shrink-0`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate leading-none">{title}</p>
      <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">{value}</p>
    </div>
  </div>
);
