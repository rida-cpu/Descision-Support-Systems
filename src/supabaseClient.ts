import { createClient } from '@supabase/supabase-js';

// These MUST come from environment variables — never hardcode keys in source.
// Local dev: put them in a .env.local file at the project root:
//   VITE_SUPABASE_URL=https://hrgouoeelasbkshgysak.supabase.co
//   VITE_SUPABASE_ANON_KEY=sb_publishable_kYNms0jNq1Wdp073YiCpVw_n5o4EgKP
// Production (Vercel): Project Settings -> Environment Variables -> add the same two keys, then redeploy.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // This will show up loudly in the browser console instead of silently failing every auth call.
  console.error(
    'Missing Supabase env vars. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (in .env.local locally, and in Vercel project settings for production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);