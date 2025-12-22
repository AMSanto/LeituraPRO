
import React from 'react';
import { LayoutDashboard, Users, PenTool, School, GraduationCap, Sparkles, Award, LifeBuoy, ShieldCheck, X } from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  userRole?: UserRole;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, userRole, isMobile, onCloseMobile }) => {
  const isCoord = userRole === UserRole.COORDINATION;

  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: 'text-primary-500', active: 'bg-primary-50 text-primary-700 border-primary-100', hidden: false },
    { id: ViewState.COORDINATION_PANEL, label: 'Coordenação', icon: ShieldCheck, color: 'text-gray-900', active: 'bg-gray-900 text-white border-gray-900', hidden: !isCoord },
    { id: ViewState.CLASSES, label: 'Turmas', icon: School, color: 'text-primary-600', active: 'bg-primary-50 text-primary-700 border-primary-100', hidden: false },
    { id: ViewState.STUDENTS, label: 'Alunos', icon: Users, color: 'text-primary-500', active: 'bg-primary-50 text-primary-700 border-primary-100', hidden: false },
    { id: ViewState.REMEDIAL, label: 'Reforço', icon: LifeBuoy, color: 'text-amber-500', active: 'bg-amber-50 text-amber-700 border-amber-200', hidden: false },
    { id: ViewState.COMPETENCIES, label: 'Critérios', icon: Award, color: 'text-blue-600', active: 'bg-blue-50 text-blue-700 border-blue-200', hidden: false },
    { id: ViewState.GENERATOR, label: 'Gerador IA', icon: Sparkles, color: 'text-primary-400', active: 'bg-primary-50 text-primary-700 border-primary-100', hidden: false },
    { id: ViewState.ASSESSMENT, label: 'Avaliar', icon: PenTool, color: 'text-primary-600', active: 'bg-primary-50 text-primary-700 border-primary-100', hidden: false },
  ];

  return (
    <aside className={`${isMobile ? 'fixed inset-y-0 left-0 w-72 z-50 shadow-2xl' : 'w-64 hidden md:flex'} bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm transition-transform duration-300`}>
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-brand-gradient p-2.5 rounded-2xl shadow-lg shadow-primary-500/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight">LeituraPro</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Plataforma</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onCloseMobile} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.filter(item => !item.hidden).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 border-transparent ${
                isActive 
                  ? `${item.active} font-black shadow-sm` 
                  : `text-gray-500 hover:bg-gray-50 hover:text-gray-900`
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? (item.id === ViewState.COORDINATION_PANEL ? 'text-white' : 'text-primary-600') : 'text-gray-400'}`} />
              <span className="text-sm uppercase tracking-wider font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <div className={`rounded-3xl p-5 shadow-xl transition-all ${isCoord ? 'bg-gray-900 text-white' : 'bg-brand-gradient text-white shadow-primary-500/20'}`}>
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Acesso Atual</p>
          <p className="text-xs leading-relaxed font-black uppercase tracking-widest">
            {isCoord ? 'Perfil Coordenação' : 'Perfil Professor'}
          </p>
        </div>
      </div>
    </aside>
  );
};
