"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createGraphicsLoop } from "../../lib/graphicsLoop";
import { cropFogShader, getFogViewport } from "../../lib/fogViewport";

const colorScheme1 = {
  highlightColor: 0x1a6f83, midtoneColor: 0x145a6a, lowlightColor: 0x10604a, baseColor: 0x111111,
  blurFactor: 0.37, speed: 0.4, zoom: 0.7,
};
const colorSchemeMid = {
  highlightColor: 0x115351, midtoneColor: 0x145a6a, lowlightColor: 0x086129, baseColor: 0x111111,
  blurFactor: 0.485, speed: 0.9, zoom: 0.775,
};
const colorScheme1BrightVibrantHighlight = {
  highlightColor: 0x111111, midtoneColor: 0x145a6a, lowlightColor: 0x00c8ff, baseColor: 0x111111,
  blurFactor: 0.6, speed: 1.4, zoom: 0.85,
};
const projectColorSchemes = {
  pijnwerk: {
    highlightColor: 0x294110, midtoneColor: 0x0f330a, lowlightColor: 0x99877a, baseColor: 0x1c3319,
    blurFactor: 0.6, speed: 1.4, zoom: 0.85,
  },
  habitica: {
    highlightColor: 0x201320, midtoneColor: 0xa00ae6, lowlightColor: 0xf6e3f8, baseColor: 0x111111,
    blurFactor: 0.53, speed: 1.4, zoom: 1.86,
  },
  truthfairies: {
    highlightColor: 0x3a2735, midtoneColor: 0x574860, lowlightColor: 0x161413, baseColor: 0x311727,
    blurFactor: 1.42, speed: 0.45, zoom: 1.76,
  },
  tapper: {
    highlightColor: 0x657b81, midtoneColor: 0x6b1a1a, lowlightColor: 0x729ec0, baseColor: 0x5d6c6f,
    blurFactor: 1.41, speed: 0.55, zoom: 1.12,
  },
  phunics: {
    highlightColor: 0x1c1c1c, midtoneColor: 0x145a6a, lowlightColor: 0xaacf4a, baseColor: 0x87b8a2,
    blurFactor: 0.61, speed: 1.24, zoom: 1.35,
  },
  recoilrampage: {
    highlightColor: 0x3e2828, midtoneColor: 0xa74916, lowlightColor: 0x16150e, baseColor: 0x211c1c,
    blurFactor: 0.76, speed: 1.4, zoom: 1.13,
  },
};

const lerpColor = (a, b, t) => {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (Math.round(ar + (br - ar) * t) << 16)
    | (Math.round(ag + (bg - ag) * t) << 8)
    | Math.round(ab + (bb - ab) * t);
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

function sectionScheme(activeSection, progress = 0, project) {
  const projectScheme = project?.name
    ? projectColorSchemes[project.name.toLowerCase()] || colorScheme1BrightVibrantHighlight
    : null;
  if (activeSection === "about") return lerpScheme(colorSchemeMid, projectScheme || colorScheme1BrightVibrantHighlight, progress);
  if (activeSection === "projects") return projectScheme || lerpScheme(colorSchemeMid, colorScheme1, progress);
  return lerpScheme(colorScheme1, colorSchemeMid, progress);
}

export default function VantaFog({ onLoaded, parallaxY = 0, activeSection, progress = 0, parallaxSpeed = 0.2, project = null }) {
  const elementRef = useRef(null);
  const loopRef = useRef(null);
  const latestRef = useRef(null);
  latestRef.current = { onLoaded, parallaxSpeed, activeSection, progress, project };
  const targetRef = useRef(sectionScheme(activeSection, progress, project));
  const displayedRef = useRef(targetRef.current);
  const animationRef = useRef(null);
  const previousProjectRef = useRef(project?.name);

  useEffect(() => {
    targetRef.current = sectionScheme(activeSection, progress, project);
    if (previousProjectRef.current !== project?.name) {
      animationRef.current = { from: displayedRef.current, start: performance.now() };
      previousProjectRef.current = project?.name;
    }
    loopRef.current?.invalidate();
  }, [activeSection, progress, project]);

  useEffect(() => {
    let cancelled = false;
    let cleanup;
    import("vanta/dist/vanta.fog.min").then((VANTA) => {
      if (cancelled) return;
      const element = elementRef.current;
      element.style.height = `${Math.ceil(window.innerHeight * (1 + latestRef.current.parallaxSpeed))}px`;
      const effect = VANTA.default({
        el: element, THREE,
        // FOG declares iMouse but never samples it in its shader.
        mouseControls: false, touchControls: false, gyroControls: false,
        minHeight: 200, minWidth: 200,
        ...colorScheme1,
      });
      // Replace Vanta's unconditional RAF with a visibility-aware loop. Its
      // noise, palette, zoom and time progression remain the same.
      cancelAnimationFrame(effect.req);
      window.removeEventListener("resize", effect.resize);
      cropFogShader(effect, THREE);
      const renderer = effect.renderer;
      const color = new THREE.Color();
      const previous = {};
      let appliedScheme;
      const applyScheme = (scheme) => {
        if (scheme === appliedScheme) return;
        appliedScheme = scheme;
        for (const [key, value] of Object.entries(scheme)) {
          if (previous[key] === value) continue;
          previous[key] = value;
          effect.options[key] = value;
          if (key.endsWith("Color")) {
            color.setHex(value);
            effect.uniforms[key].value.set(color.r, color.g, color.b);
          } else {
            effect.uniforms[key].value = value;
          }
        }
      };
      let previousSize = "";
      const resize = () => {
        const height = Math.ceil(window.innerHeight * (1 + latestRef.current.parallaxSpeed));
        element.style.height = `${height}px`;
        // Keep the original page-sized noise coordinates, but shade only the
        // viewport plus the 20% that the existing parallax can reveal.
        const sections = document.querySelectorAll("[data-section-id]");
        const first = sections[0]?.getBoundingClientRect();
        const last = sections[sections.length - 1]?.getBoundingClientRect();
        const virtualHeight = Math.max(height, Math.round((first && last ? last.bottom - first.top : window.innerHeight)
          + window.innerHeight * latestRef.current.parallaxSpeed));
        effect.setSize();
        const viewport = getFogViewport(effect.width, height, virtualHeight,
          window.devicePixelRatio || 1, effect.scale);
        const size = `${effect.width}:${height}:${virtualHeight}:${viewport.renderDpr}:${effect.scale}`;
        if (size === previousSize) return;
        previousSize = size;
        renderer.setPixelRatio(viewport.renderDpr);
        renderer.setSize(effect.width, height);
        effect.uniforms.iResolution.value.set(...viewport.resolution);
        effect.uniforms.uFogCoordinateScale.value.set(...viewport.coordinateScale);
        effect.uniforms.uFogViewportOffset.value.set(...viewport.offset);
        loopRef.current?.invalidate();
      };
      resize();
      // Vanta queues one extra resize during construction. Run our crop after
      // that callback too, and make the callback cancellable on unmount.
      const initialResize = requestAnimationFrame(() => { previousSize = ""; resize(); });
      const observer = new ResizeObserver(resize);
      document.querySelectorAll("[data-section-id]").forEach(section => observer.observe(section));
      window.addEventListener("resize", resize);
      let fogTime = 0;
      const loop = createGraphicsLoop(element, (time, delta, reducedMotion) => {
        const animation = animationRef.current;
        let scheme = targetRef.current;
        if (animation && !reducedMotion) {
          const t = Math.min(1, (time - animation.start) / 2000);
          scheme = lerpScheme(animation.from, targetRef.current, t * t * (3 - 2 * t));
          if (t === 1) animationRef.current = null;
        } else {
          animationRef.current = null;
        }
        displayedRef.current = scheme;
        applyScheme(scheme);
        if (!reducedMotion) fogTime += Math.min(delta, 1000 / 12) / 1000 * scheme.speed;
        effect.uniforms.iTime.value = reducedMotion ? 0 : fogTime;
        renderer.render(effect.scene, effect.camera);
      });
      loopRef.current = loop;
      latestRef.current.onLoaded?.();
      cleanup = () => {
        loop.destroy();
        loopRef.current = null;
        cancelAnimationFrame(initialResize);
        observer.disconnect();
        window.removeEventListener("resize", resize);
        effect.destroy();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={elementRef} style={{
    position: "fixed", top: 0, left: 0, width: "100vw",
    height: `${(1 + parallaxSpeed) * 100}vh`, zIndex: -1,
    pointerEvents: "none", transform: `translateY(${parallaxY}px)`,
    willChange: "transform",
  }} />;
}
