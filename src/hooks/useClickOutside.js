import { useEffect } from "react";

// Calls onOutsideClick when a pointer event lands outside `ref`'s element.
// Used to close dropdown-style panels (e.g. the profile menu) on outside click.
export function useClickOutside(ref, onOutsideClick) {
  useEffect(() => {
    const handlePointerDown = e => {
      if (ref.current && !ref.current.contains(e.target)) onOutsideClick();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [ref, onOutsideClick]);
}
