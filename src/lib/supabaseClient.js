import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. See SUPABASE_SETUP.md."
  );
}

// Only construct the real client when configured — createClient throws on a
// missing/invalid URL, and we want a friendly in-app message instead of a
// crash at import time (see components/common/ConfigError.jsx).
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
