// Formats an ISO date string (e.g. task due date) as "Mar 5".
export function formatShortDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Formats a timestamp (e.g. task completion time) as "Mar 5, 2026".
export function formatLongDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
