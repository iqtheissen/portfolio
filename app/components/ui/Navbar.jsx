"use client";

import React, { useState, useEffect } from "react";
import NavbarLink from "./NavbarLink";
import MenuToggleButton from "./MenuToggleButton";
import useSectionProgress from "../../hooks/useSectionProgress";

export default function Navbar({
  locoScrollRef,
  isLocoReady,
  isMobile,
  isMobileOverlayOpen,
  setIsMobileOverlayOpen,
}) {
  const [borderWidth, setBorderWidth] = useState("0%");
  const [transitionSpeed, setTransitionSpeed] = useState("1.5s");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const normalTransitionSpeed = "0.7s";

  // Use ScrollTrigger-driven section progress to determine whether we're
  // at the top of the page. When the active section is 'hero' and its
  // progress is 0, we consider the page to be at the top and show the
  // full-width underline; otherwise hide it.
  const { activeSection, sectionProgress } = useSectionProgress(["hero", "about", "projects"]);

  useEffect(() => {
    const heroProgress = sectionProgress && sectionProgress.hero != null ? sectionProgress.hero : 0;
  // Only consider "at top" when the hero section is active and its
  // progress is near zero. Do NOT treat a null activeSection as at-top
  // because null can represent intermediate states.
  const isTop = heroProgress < 0.55;
    setAtTop(isTop);
    setBorderWidth(isTop ? "100%" : "0%");
  }, [activeSection, sectionProgress]);

  // Keep the initial slow transition, then switch to normal speed after a
  // short delay (matches previous behaviour).
  useEffect(() => {
    const transitionTimeout = setTimeout(() => {
      setTransitionSpeed(normalTransitionSpeed);
    }, 1000);
    return () => clearTimeout(transitionTimeout);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Combined toggle button handler:
  const handleToggleClick = () => {
    if (isMobileOverlayOpen) {
      setIsMobileOverlayOpen(false);
      document.body.style.overflow = "auto"; // Unlock scroll when overlay closes
    } else {
      toggleMenu();
    }
  };

  // The toggle button is considered "open" if either menu OR overlay is open
  const isToggleOpen = isMenuOpen || isMobileOverlayOpen;

  return (
    <>
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : "flex-end",
          padding: isMobile ? "0 1.5rem" : `2rem ${atTop ? "18rem" : "12.5rem"}`,
          transition: `padding ${transitionSpeed} ease`,
          zIndex: 1000,
        }}
      >
        
        {isMobile && (
          <div style={{ position: "relative", zIndex: 2, fontWeight: "bold", fontSize: "1.2rem" }}></div>
        )}

        {!isMobile && (
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: atTop ? "2rem" : "0", transition: `gap ${transitionSpeed} ease` }}>
            <NavbarLink
              href="#about"
              originalText="about"
              decryptedText="ABOUT"
              locoScrollRef={locoScrollRef}
            />

            <span aria-hidden style={{ color: "rgba(255,255,255,0.65)", opacity: atTop ? 0 : 0.65, transform: atTop ? "translateY(-4px) scale(0.9)" : "translateY(0) scale(1)", transition: `opacity 300ms ease, transform 300ms ease` }}>/</span>

            <NavbarLink
              href="#projects"
              originalText="projects"
              decryptedText="PROJECTS"
              locoScrollRef={locoScrollRef}
            />

            <span aria-hidden style={{ color: "rgba(255,255,255,0.65)", opacity: atTop ? 0 : 0.65, transform: atTop ? "translateY(-4px) scale(0.9)" : "translateY(0) scale(1)", transition: `opacity 300ms ease, transform 300ms ease` }}>/</span>

            <NavbarLink
              href="#contact"
              originalText="contact"
              decryptedText="CONTACT"
              locoScrollRef={locoScrollRef}
            />
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <div style={{ position: "relative", zIndex: 2 }}>
            <MenuToggleButton isOpen={isToggleOpen} onClick={handleToggleClick} />
          </div>
        )}

        {/* Desktop underline */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              width: borderWidth,
              background: "linear-gradient(to right, white, transparent)",
              pointerEvents: "none",
              transition: `width ${transitionSpeed} cubic-bezier(0.4, 0, 0.2, 1)`,
              zIndex: 3,
            }}
          />
        )}
      </nav>

      {/* Mobile Fullscreen Menu Overlay */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            color: "white",
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? "auto" : "none",
            transition: "opacity 0.5s ease",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <NavbarLink
            href="#about"
            originalText="about"
            decryptedText="ABOUT"
            locoScrollRef={locoScrollRef}
            onClick={toggleMenu}
          />
          <NavbarLink
            href="#projects"
            originalText="projects"
            decryptedText="PROJECTS"
            locoScrollRef={locoScrollRef}
            onClick={toggleMenu}
          />
          <NavbarLink
            href="#contact"
            originalText="contact"
            decryptedText="CONTACT"
            locoScrollRef={locoScrollRef}
            onClick={toggleMenu}
          />
        </div>
      )}
    </>
  );
}
