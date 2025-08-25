import { useEffect, useState } from "react";

export default function useScrollProgressBetweenSections(fromId, toId, scrollY) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fromEl = document.querySelector(`[data-section-id="${fromId}"]`);
    const toEl = document.querySelector(`[data-section-id="${toId}"]`);

    if (!fromEl || !toEl) return;

    const start = fromEl.offsetTop;
    const end = toEl.offsetTop;
    const distance = end - start;

    if (scrollY <= start) {
      setProgress(0);
    } else if (scrollY >= end) {
      setProgress(1);
    } else {
      setProgress((scrollY - start) / distance);
    }
  }, [scrollY, fromId, toId]);

  return progress;
}
