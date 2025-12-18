
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, AlertCircle, User, CheckCircle2, RefreshCw, ChevronLeft, Inbox, ShieldCheck } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
            data: { full_name: fullName },
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
      let msg = err.message;
      if (msg.includes("Invalid login")) msg = "E-mail ou senha incorretos.";
      if (msg.includes("Email not confirmed")) {
        msg = "O Supabase está exigindo confirmação por e-mail, mas o envio pode falhar no plano gratuito.";
      }
      setError(msg || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setSuccess(false);
    setIsSignUp(false);
    setError(null);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh p-4">
        <div className="w-full max-w-md glass rounded-3xl p-10 shadow-2xl text-center border border-white/40 animate-fade-in">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Conta Criada!</h2>
          
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-8 text-left">
            <h4 className="text-amber-800 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <Inbox className="w-4 h-4" /> Importante sobre o acesso
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              Se você não receber o e-mail de confirmação, é necessário entrar no painel do Supabase e desativar a opção <strong>"Confirm Email"</strong> em <i>Authentication > Providers > Email</i>.
            </p>
          </div>

          <button 
            onClick={backToLogin}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98]"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-4 relative overflow-hidden">
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl relative z-10 border border-white/40 animate-fade-in">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-4 rounded-2xl shadow-xl mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">LeituraPro</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Gestão Pedagógica Inteligente</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="animate-fade-in">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                placeholder="professor@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex flex-col gap-2 animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {error.includes("Email not confirmed") && (
                <p className="text-[10px] opacity-80 border-t pt-2 mt-1">
                  Dica: Desative a confirmação de e-mail no painel do Supabase para logar imediatamente.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                {isSignUp ? 'Criar Conta' : 'Acessar Painel'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-primary-700 font-black text-sm flex items-center justify-center gap-2 mx-auto hover:text-primary-800 transition-colors"
          >
            {isSignUp ? (
              <><LogIn className="w-4 h-4" /> Já tenho conta. Fazer Login</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Sou novo. Criar conta</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
