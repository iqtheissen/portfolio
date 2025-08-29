"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


export default function SmoothScrollContainer({ children, locoScrollRef, onReady, isMobile, overflowX = 'hidden'}) {
  const scrollRef = useRef(null);
  

  useEffect(() => {
      if (!scrollRef.current) return;

      let lenisInstance = null;
      let rafId = null;

      async function initLenis() {
        const { default: Lenis } = await import("@studio-freight/lenis");

        // Use an ease-out cubic easing for natural smoothing; adjust `duration` to taste.
        lenisInstance = new Lenis({
            duration: 0.55,
            easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
            smooth: !isMobile,
            direction: "vertical",
          });

        // expose the instance on the provided ref (keeps API the same from parent)
        locoScrollRef.current = lenisInstance;

        // Wire Lenis to GSAP ScrollTrigger so ScrollTrigger reads Lenis' virtual scroll
        try {
          ScrollTrigger.scrollerProxy(document.documentElement, {
            scrollTop(value) {
              if (arguments.length) {
                // programmatic scroll from GSAP -> Lenis
                lenisInstance.scrollTo(value);
                return;
              }
              return (lenisInstance.scroll && typeof lenisInstance.scroll.y === "number")
                ? lenisInstance.scroll.y
                : window.scrollY;
            },
            getBoundingClientRect() {
              return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: document.documentElement.style.transform ? "transform" : "fixed",
          });

          // Update ScrollTrigger on every Lenis scroll
          if (typeof lenisInstance.on === "function") {
            lenisInstance.on("scroll", () => {
              ScrollTrigger.update();
            });
          }

          // Ensure ScrollTrigger knows about initial layout
          ScrollTrigger.refresh();
        } catch (e) {
          // Silently ignore if ScrollTrigger isn't available or errors
          // eslint-disable-next-line no-console
          console.warn("ScrollTrigger setup skipped:", e);
        }

        if (onReady) onReady(); // notify parent the scroller is ready

        // RAF loop to drive Lenis
        const loop = (time) => {
          lenisInstance.raf(time);
          rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
      }

      initLenis();

      // best-effort resize hook: if the lib exposes update/resize, call it
      const onResize = () => {
        if (locoScrollRef.current && typeof locoScrollRef.current.update === "function") {
          locoScrollRef.current.update();
        }
      };

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        if (rafId) cancelAnimationFrame(rafId);
        if (locoScrollRef.current) {
          if (typeof locoScrollRef.current.destroy === "function") locoScrollRef.current.destroy();
          locoScrollRef.current = null;
        }
      };
    }, [locoScrollRef, isMobile]);

  return (
    <div data-scroll-container ref={scrollRef} style={{ overflowX }}>
      {children}
    </div>
  );
}
