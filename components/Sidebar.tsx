import React from 'react';
import { LayoutDashboard, Users, PenTool, BookMarked, School, GraduationCap } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.CLASSES, label: 'Minhas Turmas', icon: School },
    { id: ViewState.STUDENTS, label: 'Meus Alunos', icon: Users },
    { id: ViewState.ASSESSMENT, label: 'Avaliação IA', icon: PenTool },
    { id: ViewState.GENERATOR, label: 'Materiais IA', icon: BookMarked },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen hidden md:flex flex-col shadow-sm z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/30">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">EduPro AI</h1>
          <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest mt-1">Multi-Matérias</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-200' 
                  : 'text-gray-500 hover:bg-violet-50 hover:text-violet-600'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400">✨</span>
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Insights</p>
          </div>
          <p className="text-[11px] leading-relaxed opacity-70 font-medium italic">
            "A matemática não é apenas sobre números, é sobre a lógica da vida."
          </p>
        </div>
      </div>
    </aside>
  );
};