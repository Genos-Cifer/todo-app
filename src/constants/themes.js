// Each theme's colors live in styles/themes.css as `[data-theme="<id>"]` variable
// overrides. This list only drives the picker UI — add a matching CSS block
// there when adding a theme here.
export const THEMES = [
  { id: "midnight", label: "Midnight", icon: "🌙" },
  { id: "ocean", label: "Ocean", icon: "🌊" },
  { id: "forest", label: "Forest", icon: "🌲" },
  { id: "sunset", label: "Sunset", icon: "🌅" },
  { id: "daylight", label: "Daylight", icon: "☀️" },
];

export const DEFAULT_THEME = "midnight";
