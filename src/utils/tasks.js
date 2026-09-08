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
    result.sort((a, b) => {
      const aDue = a.due || "9999-12-31";
      const bDue = b.due || "9999-12-31";
      return aDue.localeCompare(bDue);
    });
  } else if (sortBy === "priority") {
    result.sort((a, b) => {
      const aPriorityIndex = PRIORITIES.indexOf(a.priority);
      const bPriorityIndex = PRIORITIES.indexOf(b.priority);
      return (aPriorityIndex === -1 ? PRIORITIES.length : aPriorityIndex) - (bPriorityIndex === -1 ? PRIORITIES.length : bPriorityIndex);
    });
  } else {
    result.sort((a, b) => b.created - a.created);
  }

  return result;
}
