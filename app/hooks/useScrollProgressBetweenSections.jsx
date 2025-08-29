import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Returns a reactive progress [0..1] representing the scroll progress between two
// elements identified by data-section-id. Uses GSAP's ScrollTrigger for accurate
// frame-by-frame progress and works with Lenis when scrollerProxy is configured.
export default function useScrollProgressBetweenSections(fromId, toId) {
  const [progress, setProgress] = useState(0);
  const lastProgressRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fromEl = document.querySelector(`[data-section-id="${fromId}"]`);
    const toEl = document.querySelector(`[data-section-id="${toId}"]`);

    if (!fromEl || !toEl) return;

    // Create a ScrollTrigger that uses `fromEl` as trigger and `toEl` as endTrigger
    const st = ScrollTrigger.create({
      trigger: fromEl,
      start: "top top",
      endTrigger: toEl,
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        // Only update the ref here; the React state will be updated on a throttled
        // timer to avoid flooding React with setState calls.
        const rounded = Math.round(self.progress * 100) / 100;
        lastProgressRef.current = rounded;
      },
    });

    // Ensure initial value (also rounded) without causing redundant renders
    const initial = st ? Math.round(st.progress * 100) / 100 : 0;
    lastProgressRef.current = initial;
    // Ensure React state reflects the initial value (deferred to next tick).
    setTimeout(() => {
      setProgress((prev) => (prev === initial ? prev : initial));
    }, 0);

    // Start a throttled timer to push ref updates to React state at ~60ms.
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const v = lastProgressRef.current != null ? lastProgressRef.current : 0;
        setProgress((prev) => (prev === v ? prev : v));
      }, 30);
    }

    return () => {
      try {
        st.kill();
      } catch (e) {}
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fromId, toId]);

  return progress;
}
