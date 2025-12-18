
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpsammrbvhbohahtvzql.supabase.co';
const supabaseAnonKey = 'sb_publishable_oLb780MkQCP3is4I23TP3Q_AmKCQqzw';

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
  console.error("Supabase não inicializado. Verifique as credenciais.");
}
