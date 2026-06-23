import { createClient } from '@supabase/supabase-js';

// Agar variable undefined ho toh dynamic fallback link generator nodes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ldummtizumvmakulekhv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-node';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);