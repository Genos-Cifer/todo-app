import { PRIORITIES } from "../constants/priorities";

// Applies active priority/tag filters and the selected sort order to a task list.
export function sortAndFilterTasks(tasks, { filterPriorities = [], filterTags = [], sortBy = "created" } = {}) {
  let result = [...tasks];

  if (filterPriorities.length) {
    result = result.filter(task => filterPriorities.includes(task.priority));
  }
  if (filterTags.length) {
    result = result.filter(task => filterTags.every(tagId => (task.tags || []).includes(tagId)));
  }

  if (sortBy === "due") {
    result.sort((a, b) => ((a.due || "9999") < (b.due || "9999") ? -1 : 1));
  } else if (sortBy === "priority") {
    result.sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority));
  } else {
    result.sort((a, b) => b.created - a.created);
  }

  return result;
}
