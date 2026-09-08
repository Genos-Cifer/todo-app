import { useEffect, useState } from "react";
import {
  DEFAULT_MODE,
  DEFAULT_PALETTE,
  isValidMode,
  isValidPalette,
  migrateLegacyTheme,
} from "../constants/themes";
import { THEME_MODE_KEY, THEME_STORAGE_KEY } from "../constants/storage";

const LIGHT_QUERY = "(prefers-color-scheme: light)";
// Must outlast the 0.32s transition in index.css.
const TRANSITION_MS = 360;

function readStoredTheme() {
  try {
    const storedPalette = localStorage.getItem(THEME_STORAGE_KEY);
    const storedMode = localStorage.getItem(THEME_MODE_KEY);
    if (storedMode) {
      return {
        palette: isValidPalette(storedPalette) ? storedPalette : DEFAULT_PALETTE,
        mode: isValidMode(storedMode) ? storedMode : DEFAULT_MODE,
      };
    }
    const migrated = migrateLegacyTheme(storedPalette);
    if (migrated) return migrated;
  } catch {
    // Storage unavailable — fall through to defaults.
  }
  return { palette: DEFAULT_PALETTE, mode: DEFAULT_MODE };
}

function readSystemMode() {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

// Tracks the palette and the light/dark mode, persists both, and reflects them
// onto <html data-theme="…" data-mode="…"> for index.css / styles/themes.css.
export function useTheme() {
  const [stored, setStored] = useState(readStoredTheme);
  const [systemMode, setSystemMode] = useState(readSystemMode);

  // Follow the OS while mode is "system".
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia(LIGHT_QUERY);
    const handleChange = event => setSystemMode(event.matches ? "light" : "dark");
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const { palette, mode } = stored;
  const resolvedMode = mode === "system" ? systemMode : mode;

  useEffect(() => {
    const root = document.documentElement;
    // index.html already stamped these before first paint, so on mount they
    // match and we skip the cross-fade — it should only run on real switches.
    const isChanging = root.dataset.theme !== palette || root.dataset.mode !== resolvedMode;

    root.dataset.theme = palette;
    root.dataset.mode = resolvedMode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, palette);
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch {
      // Ignore storage failures (private mode, quota).
    }

    if (!isChanging) return;
    root.setAttribute("data-theme-switching", "");
    const timerId = setTimeout(() => root.removeAttribute("data-theme-switching"), TRANSITION_MS);
    return () => clearTimeout(timerId);
  }, [palette, mode, resolvedMode]);

  return {
    palette,
    mode,
    resolvedMode,
    setPalette: nextPalette => setStored(prev => ({ ...prev, palette: nextPalette })),
    setMode: nextMode => setStored(prev => ({ ...prev, mode: nextMode })),
  };
}
