"use client";

import React, { useState, useEffect } from "react";
import NavbarLink from "./NavbarLink";
import MenuToggleButton from "./MenuToggleButton";

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
  const normalTransitionSpeed = "0.4s";

  useEffect(() => {
    if (!isLocoReady || !locoScrollRef?.current) return;

    const locoScroll = locoScrollRef.current;
    const updateBorderWidth = (scrollY) => {
      setBorderWidth(scrollY === 0 ? "100%" : "0%");
    };

    updateBorderWidth(locoScroll.scroll?.y ?? 0);

    const onScroll = (args) => {
      updateBorderWidth(args.scroll?.y ?? 0);
    };

    locoScroll.on("scroll", onScroll);

    const transitionTimeout = setTimeout(() => {
      setTransitionSpeed(normalTransitionSpeed);
    }, 1000);

    return () => {
      clearTimeout(transitionTimeout);
      locoScroll.off("scroll", onScroll);
    };
  }, [isLocoReady, locoScrollRef]);

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
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : "flex-end",
          padding: isMobile ? "0 1.5rem" : "2rem 14rem",
          zIndex: 1000,
        }}
      >
        {isMobile && (
          <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>MySite</div>
        )}

        {!isMobile && (
          <div style={{ display: "flex", gap: "4rem" }}>
            <NavbarLink
              href="#about"
              originalText="about"
              decryptedText="ABOUT"
              locoScrollRef={locoScrollRef}
            />
            <NavbarLink
              href="#projects"
              originalText="projects"
              decryptedText="PROJECTS"
              locoScrollRef={locoScrollRef}
            />
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
          <MenuToggleButton isOpen={isToggleOpen} onClick={handleToggleClick} />
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
