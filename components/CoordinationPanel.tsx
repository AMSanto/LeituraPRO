
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
  // Agrupar métricas por professor
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
            Painel da Coordenação
          </h1>
          <p className="text-gray-500 font-medium">Monitoramento global de desempenho docente e discente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Professores" value={teacherStats.length} icon={User} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Turmas Ativas" value={classes.length} icon={School} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Alunos Totais" value={students.length} icon={Users} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Avaliações Realizadas" value={assessments.length} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Avaliações por Professor */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" />
            Volume de Avaliações / Docente
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="assessmentsCount" name="Avaliações" radius={[8, 8, 0, 0]}>
                  {teacherStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista Detalhada */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Performance Docente</h3>
          </div>
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <tr>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Professor(a)</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Alunos</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Média WPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teacherStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="font-black text-gray-900 text-sm">{stat.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{stat.classesCount} Turmas vinculadas</div>
                    </td>
                    <td className="p-6 text-center font-bold text-gray-600">{stat.studentsCount}</td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-black text-primary-600">{stat.avgWpm}</span>
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary-500 h-full" style={{ width: `${Math.min(stat.avgWpm, 100)}%` }}></div>
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
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
    <div className={`${bg} ${color} p-4 rounded-2xl shadow-inner`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);
