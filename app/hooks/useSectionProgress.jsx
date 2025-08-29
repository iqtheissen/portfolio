import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Returns active section id and a map of per-section progress (0..1).
// Uses ScrollTrigger so it works with Lenis (via scrollerProxy) and handles
// resize/refresh automatically.
export default function useSectionProgress(sectionIds = [], /* kept for compatibility */ _scrollY = 0) {
  const [activeSection, setActiveSection] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});

  // Derive a stable string key from sectionIds so consumers can pass a new
  // array every render without forcing effect re-runs.
  const idsKey = Array.isArray(sectionIds) ? sectionIds.join("|") : String(sectionIds);

  useEffect(() => {
    const sections = (Array.isArray(sectionIds) ? sectionIds : String(sectionIds).split('|'))
      .map((id) => {
        const el = document.querySelector(`[data-section-id="${id}"]`);
        return { id, el };
      })
      .filter(({ el }) => el);

    if (sections.length === 0) return;

    // initialize progress map only when it meaningfully differs from prev
    const initial = {};
    sections.forEach((s) => (initial[s.id] = 0));
    setSectionProgress((prev) => {
      const prevKeys = Object.keys(prev);
      const initKeys = Object.keys(initial);
      if (prevKeys.length === initKeys.length && prevKeys.every((k) => initKeys.includes(k))) return prev;
      return initial;
    });

    // We'll collect per-section rounded progress into this ref on every
    // ScrollTrigger frame, and then flush to React state at a throttled rate
    // to avoid too-frequent setState calls.
    const lastProgressRef = { ...initial };
    let intervalId = null;
    const triggers = [];

  sections.forEach((curr, idx) => {
      const next = sections[idx + 1];

      const st = ScrollTrigger.create({
        trigger: curr.el,
        start: "top top",
        endTrigger: next ? next.el : curr.el,
        end: next ? "top top" : "bottom top",
        scrub: true,
        onUpdate(self) {
          const p = Math.min(Math.max(self.progress || 0, 0), 1);
          const rounded = Math.round(p * 100) / 100;
          lastProgressRef[curr.id] = rounded;
        },
        onEnter() {
          setActiveSection(curr.id);
        },
        onEnterBack() {
          setActiveSection(curr.id);
        },
        onLeave() {
          // when leaving forward, active becomes next if present
          if (next) setActiveSection(next.id);
          else setActiveSection(null);
        },
        onLeaveBack() {
          // when leaving backward, active becomes previous if present
          const prev = sections[idx - 1];
          if (prev) setActiveSection(prev.id);
          else setActiveSection(null);
        },
      });

      triggers.push(st);
    });

  // Ensure ScrollTrigger measurements are correct
  ScrollTrigger.refresh();

    // Flush interval: update React state from lastProgressRef at ~60ms
    intervalId = setInterval(() => {
      setSectionProgress((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(lastProgressRef).forEach((k) => {
          const v = lastProgressRef[k] != null ? lastProgressRef[k] : 0;
          if (prev[k] !== v) {
            next[k] = v;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 30);

    return () => {
      try {
        if (typeof _cleanupScroll === "function") _cleanupScroll();
      } catch (e) {}
      triggers.forEach((t) => {
        try {
          t.kill();
        } catch (e) {}
      });
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [idsKey]);

  return { activeSection, sectionProgress };
}
