"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function VantaFog({ onLoaded, parallaxY = 0, activeSection, progress, parallaxSpeed = 0.2, project = null }) {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const prevProjectRef = useRef(project && project.name ? project.name.toLowerCase() : null);
  const animRafRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const animFromRef = useRef(null);
  const animToRef = useRef(null);
  const [projectColourScheme, setProjectColourScheme] = useState(null);
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

  const debugScheme = {
    highlightColor: 0x111111,  // bright, vibrant cyan-blue
    midtoneColor: 0x145a6a,
    lowlightColor: 0x00c8ff,
    baseColor: 0x111111,
    blurFactor: 0.6,
    speed: 1.4,
    zoom: 0.85,
  };

  // --- Debug UI state (live-editable copy of `debugScheme`) ---
  // Colors in the UI use CSS hex strings (#rrggbb) for inputs; convert
  // from numeric 0x... to strings on init.
  const numToHex = (n) => `#${(n || 0).toString(16).padStart(6, "0")}`;
  const hexToNum = (h) => parseInt((h || "#000000").replace(/^#/, ""), 16);

  const [showDebugUI, setShowDebugUI] = useState(false);
  const [debugState, setDebugState] = useState({
    highlightColor: numToHex(debugScheme.highlightColor),
    midtoneColor: numToHex(debugScheme.midtoneColor),
    lowlightColor: numToHex(debugScheme.lowlightColor),
    baseColor: numToHex(debugScheme.baseColor),
    blurFactor: debugScheme.blurFactor,
    speed: debugScheme.speed,
    zoom: debugScheme.zoom,
  });

  // Apply edits in real-time to Vanta when available
  useEffect(() => {
    if (!vantaEffect.current || !vantaReady) return;
    try {
      vantaEffect.current.setOptions({
        highlightColor: hexToNum(debugState.highlightColor),
        midtoneColor: hexToNum(debugState.midtoneColor),
        lowlightColor: hexToNum(debugState.lowlightColor),
        baseColor: hexToNum(debugState.baseColor),
        blurFactor: Number(debugState.blurFactor),
        speed: Number(debugState.speed),
        zoom: Number(debugState.zoom),
      });
    } catch (e) {
      // ignore
    }
  }, [debugState, vantaReady]);

  const copyDebugToClipboard = async () => {
    const text = `highlightColor: 0x${hexToNum(debugState.highlightColor).toString(16).padStart(6, "0")},\nmidtoneColor: 0x${hexToNum(debugState.midtoneColor).toString(16).padStart(6, "0")},\nlowlightColor: 0x${hexToNum(debugState.lowlightColor).toString(16).padStart(6, "0")},\nbaseColor: 0x${hexToNum(debugState.baseColor).toString(16).padStart(6, "0")},\n    blurFactor: ${debugState.blurFactor},\n    speed: ${debugState.speed},\n    zoom: ${debugState.zoom},\n`;
    try {
      await navigator.clipboard.writeText(text);
      // optional visual feedback could be added
    } catch (e) {
      console.warn("Copy failed", e);
    }
  };

    // Project-specific, exaggerated colour schemes keyed by project name
    const projectColorSchemes = {
  pijnwerk: {
    highlightColor: 0x294110,
midtoneColor: 0x0f330a,
lowlightColor: 0x99877a,
baseColor: 0x1c3319,
    blurFactor: 0.6,
    speed: 1.4,
    zoom: 0.85,


  },
  habitica: {
   highlightColor: 0x201320,
midtoneColor: 0xa00ae6,
lowlightColor: 0xf6e3f8,
baseColor: 0x111111,
    blurFactor: 0.53,
    speed: 1.4,
    zoom: 1.86,


  },
  truthfairies: {
    highlightColor: 0x3a2735,
midtoneColor: 0x574860,
lowlightColor: 0x161413,
baseColor: 0x311727,
    blurFactor: 1.42,
    speed: 0.45,
    zoom: 1.76,

  },
  tapper: {
    highlightColor: 0x657b81,
midtoneColor: 0x6b1a1a,
lowlightColor: 0x729ec0,
baseColor: 0x5d6c6f,
    blurFactor: 1.41,
    speed: 0.55,
    zoom: 1.12,

  },
  phunics: {
    highlightColor: 0x1c1c1c,
midtoneColor: 0x145a6a,
lowlightColor: 0xaacf4a,
baseColor: 0x87b8a2,
    blurFactor: 0.61,
    speed: 1.24,
    zoom: 1.35,

  },
  recoilrampage: {
    highlightColor: 0x3e2828,
midtoneColor: 0xa74916,
lowlightColor: 0x16150e,
baseColor: 0x211c1c,
    blurFactor: 0.76,
    speed: 1.4,
    zoom: 1.13,

  },
};

  

  

  const lerpColor = (a, b, t) => {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const rr = Math.round(ar + (br - ar) * t),
      rg = Math.round(ag + (bg - ag) * t),
      rb = Math.round(ab + (bb - ab) * t);
    return (rr << 16) | (rg << 8) | rb;
  };

  const lerpScheme = (a, b, t) => ({
    highlightColor: lerpColor(a.highlightColor, b.highlightColor, t),
    midtoneColor: lerpColor(a.midtoneColor, b.midtoneColor, t),
    lowlightColor: lerpColor(a.lowlightColor, b.lowlightColor, t),
    baseColor: lerpColor(a.baseColor, b.baseColor, t),
    blurFactor: a.blurFactor + (b.blurFactor - a.blurFactor) * t,
    speed: a.speed + (b.speed - a.speed) * t,
    zoom: a.zoom + (b.zoom - a.zoom) * t,
  });

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

  // If a project-change animation is in progress, update its target frame
  // so the animation follows scrolling instead of being stomped later.
  // We still compute frameScheme below; when animating, hand it off to the
  // animator by updating animToRef.current and do not set state here.

    // Resolve a single project colour scheme variable once and use it below.
    const projectColourScheme = project && project.name
      ? projectColorSchemes[project.name.toLowerCase()] || colorScheme1BrightVibrantHighlight
      : null;

    let from = colorScheme1;
    let to = colorSchemeMid;

    if (activeSection === "hero") {
      from = colorScheme1;
      to = colorSchemeMid;
    } else if (activeSection === "about") {
      from = colorSchemeMid;
      // Use projectColourScheme when available, otherwise fall back to bright highlight
      to = projectColourScheme || colorScheme1BrightVibrantHighlight;
    } else if (activeSection === "projects") {
      // For the projects section, prefer a project-specific scheme when available.
      // We lerp from a neutral mid scheme into the project scheme so transitions behave consistently.
      if (projectColourScheme) {
        from = projectColourScheme;
        to = projectColourScheme;
      } else {
        to = colorScheme1;
        from = colorSchemeMid;
      }
    }

    // Compute the scheme for this frame by lerping from->to by section progress
    const frameScheme = lerpScheme(from, to, progress);

    if (isAnimatingRef.current) {
      // Update animator target and return
      animToRef.current = frameScheme;
      return;
    }

    // Not animating: write frame directly into state (this will trigger Vanta write)
    setProjectColourScheme((prev) => {
      // Avoid updating state if identical-ish to prevent needless renders
      if (!prev) return frameScheme;
      const same =
        prev.highlightColor === frameScheme.highlightColor &&
        prev.midtoneColor === frameScheme.midtoneColor &&
        prev.lowlightColor === frameScheme.lowlightColor &&
        prev.baseColor === frameScheme.baseColor &&
        Math.abs(prev.blurFactor - frameScheme.blurFactor) < 0.001 &&
        Math.abs(prev.speed - frameScheme.speed) < 0.001 &&
        Math.abs(prev.zoom - frameScheme.zoom) < 0.001;
      return same ? prev : frameScheme;
    });
  }, [vantaReady, activeSection, progress, project]);

  // Single source of truth: whenever projectColourScheme changes, write into Vanta.
  useEffect(() => {
    if (!vantaEffect.current || !vantaReady || !projectColourScheme) return;

    vantaEffect.current.setOptions({
      highlightColor: projectColourScheme.highlightColor,
      midtoneColor: projectColourScheme.midtoneColor,
      lowlightColor: projectColourScheme.lowlightColor,
      baseColor: projectColourScheme.baseColor,
      blurFactor: projectColourScheme.blurFactor,
      speed: projectColourScheme.speed,
      zoom: projectColourScheme.zoom,
    });
  }, [projectColourScheme, vantaReady]);

  // Animate the projectColourScheme from the previous project to the new one.
  const animateProjectScheme = (fromScheme, toScheme, duration = 1200) => {
    if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    isAnimatingRef.current = true;
    let start = null;
    // Initialize refs so section updates can rewrite animToRef.current
    animFromRef.current = fromScheme;
    animToRef.current = toScheme;

    const tick = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const ease = t * t * (3 - 2 * t);

      // Use the most recent target if scrolling has changed it
      const currentTo = animToRef.current || toScheme;

      const newScheme = lerpScheme(animFromRef.current || fromScheme, currentTo, ease);
      setProjectColourScheme(newScheme);

      if (t < 1) {
        animRafRef.current = requestAnimationFrame(tick);
      } else {
        // finalize to the latest target
        setProjectColourScheme(currentTo);
        isAnimatingRef.current = false;
        animRafRef.current = null;
      }
    };

    animRafRef.current = requestAnimationFrame(tick);
  };

  // Trigger animation when project changes: interpolate stored scheme -> target project scheme
  useEffect(() => {
    if (!vantaReady) return;

    const prevKey = prevProjectRef.current;
    const newKey = project && project.name ? project.name.toLowerCase() : null;
    if (prevKey === newKey) return;

    // Resolve raw project schemes
    const rawPrevScheme = prevKey ? projectColorSchemes[prevKey] || colorScheme1BrightVibrantHighlight : null;
    const rawNewScheme = newKey ? projectColorSchemes[newKey] || colorScheme1BrightVibrantHighlight : null;

    // Build section-aware from/to that mirror the section lerp logic
    let sectionFrom = colorScheme1;
    let sectionTo = colorSchemeMid;

    if (activeSection === "hero") {
      sectionFrom = colorScheme1;
      sectionTo = colorSchemeMid;
    } else if (activeSection === "about") {
      sectionFrom = colorSchemeMid;
      sectionTo = rawNewScheme || colorScheme1BrightVibrantHighlight;
    } else if (activeSection === "projects") {
      if (rawNewScheme) {
        sectionFrom = rawNewScheme;
        sectionTo = rawNewScheme;
      } else {
        sectionFrom = colorSchemeMid;
        sectionTo = colorScheme1;
      }
    }

    // Target frame takes current progress into account
    const targetFrame = lerpScheme(sectionFrom, sectionTo, progress);

    // Start from currently displayed scheme if available
    const startScheme = projectColourScheme || lerpScheme(colorScheme1, colorSchemeMid, progress);

    // start animation toward the section-aware target
    animateProjectScheme(startScheme, targetFrame, 2000);
    prevProjectRef.current = newKey;

    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
      isAnimatingRef.current = false;
    };
  }, [project, vantaReady]);
  

  

  return (
    <>
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

      {/* Debug UI overlay (additive) */}
      <div
        style={{
          position: "fixed",
          right: 12,
          bottom: 12,
          zIndex: 9999,
          pointerEvents: "auto",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <button
          onClick={() => setShowDebugUI((s) => !s)}
          style={{
            background: "rgba(0,0,0,0.6)",
            color: "white",
            border: "none",
            padding: "8px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {showDebugUI ? "Close Vanta Debug" : "Open Vanta Debug"}
        </button>

        {showDebugUI && (
          <div
            style={{
              marginTop: 8,
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: 12,
              borderRadius: 8,
              minWidth: 260,
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12 }}>Highlight</label>
              <input type="color" value={debugState.highlightColor} onChange={(e) => setDebugState((s) => ({ ...s, highlightColor: e.target.value }))} />

              <label style={{ fontSize: 12 }}>Midtone</label>
              <input type="color" value={debugState.midtoneColor} onChange={(e) => setDebugState((s) => ({ ...s, midtoneColor: e.target.value }))} />

              <label style={{ fontSize: 12 }}>Lowlight</label>
              <input type="color" value={debugState.lowlightColor} onChange={(e) => setDebugState((s) => ({ ...s, lowlightColor: e.target.value }))} />

              <label style={{ fontSize: 12 }}>Base</label>
              <input type="color" value={debugState.baseColor} onChange={(e) => setDebugState((s) => ({ ...s, baseColor: e.target.value }))} />

              <label style={{ fontSize: 12 }}>Blur</label>
              <input type="range" min="0" max="2" step="0.01" value={debugState.blurFactor} onChange={(e) => setDebugState((s) => ({ ...s, blurFactor: e.target.value }))} />

              <label style={{ fontSize: 12 }}>Speed</label>
              <input type="range" min="0" max="3" step="0.01" value={debugState.speed} onChange={(e) => setDebugState((s) => ({ ...s, speed: e.target.value }))} />

              <label style={{ fontSize: 12 }}>Zoom</label>
              <input type="range" min="0.2" max="2" step="0.01" value={debugState.zoom} onChange={(e) => setDebugState((s) => ({ ...s, zoom: e.target.value }))} />

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={copyDebugToClipboard} style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer" }}>Copy</button>
                <button onClick={() => setDebugState({
                  highlightColor: numToHex(debugScheme.highlightColor),
                  midtoneColor: numToHex(debugScheme.midtoneColor),
                  lowlightColor: numToHex(debugScheme.lowlightColor),
                  baseColor: numToHex(debugScheme.baseColor),
                  blurFactor: debugScheme.blurFactor,
                  speed: debugScheme.speed,
                  zoom: debugScheme.zoom,
                })} style={{ padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer" }}>Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
