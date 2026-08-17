import { supabase } from "../lib/supabaseClient";

function mapTaskFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    due: row.due || "",
    notes: row.notes || "",
    tags: row.tag_ids || [],
    backlog: row.backlog,
    done: row.done,
    doneAt: row.done_at ? new Date(row.done_at).getTime() : undefined,
    subtasks: row.subtasks || [],
    created: new Date(row.created_at).getTime(),
  };
}

function mapTaskToDb(task, userId) {
  return {
    user_id: userId,
    title: task.title,
    priority: task.priority,
    due: task.due || null,
    notes: task.notes || null,
    tag_ids: task.tags || [],
    backlog: !!task.backlog,
    done: !!task.done,
    done_at: task.doneAt ? new Date(task.doneAt).toISOString() : null,
    subtasks: task.subtasks || [],
  };
}

export async function fetchTasks(userId) {
  const { data, error } = await supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapTaskFromDb);
}

export async function createTask(userId, task) {
  const { data, error } = await supabase.from("tasks").insert(mapTaskToDb(task, userId)).select().single();
  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function updateTask(userId, task) {
  const { data, error } = await supabase
    .from("tasks")
    .update(mapTaskToDb(task, userId))
    .eq("id", task.id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function deleteTask(userId, taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId);
  if (error) throw error;
}

export async function deleteCompletedTasks(userId) {
  const { error } = await supabase.from("tasks").delete().eq("user_id", userId).eq("done", true);
  if (error) throw error;
}
