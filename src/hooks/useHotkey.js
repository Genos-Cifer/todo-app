import { useEffect } from "react";

// Fires `handler` on Cmd/Ctrl + <key>, anywhere in the app — including while a
// text field has focus, which is what you want for a command palette.
export function useCommandHotkey(key, handler) {
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (!e.metaKey && !e.ctrlKey) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, handler]);
}
