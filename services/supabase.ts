
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpsammrbvhbohahtvzql.supabase.co';
const supabaseAnonKey = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_KEY || 
  'sb_publishable_oLb780MkQCP3is4I23TP3Q_AmKCQqzw';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null;

if (!supabase) {
  console.error("Supabase não inicializado. Verifique as chaves de ambiente.");
}
