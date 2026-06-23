import { createClient } from '@supabase/supabase-js';

// Real fallback parameters taake build engine url string reject na kare
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ldummtizumvmakulekhv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sbr3KuJB_OyTqhRY82d7cw_Bj5vmFMg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);