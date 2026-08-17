import { supabase } from "../lib/supabaseClient";

function mapProfileFromDb(row) {
  if (!row) return null;
  return { id: row.id, username: row.username, avatarUrl: row.avatar_url };
}

// Returns null if the user hasn't finished onboarding (no profile row yet).
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return mapProfileFromDb(data);
}

export async function createProfile({ id, username, avatarUrl }) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id, username, avatar_url: avatarUrl || null })
    .select()
    .single();
  if (error) throw error;
  return mapProfileFromDb(data);
}
