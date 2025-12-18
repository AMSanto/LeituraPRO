
import { createClient } from '@supabase/supabase-js';

// URL fornecida pelo usuário
const supabaseUrl = 'https://lpsammrbvhbohahtvzql.supabase.co';

// Chave Anon fornecida pelo usuário (usando fallback para env var por segurança)
const supabaseAnonKey = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_KEY || 
  'sb_publishable_oLb780MkQCP3is4I23TP3Q_AmKCQqzw';

// Inicialização do cliente
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.error("ERRO: Configuração do Supabase incompleta.");
}
