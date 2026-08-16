import { useCallback, useRef, useState } from "react";

const TOAST_DURATION_MS = 2000;

// Simple auto-dismissing toast message. Calling showToast again resets the timer.
export function useToast() {
  const [toastMessage, setToastMessage] = useState(null);
  const timerRef = useRef();

  const showToast = useCallback(message => {
    clearTimeout(timerRef.current);
    setToastMessage(message);
    timerRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }, []);

  return { toastMessage, showToast };
}
