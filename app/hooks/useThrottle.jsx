import { useRef, useCallback } from "react";

export default function useThrottle(callback, delay) {
  const lastCall = useRef(0);

  // Return a stable, memoized function so callers can rely on a stable identity
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
}