import { useEffect, useState } from "react";

export default function useSectionProgress(sectionIds = [], scrollY = 0) {
  const [activeSection, setActiveSection] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});

  useEffect(() => {
    const sections = sectionIds
      .map((id) => {
        const el = document.querySelector(`[data-section-id="${id}"]`);
        return { id, el };
      })
      .filter(({ el }) => el);

    let newActive = null;
    const newProgressMap = {};

    for (let i = 0; i < sections.length; i++) {
      const curr = sections[i];
      const next = sections[i + 1];

      const start = curr.el.offsetTop;
      const end = next ? next.el.offsetTop : start + curr.el.offsetHeight;
      const distance = end - start;

      let progress = 0;

      if (scrollY >= start && scrollY < end) {
        newActive = curr.id;
        progress = (scrollY - start) / distance;
      } else {
        progress = scrollY >= end ? 1 : 0;
      }

      // ✅ Limit to 2 decimal places
      newProgressMap[curr.id] = Math.round(progress * 100) / 100;
    }

    // ✅ Only update activeSection if it actually changes
    setActiveSection((prev) => (prev !== newActive ? newActive : prev));

    // ✅ Check for any meaningful change before updating progress
    setSectionProgress((prev) => {
      let hasChanged = false;

      for (const key of Object.keys(newProgressMap)) {
        const newVal = newProgressMap[key];
        const oldVal = prev[key] ?? -1;

        if (newVal !== oldVal) {
          hasChanged = true;
          break;
        }
      }

      return hasChanged ? newProgressMap : prev;
    });
  }, [scrollY, sectionIds]);

  return { activeSection, sectionProgress };
}
