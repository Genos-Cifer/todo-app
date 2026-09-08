// Full-text search over the task list.
//
// Runs client-side rather than via Postgres full-text search: TodoApp already
// holds every one of the user's tasks in memory, so filtering locally is
// instant, needs no debounce/network round-trip, and keeps working offline.
// Postgres FTS would only start paying off at a task count this app won't hit.

// Everything a task should be findable by, flattened into one lowercase string.
function buildHaystack(task, tagNameById) {
  const parts = [task.title || "", task.notes || "", task.priority || ""];
  (task.subtasks || []).forEach(subtask => parts.push(subtask.text || ""));
  (task.tags || []).forEach(tagId => {
    const name = tagNameById.get(tagId);
    if (name) parts.push(name);
  });
  return parts.join(" \n ").toLowerCase();
}

// Multi-word queries are AND-ed, so "report friday" matches a task only if
// both terms appear somewhere in its text.
export function searchTasks(tasks, query, tags = []) {
  const terms = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return tasks;

  const tagNameById = new Map(tags.map(tag => [tag.id, tag.name.toLowerCase()]));
  return tasks.filter(task => {
    const haystack = buildHaystack(task, tagNameById);
    return terms.every(term => haystack.includes(term));
  });
}

// Which field actually matched, so search results can show *why* a task
// surfaced when the hit wasn't in the title.
export function describeMatch(task, query, tags = []) {
  const terms = (query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return null;

  const title = (task.title || "").toLowerCase();
  if (terms.every(term => title.includes(term))) return null;

  if (task.notes && terms.some(term => task.notes.toLowerCase().includes(term))) return "in notes";

  const matchedSubtask = (task.subtasks || []).find(subtask =>
    terms.some(term => (subtask.text || "").toLowerCase().includes(term))
  );
  if (matchedSubtask) return `in subtask "${matchedSubtask.text}"`;

  const tagNameById = new Map(tags.map(tag => [tag.id, tag.name.toLowerCase()]));
  const matchedTag = (task.tags || [])
    .map(tagId => tagNameById.get(tagId))
    .find(name => name && terms.some(term => name.includes(term)));
  if (matchedTag) return `tagged ${matchedTag}`;

  return null;
}
