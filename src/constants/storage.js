// localStorage keys. Tasks/tags/profile live in Supabase (see src/services/);
// these are the bits that are genuinely per-browser rather than per-account.

// The user's chosen color palette. (Pre-v2 this held a combined
// palette+mode value such as "daylight"; useTheme migrates those.)
export const THEME_STORAGE_KEY = "todo_mgr_theme_v1";

// Light/dark/system, tracked separately from the palette.
export const THEME_MODE_KEY = "todo_mgr_theme_mode_v1";

// Notification preferences: { enabled, digestHour }.
export const NOTIFICATION_SETTINGS_KEY = "todo_mgr_notifications_v1";

// Bookkeeping so we don't re-notify: { lastDigestDate, overdueNotified }.
// Per-browser on purpose — each browser tracks what it has already shown.
export const NOTIFICATION_STATE_KEY = "todo_mgr_notify_state_v1";
