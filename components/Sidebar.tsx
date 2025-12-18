
import React from 'react';
import { LayoutDashboard, Users, PenTool, School, GraduationCap, Sparkles, Award, LifeBuoy } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500', active: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: ViewState.CLASSES, label: 'Turmas', icon: School, color: 'text-emerald-500', active: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: ViewState.STUDENTS, label: 'Alunos', icon: Users, color: 'text-purple-500', active: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: ViewState.REMEDIAL, label: 'Reforço', icon: LifeBuoy, color: 'text-amber-500', active: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: ViewState.COMPETENCIES, label: 'Critérios', icon: Award, color: 'text-rose-500', active: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: ViewState.GENERATOR, label: 'Gerador IA', icon: Sparkles, color: 'text-cyan-500', active: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { id: ViewState.ASSESSMENT, label: 'Avaliar', icon: PenTool, color: 'text-indigo-500', active: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:flex flex-col shadow-sm z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-mesh p-2.5 rounded-xl shadow-lg">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight">LeituraPro</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AntMarques</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 border-transparent ${
                isActive 
                  ? `${item.active} font-black shadow-sm` 
                  : `text-gray-500 hover:bg-gray-50 hover:text-gray-900`
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
              <span className="text-sm uppercase tracking-wider font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-5 text-white shadow-xl">
          <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">Suporte IA</p>
          <p className="text-xs leading-relaxed font-medium">Análise em tempo real habilitada.</p>
        </div>
      </div>
    </aside>
  );
};
