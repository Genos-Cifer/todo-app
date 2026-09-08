// Priority levels, ordered from most to least urgent.
export const PRIORITIES = ["Very High", "High", "Medium", "Low"];

// Priority colors are CSS custom properties (formulas in src/index.css, hues
// nudged per palette in src/styles/themes.css) rather than literal hex, so
// they follow the active theme instead of staying frozen at dark-mode values.
// They're passed straight into inline styles, which resolve var() fine.
export const PRIORITY_COLORS = {
  "Very High": "var(--color-priority-very-high)",
  High: "var(--color-priority-high)",
  Medium: "var(--color-priority-medium)",
  Low: "var(--color-priority-low)",
};

// Faint background tint used behind priority badges.
export const PRIORITY_BACKGROUNDS = {
  "Very High": "var(--color-priority-very-high-bg)",
  High: "var(--color-priority-high-bg)",
  Medium: "var(--color-priority-medium-bg)",
  Low: "var(--color-priority-low-bg)",
};

// Selectable color swatches for tags. These are stored per-tag in the database
// as literal hex; light-mode readability is handled at render time by the
// `.tag-chip` rules in src/styles/shared.css rather than by changing them here.
export const TAG_COLOR_PALETTE = [
  "#a78bfa", "#34d399", "#f87171", "#60a5fa", "#f472b6",
  "#4ade80", "#fbbf24", "#fb923c", "#38bdf8", "#c084fc",
];

// Applies a percentage alpha to any color — including a `var(--…)` reference,
// which the old `hexColor + "80"` string trick could not handle.
export function withAlpha(color, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}
