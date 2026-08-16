import { useEffect, useState } from "react";
import { DEFAULT_THEME } from "../constants/themes";
import { THEME_STORAGE_KEY } from "../constants/storage";

function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// Tracks the active theme, persists it, and reflects it onto <html data-theme="…">
// so styles/themes.css can apply the matching variable overrides.
export function useTheme() {
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures (quota, private browsing, etc.).
    }
  }, [theme]);

  return [theme, setTheme];
}
