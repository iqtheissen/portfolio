"use client";

import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);
import CyberButton from "../ui/CyberButton";
import IconButton from "../ui/IconButton";
import DrawText from "../ui/DrawText";

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function HeroSection({ startAnimation, isMobile, progress = 0 }) {
  const { t } = useTranslation();
  const ROTATING_WORDS_TRANSLATED = t('hero.rotatingWords', { returnObjects: true });
  const heroRef = useRef(null);
  const hiRef = useRef(null);
  const nameRef = useRef(null);
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const rotatingRef = useRef(null);
  const socialRef = useRef(null);

  const [lineHeight, setLineHeight] = useState("0%");
  const [dividerHeight, setDividerHeight] = useState("15%");
  // no direct scroll listener here — progress is injected from parent (GSAP ScrollTrigger)

  // Keep track of which word is active and the drawing progress (0 to 1)
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawProgress, setDrawProgress] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const animateCycle = async () => {
      let index = 0;

      while (!cancelled) {
        setDrawProgress(0); // undraw current word
        await wait(1800);

        index = (index + 1) % ROTATING_WORDS_TRANSLATED.length;
        setActiveIndex(index);

        // Draw new word
        setDrawProgress(1);
        await wait(2300);
      }
    };

    animateCycle();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // progress is 0..1 between hero and projects; map to visual properties
    const p = Math.min(Math.max(progress || 0, 0), 1);

    const newLineHeight = p <= 0.3 ? "100%" : "0%";

    const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
    const minHeightPx = viewportH * 0.15;
    const maxHeightPx = viewportH;
    const newHeightPx = minHeightPx + p * (maxHeightPx - minHeightPx);
    const newDividerHeight = `${newHeightPx}px`;

    setLineHeight((prev) => (prev === newLineHeight ? prev : newLineHeight));
    setDividerHeight((prev) => (prev === newDividerHeight ? prev : newDividerHeight));
  }, [progress, isMobile]);

  useEffect(() => {
  if (typeof window === "undefined") return;

    let ctx = null;

    const buildTimeline = () => {
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        const nameSpans = nameRef.current ? nameRef.current.querySelectorAll("span") : [];
        const rotatingItems = rotatingRef.current ? Array.from(rotatingRef.current.children) : [];

  const vh = window.innerHeight || 800;
  const vw = window.innerWidth || 1200;
  // Use a single uniform vertical parallax for all text elements (viewport-scaled)
  // Reduce parallax on mobile to keep motion subtle and performant.
  const yUniform = Math.round(vh * (isMobile ? 0.18 : 0.36));

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        // Make horizontal translation and blur even snappier and sequential (top -> bottom).
        // Keep vertical parallax uniform (yUniform). Increase timeline spacing so horizontal animations trigger with more scroll distance.
        const quickDur = 0.09; // even snappier
        const t0 = 0;
        const step = 0.06; // larger gap between starts

        // Horizontal + blur timeline (snappy). Vertical parallax is handled below so it remains continuous.
        tl.to(hiRef.current, { x: -20, opacity: 0,  ease: "power1.out", duration: quickDur }, t0);
        tl.to(nameSpans, { x: -30, opacity: 0,  stagger: 0.05, ease: "power1.out", duration: quickDur * 3 }, t0 + step);
        tl.to(titleLine1Ref.current, { x: -40, opacity: 0,  ease: "power1.out", duration: quickDur * 3 }, t0 + step * 1.5);
        tl.to(titleLine2Ref.current, { x: -20, opacity: 0,  ease: "power1.out", duration: quickDur * 3 }, t0 + step * 2);

        if (rotatingItems.length) {
          // Reduce horizontal travel on small screens so the effect remains visible but not excessive
          const rotateX = isMobile ? -vw / 6 : -vw / 2.5;
          tl.to(rotatingItems, { x: rotateX, ease: "sine.in", duration: quickDur * 8 }, t0);
        }

        // Persistent vertical parallax: uniform y movement for all text elements so they always scroll down with the user.
        const vScrollConfig = {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        };

        // hi line
        gsap.to(hiRef.current, { y: yUniform, ease: "none", scrollTrigger: vScrollConfig });

        // name spans (NodeList)
        if (nameSpans && nameSpans.length) {
          gsap.to(nameSpans, { y: yUniform, ease: "none", scrollTrigger: vScrollConfig });
        }

        // title lines
        gsap.to(titleLine1Ref.current, { y: yUniform, ease: "none", scrollTrigger: vScrollConfig });
        gsap.to(titleLine2Ref.current, { y: yUniform, ease: "none", scrollTrigger: vScrollConfig });

        // rotating items
        if (rotatingItems.length) {
          gsap.to(rotatingItems, { y: yUniform, ease: "none", stagger: 0, scrollTrigger: vScrollConfig });
        }

      }, heroRef);
    };

    // initial build
    buildTimeline();

    const handleResize = () => {
      buildTimeline();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, [isMobile]);

  // Make the social icons fixed on the viewport and hide/show them with a binary trigger
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!socialRef.current || !heroRef.current) return;
    if (isMobile) return; // keep mobile simple

    const el = socialRef.current;

    // Ensure starting state
    gsap.set(el, { opacity: 1, y: 0 });

    // Hide when hero bottom crosses the top of the viewport. Reverse when scrolling back above.
    const tween = gsap.to(el, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      paused: true,
    });

    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "bottom top",
      onEnter: () => tween.play(),
      onLeaveBack: () => tween.reverse(),
      // Also handle immediate re-entry from below
      onLeave: () => {},
      onEnterBack: () => {},
    });

    return () => {
      tween.kill();
      st && st.kill();
    };
  }, [isMobile]);

  return (
    <section
      ref={heroRef}
      style={{
        zIndex: 3,
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "visible",
      }}
    >
      <div
        className="sticky-icon-boundary"
        style={{
          position: "absolute",
          top: "6rem",
          height: "calc(100% - 6rem)",
          width: "100%",
        }}
      />

      <div
        style={{
          color: "white",
          padding: isMobile ? "4vw" : "8vw",
          width: isMobile ? "90vw" : "50vw",
          display: isMobile ? "flex" : "block",
          flexDirection: isMobile ? "column" : undefined,
          alignItems: "flex-start",
          top: isMobile ? "55vh" : "15vh",
          position: "relative",
          transform: isMobile ? "translateY(-50%)" : undefined,
        }}
        data-scroll
        data-scroll-direction="vertical"
        data-scroll-speed="-3"
      >
        <div ref={hiRef} style={{ fontSize: isMobile ? "0.9rem" : "1.1rem", color: "#b0b0b0", fontWeight: 300 }}>
          {t('hero.hi')}
        </div>

        <div
          style={{
            fontSize: isMobile ? "1.4rem" : "2rem",
            fontWeight: 500,
            marginBottom: isMobile ? "0.3rem" : "0.8rem",
            display: "flex",
            gap: isMobile ? "0.3rem" : "0.5rem",
          }}
          ref={nameRef}
        >
          <span style={{ color: "white" }}>{t('hero.firstName')}</span>
          <span style={{ color: "#b0b0b0" }}>{t('hero.lastName')}</span>
        </div>

        <div
          
          style={{
            fontSize: isMobile ? "3.8rem" : "6.5rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            WebkitTextStroke: isMobile ? "none" : "0.5px white",
            textTransform: "uppercase",
          }}
        >
          <div ref={titleLine1Ref} style={{ display: 'block' }}>{t('hero.titleLine1')}</div>
          <div ref={titleLine2Ref} style={{ display: 'block' }}>{t('hero.titleLine2')}</div>
        </div>

  <div ref={rotatingRef} style={{ marginTop: isMobile ? "-0.5rem" : "-1.25rem", position: "relative", height: isMobile ? 3.8 * 16 * 1.2 : 6.5 * 16 * 1.2 }}>
          {/* 1rem = 16px, so 3.8rem = 60.8px, 6.5rem = 104px */}
          {ROTATING_WORDS_TRANSLATED.map((word, i) => (
            <div
              key={i}
              style={{
                position: i === activeIndex ? "relative" : "absolute",
                opacity: i === activeIndex ? 1 : 0,
                pointerEvents: "none",
                userSelect: "none",
                transition: "opacity 1.8s ease-in-out",
                top: 0,
                left: 0,
                width: "100%",
              }}
            >
              <DrawText
                text={word}
                progress={i === activeIndex ? drawProgress : 0}
                fontSize={isMobile ? 3.8 * 16 : 6.5 * 16}
                fontWeight={600}
                strokeColor="#f54b5c"
                strokeWidth={1}
                fillColor="transparent"
                transitionSpeed={1.8}
                ease="ease-in-out"
              />
            </div>
          ))}
  </div>
      </div>

      {!isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            zIndex: 3,
          }}
        >
          {/* Sticky icon column using native CSS sticky positioning */}
          <div
            ref={socialRef}
            style={{
              position: "fixed",
              left: "1rem",
              top: "10rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "3.5rem",
              paddingLeft: ".7rem",
              zIndex: 999,
            }}
          >
            <IconButton
              icon={<img src="/icons/linkedin.svg" alt="LinkedIn" />}
              onClick={() => window.open('https://www.linkedin.com/in/quinttheissen', '_blank', 'noopener,noreferrer')}
            />
            <IconButton
              icon={<img src="/icons/github.svg" alt="GitHub" />}
              onClick={() => window.open('https://github.com/iqtheissen', '_blank', 'noopener,noreferrer')}
            />
          </div>

          <div
            style={{
              width: "1px",
              height: startAnimation ? lineHeight : "0",
              background: "linear-gradient(to bottom, white, transparent)",
              transition: "height 0.8s ease-in-out",
              pointerEvents: "none",
              // offset to account for the fixed social icons (3.5rem width + 0.7rem padding)
              marginLeft: "4.2rem",
            }}
          />
        </div>
      )}
    </section>
  );
}
