"use client";

import { useEffect, useRef } from "react";
import "locomotive-scroll/src/locomotive-scroll.scss";


export default function SmoothScrollContainer({ children, locoScrollRef, onReady, isMobile}) {
  const scrollRef = useRef(null);
  

  useEffect(() => {
    if (!scrollRef.current) return;

    let LocomotiveScroll;

    async function initScroll() {
  LocomotiveScroll = (await import("locomotive-scroll")).default;

  locoScrollRef.current = new LocomotiveScroll({
    el: scrollRef.current,
    smooth: true,

    lerp: 0.06, // 0.01 (slow and smooth) to 1 (instant) — lower = smoother
    multiplier: 1,
    smartphone: { smooth: false}, // Adjust for mobile
    tablet: { smooth: true },
  });

  if (onReady) onReady(); // Notify parent
}

    initScroll();

    const onResize = () => locoScrollRef.current?.update();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (locoScrollRef.current) {
        locoScrollRef.current.destroy();
        locoScrollRef.current = null;
      }
    };
  }, [locoScrollRef]);

  return (
    <div data-scroll-container ref={scrollRef} style={{ overflow: "hidden" }}>
      {children}
    </div>
  );
}
