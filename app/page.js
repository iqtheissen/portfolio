"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SmoothScrollContainer from "./components/SmoothScrollContainer";
import HeroSection from "./components/sections/HeroSection";
import Navbar from "./components/ui/Navbar";
import ProjectSection from "./components/sections/ProjectSection";
import LoadingBar from "./components/ui/LoadingBar";
import VantaFog from "./components/background/VantaFog";
import useSectionProgress from "./hooks/useSectionProgress";
import useScrollProgressBetweenSections from "./hooks/useScrollProgressBetweenSections";
import useThrottle from "./hooks/useThrottle";
import ThreeScene from "./components/background/ThreeScene";
import AboutSection from "./components/sections/AboutSection";
import useMediaQuery from "./hooks/useMediaQuery"; // ✅ default import

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isLocoReady, setIsLocoReady] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // NEW: state to control mobile overlay open/close
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);

  const locoScrollRef = useRef(null);
  const threeSceneRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);

  const lastXRef = useRef(translateX);

  const loading = !(assetsLoaded && animationFinished);
  const startAnimation = !loading;

  const sectionIds = ["hero", "about", "projects"];
  const { activeSection, sectionProgress } = useSectionProgress(sectionIds, scrollY);

  const heroToProjectsProgress = useScrollProgressBetweenSections("hero", "projects", scrollY);

  const onVantaLoaded = useCallback(() => {
    console.log("VantaFog loaded");
  }, []);

  const handleAssetsLoaded = useCallback(() => {
    setAssetsLoaded(true);
  }, []);

  const handleScroll = useThrottle((instance) => {
    setScrollY(instance.scroll.y);
  }, 20);

  useEffect(() => {
    const locoScroll = locoScrollRef.current;
    if (!locoScroll || !isLocoReady) return;

    locoScroll.on("scroll", handleScroll);

    return () => {
      locoScroll.off("scroll", handleScroll);
    };
  }, [isLocoReady, handleScroll]);

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loading, isMobileOverlayOpen]);

  const parallaxSpeed = 0.2;
  const parallaxOffset = -scrollY * parallaxSpeed;

  useEffect(() => {
  const el = threeSceneRef.current;
  if (!el) return;

  let animationFrameId;

  const update = () => {
    let targetX;

    if (isMobile) {
      // 🔁 Switch to fixed percentage shift on mobile based on overlay
      targetX = isMobileOverlayOpen ? "-40%" : "60%";
      el.style.transform = `translateY(-50%) translateX(${targetX})`;
      el.style.transition = "transform 1.5s ease-in-out";
    } else {
      // 🧮 Scroll-reactive animation on desktop
      const width = el.offsetWidth / 1.5;
      const progress = Math.min(Math.max(heroToProjectsProgress || 0, 0), 1);
      targetX = progress * width;
      lastXRef.current += (targetX - lastXRef.current) * 0.1;

      el.style.transform = `translateY(-50%) translateX(${lastXRef.current}px) translateZ(0)`;
    }

    animationFrameId = requestAnimationFrame(update);
  };

  animationFrameId = requestAnimationFrame(update);
  return () => cancelAnimationFrame(animationFrameId);
}, [isMobile, heroToProjectsProgress, isMobileOverlayOpen]);


  return (
    <>
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
          <LoadingBar onComplete={() => setAnimationFinished(true)} />
        </div>
      )}

      <SmoothScrollContainer
        locoScrollRef={locoScrollRef}
        onReady={() => setIsLocoReady(true)}
        isMobile={isMobile}
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
          isMobile={isMobile}
        />

        {/* Sidebar Gradient */}
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: isMobile
              ? `${80 + heroToProjectsProgress * 50}vw`
              : `${100 - heroToProjectsProgress * 50}vw`,
            height: "100%",
            background:
              "linear-gradient(90deg, rgba(0, 0, 0, 0) 19%, rgba(0, 0, 0, 0.59) 46%, rgba(0, 0, 0, 0.84) 57%, rgba(0, 0, 0, 1) 73%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Invisible scroll section just to satisfy Locomotive Scroll */}
        <div data-scroll-section style={{ display: "contents", overflow: "hidden" }}>
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
            />
          </section>
          <section id="about" data-scroll-section data-section-id="about">
            <AboutSection
              isMobile={isMobile}
              progress={useScrollProgressBetweenSections("hero", "about", scrollY)}
              scrollY={scrollY}
            />
          </section>
          <section id="projects" data-scroll-section data-section-id="projects">
            <ProjectSection
              progress={useScrollProgressBetweenSections("about", "projects", scrollY)}
              isMobile={isMobile}
              isMobileOverlayOpen={isMobileOverlayOpen}
        setIsMobileOverlayOpen={setIsMobileOverlayOpen}
            />
            
          </section>
        </main>
      </SmoothScrollContainer>
    </>
  );
}
