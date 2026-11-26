// Decorative canvases share a 60 fps ceiling, sleep outside the viewport/in
// background tabs, and draw only on invalidation when reduced motion is set.
export function createGraphicsLoop(element, render) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 1000 / 60;
  let frame = null;
  let last = null;
  let lastRender = null;
  let visible = true;
  let dirty = true;
  let destroyed = false;

  const schedule = () => {
    if (!destroyed && visible && !document.hidden && frame === null && (!motion.matches || dirty)) {
      frame = requestAnimationFrame(tick);
    }
  };
  const tick = (time) => {
    frame = null;
    if (destroyed || !visible || document.hidden) return;
    if (last === null || (motion.matches && dirty) || time - last >= interval - 0.5) {
      const delta = lastRender === null ? 0 : time - lastRender;
      last = last === null ? time : last + interval * Math.max(1, Math.floor((time - last + 0.5) / interval));
      lastRender = time;
      dirty = false;
      render(time, delta, motion.matches);
    }
    schedule();
  };
  const suspend = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    last = null;
    lastRender = null;
  };
  const invalidate = () => {
    dirty = true;
    schedule();
  };
  const updateVisibility = () => {
    suspend();
    invalidate();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateVisibility();
  });
  observer.observe(element);
  document.addEventListener("visibilitychange", updateVisibility);
  motion.addEventListener("change", updateVisibility);
  schedule();

  return {
    invalidate,
    destroy() {
      destroyed = true;
      suspend();
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      motion.removeEventListener("change", updateVisibility);
    },
  };
}
