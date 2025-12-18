
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, AlertCircle, User, CheckCircle2, Inbox, ShieldCheck, School } from 'lucide-react';
import { UserRole } from '../types';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PROFESSOR);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { 
              full_name: fullName,
              role: role 
            },
            emailRedirectTo: window.location.origin,
          }
        });
        if (signUpError) throw signUpError;
        setSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh p-4">
        <div className="w-full max-w-md glass rounded-3xl p-10 shadow-2xl text-center border border-white/40 animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">Conta Criada!</h2>
          <p className="text-sm text-gray-600 mb-8 font-medium">Verifique seu e-mail ou utilize o login direto se as confirmações estiverem desativadas.</p>
          <button onClick={() => { setSuccess(false); setIsSignUp(false); }} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Entrar Agora</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-4 relative overflow-hidden">
      <div className="w-full max-w-md glass rounded-[3rem] p-10 shadow-2xl relative z-10 border border-white/40 animate-fade-in">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-gray-900 p-4 rounded-[1.5rem] shadow-xl mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">LeituraPro</h1>
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1">Gestão Pedagógica Inteligente</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" required className="w-full pl-12 pr-4 py-4 bg-white/70 rounded-2xl border-none ring-2 ring-gray-100 focus:ring-primary-500 outline-none font-bold" placeholder="Seu nome" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cargo / Função</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setRole(UserRole.PROFESSOR)}
                    className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${role === UserRole.PROFESSOR ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    <School size={14}/> Professor
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole(UserRole.COORDINATION)}
                    className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${role === UserRole.COORDINATION ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/30' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    <ShieldCheck size={14}/> Coordenação
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" required className="w-full pl-12 pr-4 py-4 bg-white/70 rounded-2xl border-none ring-2 ring-gray-100 focus:ring-primary-500 outline-none font-bold" placeholder="voce@escola.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" required className="w-full pl-12 pr-4 py-4 bg-white/70 rounded-2xl border-none ring-2 ring-gray-100 focus:ring-primary-500 outline-none font-bold" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-tight rounded-2xl flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}

          <button type="submit" disabled={loading} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isSignUp ? 'Criar Conta' : 'Entrar no Sistema'} <ArrowRight size={18}/></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black uppercase tracking-widest text-primary-700 hover:text-primary-900 transition-colors">
            {isSignUp ? 'Já tem acesso? Faça Login' : 'Novo por aqui? Solicite sua conta'}
          </button>
        </div>
      </div>
    </div>
  );
};
