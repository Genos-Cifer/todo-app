import { useEffect } from "react";

// Invokes onEscape whenever the Escape key is pressed while this is mounted.
export function useEscapeKey(onEscape) {
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);
}
