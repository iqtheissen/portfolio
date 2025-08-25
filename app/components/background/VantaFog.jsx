"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function VantaFog({ onLoaded, parallaxY = 0, activeSection, progress, parallaxSpeed = 0.2 }) {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const [vantaReady, setVantaReady] = useState(false);
  const [fogHeight, setFogHeight] = useState("100vh");

  const colorScheme1 = {
    highlightColor: 0x1a6f83,
    midtoneColor: 0x145a6a,
    lowlightColor: 0x10604a,
    baseColor: 0x111111,
    blurFactor: 0.37,
    speed: 0.4,
    zoom: 0.7,
  };

  const colorSchemeMid = {
    highlightColor: 0x115351,  // midpoint between 0x1a6f83 and 0x111111
    midtoneColor: 0x145a6a,    // identical in both schemes, so remains the same
    lowlightColor: 0x086129,   // midpoint between 0x10604a and 0x00c8ff
    baseColor: 0x111111,       // identical
    blurFactor: (0.37 + 0.6) / 2,  // 0.485
    speed: (0.4 + 1.4) / 2,       // 0.9
    zoom: (0.7 + 0.85) / 2,       // 0.775
  };


    const colorScheme1BrightVibrantHighlight = {
    highlightColor: 0x111111,  // bright, vibrant cyan-blue
    midtoneColor: 0x145a6a,
    lowlightColor: 0x00c8ff,
    baseColor: 0x111111,
    blurFactor: 0.6,
    speed: 1.4,
    zoom: 0.85,
  };

  

  

  const lerpColor = (a, b, t) => {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const rr = Math.round(ar + (br - ar) * t),
      rg = Math.round(ag + (bg - ag) * t),
      rb = Math.round(ab + (bb - ab) * t);
    return (rr << 16) | (rg << 8) | rb;
  };

  useEffect(() => {
  const updateVantaHeight = () => {
  const sectionEls = document.querySelectorAll("[data-section-id]");
  if (sectionEls.length === 0) return;

  const firstSection = sectionEls[0];
  const lastSection = sectionEls[sectionEls.length - 1];

  const firstTop = firstSection.getBoundingClientRect().top + window.scrollY;
  const lastBottom = lastSection.getBoundingClientRect().bottom + window.scrollY;

  const totalContentHeight = lastBottom - firstTop;

  // Add some buffer or parallax effect height if needed
  const adjustedHeight = totalContentHeight + window.innerHeight * parallaxSpeed;

  setFogHeight(`${adjustedHeight}px`);
};

  updateVantaHeight();
  window.addEventListener("resize", updateVantaHeight);
  return () => window.removeEventListener("resize", updateVantaHeight);
}, []);


  // Mount and initialize Vanta
  useEffect(() => {
    let mounted = true;

    import("vanta/dist/vanta.fog.min").then((VANTA) => {
      if (mounted && !vantaEffect.current && vantaRef.current) {
        vantaEffect.current = VANTA.default({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          ...colorScheme1,
        });

        setVantaReady(true);
        if (typeof onLoaded === "function") {
          onLoaded();
          console.log("✅ VantaFog loaded");
        }
      }
    });

    return () => {
      mounted = false;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // Update fog colors on state changes
  useEffect(() => {
    if (!vantaEffect.current || !vantaReady || activeSection == null) {
      console.log("⚠️ Skipping update — reason:", {
        hasVanta: !!vantaEffect.current,
        vantaReady,
        activeSection,
      });
      return;
    }

    console.log("🎨 VantaFog update:", { activeSection, progress });

    let from = colorScheme1;
    let to = colorSchemeMid;

    if (activeSection === "hero") {
      from = colorScheme1;
      to = colorSchemeMid;
    } else if (activeSection === "about") {
      from = colorSchemeMid;
      to = colorScheme1BrightVibrantHighlight;
    } else if (activeSection === "projects") {
      from = colorScheme1BrightVibrantHighlight;
      to = colorScheme1;
    }

    vantaEffect.current.setOptions({
      highlightColor: lerpColor(from.highlightColor, to.highlightColor, progress),
      midtoneColor: lerpColor(from.midtoneColor, to.midtoneColor, progress),
      lowlightColor: lerpColor(from.lowlightColor, to.lowlightColor, progress),
      baseColor: lerpColor(from.baseColor, to.baseColor, progress),
      blurFactor: from.blurFactor + (to.blurFactor - from.blurFactor) * progress,
      speed: from.speed + (to.speed - from.speed) * progress,
      zoom: from.zoom + (to.zoom - from.zoom) * progress,
    });
  }, [vantaReady, activeSection, progress]);

  

  return (
    <div
  ref={vantaRef}
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: fogHeight,
    zIndex: -1,
    pointerEvents: "none",
    transform: `translateY(${parallaxY}px)`,
    willChange: "transform",
  }}
/>

  );
}
