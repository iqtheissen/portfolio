"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import NavbarLink from "./NavbarLink";
import MenuToggleButton from "./MenuToggleButton";
import IconButton from "./IconButton";
import useSectionProgress from "../../hooks/useSectionProgress";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ContactModal from "./ContactModal";

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
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const menuToggleRef = useRef(null);
  const [atTop, setAtTop] = useState(true);
  const normalTransitionSpeed = "0.7s";
  const { t, i18n } = useTranslation();

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

  // Mobile overlay ref and animations
  const overlayRef = useRef(null);
  const mobileTlRef = useRef({ intro: null, exit: null });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const originalBodyOverflow = useRef(null);

  useEffect(() => {
    if (!isMobile) return;
    const el = overlayRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.mobile-nav-item');
    const divider = el.querySelector('.mobile-nav-divider');

  // determine open state early so we don't stomp animation start/end styles
  // Nav overlay should open only when the internal menu is open. The
  // external `isMobileOverlayOpen` refers to the project overlay and
  // should not trigger the nav overlay; it only flips the toggle icon.
  const open = isMenuOpen;

    // ensure a clean slate
    if (mobileTlRef.current.intro) {
      try { mobileTlRef.current.intro.kill(); } catch (e) {}
      mobileTlRef.current.intro = null;
    }
    if (mobileTlRef.current.exit) {
      try { mobileTlRef.current.exit.kill(); } catch (e) {}
      mobileTlRef.current.exit = null;
    }

    // starting styles: only apply when opening so we don't immediately hide
    // elements during the close path (which caused instant disappearance).
  if (open) {
      if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: 'left center', opacity: 0 });
      if (items && items.length) gsap.set(items, { y: 20, opacity: 0 });
      // ensure overlay starts hidden so intro can fade it in
      if (el) gsap.set(el, { opacity: 0 });
    }

    // Intro timeline (open)
    const intro = gsap.timeline({ paused: true });
  // fade overlay in and then animate divider/items
  if (el) intro.to(el, { opacity: 1, duration: 0.45, ease: 'power3.out' }, 0);
  if (divider) intro.to(divider, { scaleX: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }, 0.05);
    if (items && items.length)
      intro.to(items, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, '-=0.25');

    // Exit timeline (close) — slightly snappier and staggered in reverse order
    const exit = gsap.timeline({ paused: true });
    // softer exit: longer duration, gentle ease, reverse stagger from end
    if (items && items.length)
      exit.to(items, { y: 20, opacity: 0, duration: 0.7, stagger: { each: 0.08, from: 'end' }, ease: 'power3.inOut' }, 0);
    if (divider) exit.to(divider, { scaleX: 0, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, '-=0.2');

    mobileTlRef.current.intro = intro;
    mobileTlRef.current.exit = exit;

  if (open) {
      // show overlay then play intro
      setOverlayVisible(true);
      try { mobileTlRef.current.exit.pause(0); } catch (e) {}
      intro.restart(true);
    } else {
      try { intro.pause(0); } catch (e) {}
  // play exit then hide overlay when finished
  // fade overlay out gradually, starting halfway through the text exit
  if (el) exit.to(el, { opacity: 0, duration: 0.9, ease: 'power3.inOut' }, 0.35);
      exit.restart(true);
      exit.eventCallback('onComplete', () => {
        setOverlayVisible(false);
      });
    }

    return () => {
      try { mobileTlRef.current.intro && mobileTlRef.current.intro.kill(); } catch (e) {}
      try { mobileTlRef.current.exit && mobileTlRef.current.exit.kill(); } catch (e) {}
      mobileTlRef.current.intro = null;
      mobileTlRef.current.exit = null;
    };
  }, [isMenuOpen, isMobile, isMobileOverlayOpen]);

  useEffect(() => {
    if (isMobile) return;
    setIsMenuOpen(false);
    setOverlayVisible(false);
  }, [isMobile]);

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
    if (isContactVisible) {
      setIsContactOpen(false);
    } else if (isMobileOverlayOpen) {
      setIsMobileOverlayOpen(false);
    } else {
      toggleMenu();
    }
  };

  const openContact = () => {
    setIsMenuOpen(false);
    setIsContactVisible(true);
    setIsContactOpen(true);
  };

  const closeContact = useCallback(() => {
    setIsContactOpen(false);
  }, []);

  const finishContactClose = useCallback(() => {
    setIsContactOpen(false);
    setIsContactVisible(false);
    if (isMobile) requestAnimationFrame(() => menuToggleRef.current?.focus({ preventScroll: true }));
  }, [isMobile]);

  // Lock body scroll (and pause lenis/loco if available) while mobile menu is open.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const open = isMenuOpen || overlayVisible || isMobileOverlayOpen || isContactVisible;

    // store original overflow the first time we open
    if (open) {
      if (originalBodyOverflow.current === null && document?.body) {
        originalBodyOverflow.current = document.body.style.overflow || '';
      }
      if (document?.body) document.body.style.overflow = 'hidden';

      // try to pause loco/lenis scrolling if available
      if (locoScrollRef?.current) {
        if (typeof locoScrollRef.current.stop === 'function') locoScrollRef.current.stop();
        else if (typeof locoScrollRef.current.pause === 'function') locoScrollRef.current.pause();
      }
    } else {
      // restore original overflow
      if (document?.body) document.body.style.overflow = originalBodyOverflow.current || '';
      originalBodyOverflow.current = null;

      // try to resume loco/lenis scrolling if available
      if (locoScrollRef?.current) {
        if (typeof locoScrollRef.current.start === 'function') locoScrollRef.current.start();
        else if (typeof locoScrollRef.current.resume === 'function') locoScrollRef.current.resume();
      }
    }

    return () => {
      // ensure we restore on unmount
      if (document?.body) document.body.style.overflow = originalBodyOverflow.current || '';
    };
  }, [isMenuOpen, overlayVisible, isMobileOverlayOpen, isContactVisible, isLocoReady, locoScrollRef]);

  // The toggle button is considered "open" if either menu OR overlay is open
  const isToggleOpen = isMenuOpen || overlayVisible || isMobileOverlayOpen || isContactVisible;
  const isNavigationVisible = isMobile && (isMenuOpen || overlayVisible);

  return (
    <>
      {/* Navbar */}
      <nav
        inert={isContactVisible && !isNavigationVisible}
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
          zIndex: isContactVisible && !isNavigationVisible ? 997 : 1000,
        }}
      >
        
        {isMobile && (
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "1rem" }}>
            <LanguageSwitcher isMobile={isMobile} />
          </div>
        )}

        {!isMobile && (
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: atTop ? "2rem" : "0", transition: `gap ${transitionSpeed} ease` }}>
            <NavbarLink
              key={`nav-about-${i18n.language}`}
              href="#about"
              originalText={t("nav.about")}
              decryptedText={t("nav.about").toUpperCase()}
              locoScrollRef={locoScrollRef}
            />

            <span aria-hidden style={{ color: "rgba(255,255,255,0.65)", opacity: atTop ? 0 : 0.65, transform: atTop ? "translateY(-4px) scale(0.9)" : "translateY(0) scale(1)", transition: `opacity 300ms ease, transform 300ms ease` }}>/</span>

            <NavbarLink
              key={`nav-projects-${i18n.language}`}
              href="#projects"
              originalText={t("nav.projects")}
              decryptedText={t("nav.projects").toUpperCase()}
              locoScrollRef={locoScrollRef}
            />

            <span aria-hidden style={{ color: "rgba(255,255,255,0.65)", opacity: atTop ? 0 : 0.65, transform: atTop ? "translateY(-4px) scale(0.9)" : "translateY(0) scale(1)", transition: `opacity 300ms ease, transform 300ms ease` }}>/</span>

            <NavbarLink
              key={`nav-contact-${i18n.language}`}
              onClick={openContact}
              aria-haspopup="dialog"
              aria-controls="contact-modal"
              originalText={t("nav.contact")}
              decryptedText={t("nav.contact").toUpperCase()}
              locoScrollRef={locoScrollRef}
            />

            <LanguageSwitcher className="cursor-target" style={{ marginLeft: atTop ? "2rem" : "1rem", transition: `margin-left ${transitionSpeed} ease` }} isMobile={isMobile} />
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <div style={{ position: "relative", zIndex: 2, visibility: isContactVisible && !isNavigationVisible ? "hidden" : "visible" }}>
            <MenuToggleButton buttonRef={menuToggleRef} isOpen={isToggleOpen} onClick={handleToggleClick} />
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
  {isMobile && (isMenuOpen || overlayVisible) && (
    <div
      ref={overlayRef}
      style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    color: "white",
  // opacity and fading is handled by GSAP timelines so React shouldn't toggle it directly
  opacity: 1,
  // keep pointer events active while overlay is visible or animating
  pointerEvents: (isMenuOpen || overlayVisible) ? "auto" : "none",
    zIndex: 999,
    display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
      
  paddingLeft: "4vw",
  paddingRight: "4vw",
  paddingTop: "6.5rem",
      }}
    >
          <button
            className="mobile-nav-item"
            onClick={(e) => {
              e.preventDefault();
              if (locoScrollRef?.current) {
                // ensure the scroller is running (in case we paused it while menu opened)
                if (typeof locoScrollRef.current.start === 'function') locoScrollRef.current.start();
                else if (typeof locoScrollRef.current.resume === 'function') locoScrollRef.current.resume();
                const lenisDuration = 1.3;
                const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
                locoScrollRef.current.scrollTo('#about', {
                  offset: 0,
                  duration: 0,
                  easing: easeOutCubic,
                });
              }
              toggleMenu();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '3.8rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              textTransform: 'uppercase',
              padding: 0,
              textAlign: 'left',
            }}
          >
            {t("nav.about").toUpperCase()}
          </button>

          <button
            className="mobile-nav-item"
            onClick={(e) => {
              e.preventDefault();
              if (locoScrollRef?.current) {
                if (typeof locoScrollRef.current.start === 'function') locoScrollRef.current.start();
                else if (typeof locoScrollRef.current.resume === 'function') locoScrollRef.current.resume();
                
                const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
                locoScrollRef.current.scrollTo('#projects', {
                  offset: 0,
                  duration: 0,
                  easing: easeOutCubic,
                });
              }
              toggleMenu();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '3.8rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              textTransform: 'uppercase',
              padding: 0,
              textAlign: 'left',
            }}
          >
            {t("nav.projects").toUpperCase()}
          </button>

          <button
            className="mobile-nav-item"
            type="button"
            onClick={openContact}
            aria-haspopup="dialog"
            aria-controls="contact-modal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '3.8rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1,
                textTransform: 'uppercase',
                padding: 0,
                textAlign: 'left',
              }}
              >
              {t("nav.contact").toUpperCase()}
              </button>
              {/* subtle gradient divider, 4vw inset on both sides via overlay padding */}
          <div
            className="mobile-nav-divider"
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(to right, white, transparent)',
              marginTop: '2.25rem',
              transformOrigin: 'left center',
            }}
          />
          {/* Social icons row below the divider (mobile) */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', marginTop: '2.25rem', alignItems: 'center' }}>
            <IconButton
              icon={<img src="/icons/linkedin.svg" alt="LinkedIn" />}
              onClick={() => window.open('https://www.linkedin.com/in/quinttheissen', '_blank', 'noopener,noreferrer')}
            />
            <IconButton
              icon={<img src="/icons/github.svg" alt="GitHub" />}
              onClick={() => window.open('https://github.com/iqtheissen', '_blank', 'noopener,noreferrer')}
            />
          </div>
        </div>
      )}
      <ContactModal
        isOpen={isContactOpen}
        isVisible={isContactVisible}
        isNavigationVisible={isNavigationVisible}
        onClose={closeContact}
        onAfterClose={finishContactClose}
        isMobile={isMobile}
      />
    </>
  );
}
