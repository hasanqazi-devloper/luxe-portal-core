import { createClient } from '@supabase/supabase-js';

// Netlify build server environment checks aur dynamic variables integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url-for-build.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Build engine crash bypass token lock
export const supabase = createClient(supabaseUrl, supabaseAnonKey);