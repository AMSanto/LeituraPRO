
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase não está configurado. Verifique as variáveis de ambiente.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Confirme seu e-mail para completar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-4 overflow-hidden relative">
      {/* Círculos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in border border-white/40">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-4 rounded-2xl shadow-xl shadow-primary-500/40 mb-4 transition-transform hover:scale-110 duration-300">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">LeituraPro AntMarques</h1>
          <p className="text-gray-600 font-medium">Gestão Pedagógica com Inteligência</p>
        </div>

        {!supabase && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p><strong>Configuração Pendente:</strong> Chave da API do Supabase não encontrada. O login não funcionará até que seja configurado.</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="email"
                required
                disabled={!supabase}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
                placeholder="professor@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                disabled={!supabase}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-fade-in flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Criar Conta Grátis' : 'Entrar no Painel'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 font-medium">
            {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem acesso?'}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={!supabase}
              className="ml-2 text-primary-700 font-bold hover:underline underline-offset-4 decoration-2 disabled:opacity-50"
            >
              {isSignUp ? (
                <span className="flex items-center gap-1 inline-flex">
                  <LogIn className="w-4 h-4" /> Entrar
                </span>
              ) : (
                <span className="flex items-center gap-1 inline-flex">
                  <UserPlus className="w-4 h-4" /> Solicitar Acesso
                </span>
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
