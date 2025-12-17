import React, { useMemo, useState } from 'react';
import { Student, Assessment, SchoolClass } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock, Filter, Search, School } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  assessments: Assessment[];
  classes: SchoolClass[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students, assessments, classes }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // 1. Filtrar Estudantes
  // Otimização: Apenas recalcula se alunos, filtro de turma ou busca mudarem.
  const filteredStudents = useMemo(() => {
    const searchLower = searchStudent.toLowerCase();
    return students.filter(student => {
      const matchesClass = selectedClassId === 'all' || student.classId === selectedClassId;
      const matchesSearch = student.name.toLowerCase().includes(searchLower);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClassId, searchStudent]);

  // 2. Filtrar Avaliações (apenas dos estudantes filtrados)
  // Otimização: Cria um Set para lookup O(1) dos IDs dos alunos.
  const filteredAssessments = useMemo(() => {
    const studentIds = new Set(filteredStudents.map(s => s.id));
    return assessments.filter(a => studentIds.has(a.studentId));
  }, [assessments, filteredStudents]);

  // Calculate stats based on FILTERED data
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const totalAssessments = filteredAssessments.length;
    
    if (totalAssessments === 0) {
      return { totalStudents, totalAssessments, avgWPM: 0, avgAccuracy: 0 };
    }

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

  // Chart Data
  // Otimização: Agrupa por data crua (ISO) primeiro, ordena as chaves (strings ISO ordenam corretamente),
  // e só depois formata para exibição. Evita parsing repetitivo de datas dentro do sort.
  const chartData = useMemo(() => {
    const grouped = filteredAssessments.reduce((acc, curr) => {
      const dateKey = curr.date; // Esperado YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = { wpmSum: 0, count: 0 };
      }
      acc[dateKey].wpmSum += curr.wpm;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { wpmSum: number, count: number }>);

    return Object.keys(grouped)
      .sort() // Ordenação lexicográfica de YYYY-MM-DD funciona cronologicamente
      .map(dateKey => {
        const item = grouped[dateKey];
        // Conversão segura de data para exibição
        const [year, month, day] = dateKey.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        return {
          date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          avgWPM: Math.round(item.wpmSum / item.count)
        };
      });
  }, [filteredAssessments]);

  // Level Distribution
  const levelData = useMemo(() => {
    const counts = filteredStudents.reduce((acc, curr) => {
      acc[curr.readingLevel] = (acc[curr.readingLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [filteredStudents]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do desempenho de leitura</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Class Filter */}
          <div className="relative">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">Todas as Turmas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Student Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Alunos Filtrados" 
          value={stats.totalStudents.toString()} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Média Palavras/Min" 
          value={stats.avgWPM.toString()} 
          subtitle="Filtrado"
          icon={Clock} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Precisão Média" 
          value={`${stats.avgAccuracy}%`} 
          icon={CheckCircle} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Avaliações" 
          value={stats.totalAssessments.toString()} 
          icon={TrendingUp} 
          color="bg-purple-500" 
        />
      </div>

      {filteredStudents.length === 0 ? (
         <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
           <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
           <p className="text-gray-500">Nenhum aluno encontrado com os filtros atuais.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Evolução de Fluência</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgWPM" 
                    name="Palavras por Minuto" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Níveis de Leitura</h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; subtitle?: string; icon: any; color: string }> = ({ 
  title, value, subtitle, icon: Icon, color 
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subtitle && <p className="text-xs text-green-600 mt-1 font-medium">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);