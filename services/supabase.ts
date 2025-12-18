
import { createClient } from '@supabase/supabase-js';

// Assume-se que as variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão configuradas no ambiente
const supabaseUrl = (process.env as any).SUPABASE_URL || '';
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
