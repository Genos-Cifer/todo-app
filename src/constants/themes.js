// Theming has two independent axes: a color PALETTE (hue/saturation) and a
// MODE (light/dark lightness ramp). Every palette works in every mode, so
// these 4 × 3 give more combinations than the old flat list of 5 themes.
//
// A palette's actual colors live in styles/themes.css as `[data-theme="<id>"]`
// knob blocks — deliberately no hex values here, so the picker's swatches
// derive from the same source as the app itself.
export const PALETTES = [
  { id: "midnight", label: "Midnight" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "sunset", label: "Sunset" },
];

export const MODES = [
  { id: "light", label: "Light", icon: "☀" },
  { id: "dark", label: "Dark", icon: "☾" },
  { id: "system", label: "Auto", icon: "◐" },
];

export const DEFAULT_PALETTE = "midnight";
// New visitors follow their OS preference rather than being forced to dark.
export const DEFAULT_MODE = "system";

export function isValidPalette(id) {
  return PALETTES.some(palette => palette.id === id);
}

export function isValidMode(id) {
  return MODES.some(mode => mode.id === id);
}

// Before palette and mode were split, one key held values like "ocean" or
// "daylight". Map those onto the new pair so existing users keep their look.
export function migrateLegacyTheme(storedValue) {
  if (storedValue === "daylight") return { palette: DEFAULT_PALETTE, mode: "light" };
  if (isValidPalette(storedValue)) return { palette: storedValue, mode: "dark" };
  return null;
}
