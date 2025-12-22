
import React, { useMemo, useState } from 'react';
import { Student, Assessment, SchoolClass } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock, Search, School } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  assessments: Assessment[];
  classes: SchoolClass[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students, assessments, classes }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');

  const filteredStudents = useMemo(() => {
    const searchLower = searchStudent.toLowerCase();
    return students.filter(student => {
      const matchesClass = selectedClassId === 'all' || student.classId === selectedClassId;
      const matchesSearch = student.name.toLowerCase().includes(searchLower);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClassId, searchStudent]);

  const filteredAssessments = useMemo(() => {
    const studentIds = new Set(filteredStudents.map(s => s.id));
    return assessments.filter(a => studentIds.has(a.studentId));
  }, [assessments, filteredStudents]);

  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const totalAssessments = filteredAssessments.length;
    if (totalAssessments === 0) return { totalStudents, totalAssessments, avgWPM: 0, avgAccuracy: 0 };
    const totals = filteredAssessments.reduce((acc, curr) => ({
      wpm: acc.wpm + curr.wpm,
      accuracy: acc.accuracy + curr.accuracy
    }), { wpm: 0, accuracy: 0 });
    return { 
      totalStudents, 
      totalAssessments, 
      avgWPM: Math.round(totals.wpm / totalAssessments), 
      avgAccuracy: Math.round(totals.accuracy / totalAssessments) 
    };
  }, [filteredStudents.length, filteredAssessments]);

  const chartData = useMemo(() => {
    const grouped = filteredAssessments.reduce((acc, curr) => {
      const dateKey = curr.date;
      if (!acc[dateKey]) acc[dateKey] = { wpmSum: 0, count: 0 };
      acc[dateKey].wpmSum += curr.wpm;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { wpmSum: number, count: number }>);

    return Object.keys(grouped).sort().map(dateKey => {
      const item = grouped[dateKey];
      const [year, month, day] = dateKey.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return {
        date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        avgWPM: Math.round(item.wpmSum / item.count)
      };
    });
  }, [filteredAssessments]);

  const levelData = useMemo(() => {
    const counts = filteredStudents.reduce((acc, curr) => {
      acc[curr.readingLevel] = (acc[curr.readingLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [filteredStudents]);

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Visão pedagógica em tempo real</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-3 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
            >
              <option value="all">Todas as Turmas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-3 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Alunos" value={stats.totalStudents} icon={Users} color="text-blue-500" bg="bg-blue-50" />
        <StatCard title="Média WPM" value={stats.avgWPM} icon={Clock} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard title="Precisão" value={`${stats.avgAccuracy}%`} icon={CheckCircle} color="text-indigo-500" bg="bg-indigo-50" />
        <StatCard title="Avaliados" value={stats.totalAssessments} icon={TrendingUp} color="text-purple-500" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[350px]">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Curva de Fluência (WPM Médio)</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="avgWPM" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[350px]">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Distribuição de Nível</h3>
          <div className="h-64 md:h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: any; color: string; bg: string }> = ({ 
  title, value, icon: Icon, color, bg 
}) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">{title}</p>
      <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-none">{value}</h3>
    </div>
    <div className={`p-3 rounded-2xl ${bg} ${color} shadow-sm`}>
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>
  </div>
);
