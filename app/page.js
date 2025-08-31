"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import SmoothScrollContainer from "./components/SmoothScrollContainer";
import HeroSection from "./components/sections/HeroSection";
import Navbar from "./components/ui/Navbar";
import ProjectSection from "./components/sections/ProjectSection";
import LoadingBar from "./components/ui/LoadingBar";
import VantaFog from "./components/background/VantaFog";
import projects from "./data/projects.json";
import useSectionProgress from "./hooks/useSectionProgress";
import useScrollProgressBetweenSections from "./hooks/useScrollProgressBetweenSections";
import ThreeScene from "./components/background/ThreeScene";
import AboutSection from "./components/sections/AboutSection";
import useMediaQuery from "./hooks/useMediaQuery"; // ✅ default import
import TargetCursor from "./blocks/Animations/TargetCursor";

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isLocoReady, setIsLocoReady] = useState(false);

  // NEW: state to control mobile overlay open/close
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);

  // Lifted selected project state so background can react to it
  const [selectedProject, setSelectedProject] = useState(projects[0] || null);

  const locoScrollRef = useRef(null);
  const threeSceneRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);

  const lastXRef = useRef(translateX);

  const loading = !(assetsLoaded && animationFinished);
  const startAnimation = !loading;

  const sectionIds = ["hero", "about", "projects"];
  const { activeSection, sectionProgress } = useSectionProgress(sectionIds);

  const heroToProjectsProgress = useScrollProgressBetweenSections("hero", "projects");

  const onVantaLoaded = useCallback(() => {
    console.log("VantaFog loaded");
  }, []);

  const handleAssetsLoaded = useCallback(() => {
  console.log("handleAssetsLoaded -> assetsLoaded = true");
  setAssetsLoaded(true);
  }, []);

  // Stable onScroll callback (stable identity)
  // We no longer track raw scrollY; progress is driven by GSAP ScrollTrigger hooks.

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setShowLoading(true);
    }
  }, [loading]);

  // Lock scroll when loading or when mobile overlay is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (loading || isMobileOverlayOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
    // prevent accidental horizontal scroll on small viewports
    document.body.style.overflowX = isMobile ? "hidden" : "auto";

    return () => {
      document.body.style.overflowY = "auto";
      document.body.style.overflowX = "auto";
    };
  }, [loading, isMobileOverlayOpen, isMobile]);

  const parallaxSpeed = 0.2;
  // Use hero->projects progress to drive parallax when scrollY is no longer tracked
  // Guard access to window for SSR (window is undefined on server)
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const parallaxOffset = -(heroToProjectsProgress || 0) * viewportHeight * parallaxSpeed;

  // Compute a sidebar width percent that matches the previous behaviour
  // but keep the element itself full-width. We'll remap the original
  // gradient stop percentages into the right-hand region that represents
  // the simulated sidebar width so the visual remains identical.
  const sidebarWidthPercent = isMobile
    ? Math.min(100, 80 + (heroToProjectsProgress || 0) * 50)
    : Math.max(0, 100 - (heroToProjectsProgress || 0) * 50);

  const originalStops = [19, 46, 57, 73];
  const leftBoundary = 100 - sidebarWidthPercent; // where the simulated sidebar begins
  const mappedStops = originalStops.map((s) => leftBoundary + (s / 100) * sidebarWidthPercent);
  const sidebarGradient = `linear-gradient(90deg, rgba(0, 0, 0, 0) ${mappedStops[0]}%, rgba(0, 0, 0, 0.59) ${mappedStops[1]}%, rgba(0, 0, 0, 0.84) ${mappedStops[2]}%, rgba(0, 0, 0, 1) ${mappedStops[3]}%)`;

  // Mobile black-flash sequencing: we briefly show a full black overlay
  // while swapping which gradient is active so the transition goes fully
  // black in the middle, then reveals the reversed gradient.
  const [blackFlash, setBlackFlash] = useState(false);
  const [activeSide, setActiveSide] = useState(!isMobile || !isMobileOverlayOpen ? "right" : "left");

  useEffect(() => {
    if (!isMobile) return; // only apply sequencing on mobile

    // Start with a quick black flash, then switch the active side, then
    // fade the black overlay out.
    setBlackFlash(true);
    const switchDelay = 500; // ms (time black is visible before swapping)
    const t1 = setTimeout(() => {
      setActiveSide(isMobileOverlayOpen ? "left" : "right");
    }, switchDelay);
    const t2 = setTimeout(() => setBlackFlash(false), switchDelay + 50);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isMobileOverlayOpen, isMobile]);

  // Mobile: use a CSS transition for percentage-based shifts
  useEffect(() => {
    const el = threeSceneRef.current;
    if (!el) return;

    if (isMobile) {
  // Default: half-obscured by the right edge. When overlay opens, bring into view.
  // Use positive translateX percentage relative to its own width since the element is anchored right:0
  const targetX = isMobileOverlayOpen ? "-40%" : "60%";
  el.style.transition = "transform 2s cubic-bezier(.22,.9,.35,1)";
  el.style.transform = `translateY(-50%) translateX(${targetX})`;
    }

    return () => {
      if (!el) return;
      // clear inline transition to avoid interfering with other code
      el.style.transition = "";
    };
  }, [isMobile, isMobileOverlayOpen]);

  // Desktop: use GSAP quickTo to smoothly animate the element's x to match Lenis easing
  useEffect(() => {
    const el = threeSceneRef.current;
    if (!el || isMobile) return;

    // Ensure the element is vertically centered like the previous RAF loop
    // (previous code applied `translateY(-50%)` each frame). Use GSAP to set
    // yPercent so GSAP-managed transforms preserve vertical centering.
    try {
      gsap.set(el, { yPercent: -50 });
    } catch (e) {}

    // quickTo returns a function that smoothly tweens the 'x' property
    const smoothX = gsap.quickTo(el, "x", { duration: 0.85, ease: "power3.out" });

    // apply the current target once
    const width = el.offsetWidth / 1.5;
    const progress = Math.min(Math.max(heroToProjectsProgress || 0, 0), 1);
    const targetX = progress * width;
    smoothX(targetX);

    return () => {
      // kill any tweens on this element's transform x property to clean up
      try {
        gsap.killTweensOf(el, { x: true });
      } catch (e) {}
    };
  }, [isMobile, heroToProjectsProgress]);


  return (
    <>
      
      {!isMobile && (
        <TargetCursor spinDuration={10} hideDefaultCursor={true} />
      )}

  {/* Debug overlay removed for production/testing */}
      {showLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            opacity: loading ? 1 : 0,
            visibility: loading ? "visible" : "hidden",
            transition: "opacity 1s ease, visibility 1s ease",
            zIndex: 9999,
          }}
        >
          <LoadingBar onComplete={() => { console.log('LoadingBar onComplete -> animationFinished = true'); setAnimationFinished(true); }} />
        </div>
      )}

      <SmoothScrollContainer
        locoScrollRef={locoScrollRef}
        onReady={() => setIsLocoReady(true)}
        isMobile={isMobile}
        overflowX={isMobile ? "hidden" : "auto"}
      >
        {/* Pass isMobileOverlayOpen + setter to Navbar */}
        <Navbar
          locoScrollRef={locoScrollRef}
          isLocoReady={isLocoReady}
          isMobile={isMobile}
          isMobileOverlayOpen={isMobileOverlayOpen}
          setIsMobileOverlayOpen={setIsMobileOverlayOpen}
        />

        <VantaFog
          style={{ zIndex: 0 }}
          onLoaded={onVantaLoaded}
          parallaxY={parallaxOffset}
          parallaxSpeed={parallaxSpeed}
          activeSection={activeSection}
          progress={sectionProgress[activeSection] || 0}
          project={selectedProject}
          isMobile={isMobile}
        />

        {/* Sidebar Gradient: two layered gradients that crossfade on mobile */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {/* Right-side gradient (desktop / mobile when right is active) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: sidebarGradient,
              transition: "opacity 1s cubic-bezier(.22,.9,.35,1)",
              opacity: !isMobile ? 1 : blackFlash ? 0 : activeSide === "right" ? 1 : 0,
            }}
          />

          {/* Left-side gradient (mobile when left is active) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) ${sidebarWidthPercent}%, rgba(0,0,0,0) 100%)`,
              transition: "opacity 1s cubic-bezier(.22,.9,.35,1)",
              opacity: !isMobile ? 0 : blackFlash ? 0 : activeSide === "left" ? 1 : 0,
            }}
          />

          {/* Black flash overlay that sits above the gradients during the swap */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: "black",
              transition: "opacity 300ms linear",
              opacity: blackFlash ? 1 : 0,
              zIndex: 2,
            }}
          />
        </div>

        {/* Invisible scroll section just to satisfy Locomotive Scroll */}
        <div data-scroll-section style={{ display: "contents", overflow: "auto" }}>
          <div
            ref={threeSceneRef}
            style={{
              position: "fixed",
              top: "50%",
              right: "0",
              width: isMobile ? "70vh" : "40vw",
              
              height: isMobile ? "70vh" : "40vw",
              background: "transparent",
              borderRadius: "20px",
              pointerEvents: "auto",
              opacity: startAnimation ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              zIndex: 2,
              
              willChange: "transform",
            }}
          >
            <ThreeScene
              onLoaded={handleAssetsLoaded}
              progress={heroToProjectsProgress}
              activeSection={activeSection}
              isMobile={isMobile}
            />
          </div>
        </div>

        <main style={{ zIndex: 3, position: "relative" }}>
          <section id="hero" data-scroll-section data-section-id="hero">
            <HeroSection
              onAssetsLoaded={handleAssetsLoaded}
              startAnimation={startAnimation}
              isMobile={isMobile}
              progress={heroToProjectsProgress}
            />
          </section>
          <section id="about" data-scroll-section data-section-id="about">
            <AboutSection
              isMobile={isMobile}
              progress={useScrollProgressBetweenSections("hero", "about")}
              
            />
          </section>
          <section id="projects" data-scroll-section data-section-id="projects">
            <ProjectSection
              progress={useScrollProgressBetweenSections("about", "projects")}
              isMobile={isMobile}
              isMobileOverlayOpen={isMobileOverlayOpen}
              setIsMobileOverlayOpen={setIsMobileOverlayOpen}
              selectedProject={selectedProject}
              onProjectChange={(p) => setSelectedProject(p)}
            />
            
          </section>
        </main>
      </SmoothScrollContainer>
    </>
  );
}
