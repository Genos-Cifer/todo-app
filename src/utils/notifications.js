import { NOTIFICATION_SETTINGS_KEY, NOTIFICATION_STATE_KEY } from "../constants/storage";
import { formatShortDate } from "./date";

export const DEFAULT_DIGEST_HOUR = 10;

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission() {
  return isNotificationSupported() ? Notification.permission : "unsupported";
}

export async function requestPermission() {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showNotification(title, options) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    // `tag` lets a repeat notification replace the previous one instead of
    // stacking up a pile of duplicates in the OS tray.
    new Notification(title, { icon: "/favicon.svg", badge: "/favicon.svg", ...options });
  } catch {
    // Some browsers throw when constructing notifications outside a service
    // worker (notably Android Chrome). Nothing useful to do but skip it.
  }
}

// Local-time YYYY-MM-DD, matching the format tasks store their due date in.
export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── persisted settings ──────────────────────────────────────────────────────

export function loadSettings() {
  const fallback = { enabled: false, digestHour: DEFAULT_DIGEST_HOUR };
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode, quota) — settings just won't persist.
  }
}

function loadState() {
  const fallback = { lastDigestDate: null, overdueNotified: {} };
  try {
    const raw = localStorage.getItem(NOTIFICATION_STATE_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
  } catch {
    // Same as above — worst case we re-notify once after a reload.
  }
}

// ── the actual checks ───────────────────────────────────────────────────────

function summarize(titles, limit = 3) {
  const shown = titles.slice(0, limit).join("\n• ");
  const extra = titles.length - limit;
  return `• ${shown}${extra > 0 ? `\n…and ${extra} more` : ""}`;
}

// Called once a minute while the app is open. Fires (a) the daily digest once
// per day at/after the chosen hour, and (b) a one-off alert the first time a
// task's due date passes. All bookkeeping is in localStorage, so reloading the
// page doesn't replay notifications you've already seen.
export function runDueChecks(tasks, { digestHour = DEFAULT_DIGEST_HOUR } = {}) {
  if (getPermission() !== "granted") return;

  const state = loadState();
  const today = toDateKey();
  const currentHour = new Date().getHours();
  let stateChanged = false;

  // Backlog tasks are parked on purpose, so they never trigger alerts —
  // matching how the Metrics view already treats "pending".
  const pending = tasks.filter(task => !task.done && !task.backlog);
  const dueToday = pending.filter(task => task.due === today);
  const overdue = pending.filter(task => task.due && task.due < today);

  // 1. Daily digest.
  if (currentHour >= digestHour && state.lastDigestDate !== today) {
    if (dueToday.length > 0) {
      const overdueSuffix = overdue.length > 0 ? ` (plus ${overdue.length} overdue)` : "";
      showNotification(
        `📋 ${dueToday.length} task${dueToday.length === 1 ? "" : "s"} due today${overdueSuffix}`,
        { body: summarize(dueToday.map(task => task.title)), tag: "taskflow-digest" }
      );
    } else if (overdue.length > 0) {
      showNotification(
        `⚠ ${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}`,
        { body: `Nothing due today, but these are past due:\n${summarize(overdue.map(task => task.title))}`, tag: "taskflow-digest" }
      );
    }
    // Recorded even when there was nothing worth sending, so we don't
    // re-evaluate this every minute for the rest of the day.
    state.lastDigestDate = today;
    // The digest already accounted for everything currently overdue (listed
    // when nothing else is due, counted otherwise), so don't immediately
    // follow it with a second notification about the same tasks. The per-task
    // alert below is thereby reserved for tasks that cross into overdue
    // *between* digests — at midnight, or while you're working.
    overdue.forEach(task => { state.overdueNotified[task.id] = task.due; });
    stateChanged = true;
  }

  // 2. Tasks whose due date has just passed. Keyed by task id *and* due date,
  //    so rescheduling a task lets it alert again on the new date.
  const newlyOverdue = overdue.filter(task => state.overdueNotified[task.id] !== task.due);
  if (newlyOverdue.length === 1) {
    const task = newlyOverdue[0];
    showNotification("⚠ Task overdue", {
      body: `"${task.title}" was due ${formatShortDate(task.due)}.`,
      tag: `taskflow-overdue-${task.id}`,
    });
  } else if (newlyOverdue.length > 1) {
    showNotification(`⚠ ${newlyOverdue.length} tasks are now overdue`, {
      body: summarize(newlyOverdue.map(task => task.title)),
      tag: "taskflow-overdue-batch",
    });
  }
  if (newlyOverdue.length > 0) {
    newlyOverdue.forEach(task => { state.overdueNotified[task.id] = task.due; });
    stateChanged = true;
  }

  // Drop bookkeeping for tasks that no longer exist, so this can't grow forever.
  const liveIds = new Set(tasks.map(task => task.id));
  for (const id of Object.keys(state.overdueNotified)) {
    if (!liveIds.has(id)) {
      delete state.overdueNotified[id];
      stateChanged = true;
    }
  }

  if (stateChanged) saveState(state);
}

// Lets the settings panel prove notifications actually work end-to-end.
export function showTestNotification() {
  showNotification("🔔 TaskFlow notifications are on", {
    body: "This is what a due-task reminder will look like.",
    tag: "taskflow-test",
  });
}
