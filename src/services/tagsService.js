import { supabase } from "../lib/supabaseClient";

function mapTagFromDb(row) {
  return { id: row.id, name: row.name, color: row.color };
}

export async function fetchTags(userId) {
  const { data, error } = await supabase.from("tags").select("*").eq("user_id", userId).order("created_at");
  if (error) throw error;
  return data.map(mapTagFromDb);
}

export async function createTag(userId, { name, color }) {
  const { data, error } = await supabase.from("tags").insert({ user_id: userId, name, color }).select().single();
  if (error) throw error;
  return mapTagFromDb(data);
}

export async function updateTag(userId, { id, name, color }) {
  const { data, error } = await supabase
    .from("tags")
    .update({ name, color })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapTagFromDb(data);
}

export async function deleteTag(userId, tagId) {
  const { error } = await supabase.from("tags").delete().eq("id", tagId).eq("user_id", userId);
  if (error) throw error;
}
