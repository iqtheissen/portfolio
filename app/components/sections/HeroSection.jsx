"use client";

import React, { useEffect, useState, useRef } from "react";
import CyberButton from "../ui/CyberButton";
import IconButton from "../ui/IconButton";
import DrawText from "../ui/DrawText";

const ROTATING_WORDS = ["DESIGN", "WEBSITES", "GAMES"];

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function HeroSection({ startAnimation, isMobile }) {
  const heroRef = useRef(null);

  const [lineHeight, setLineHeight] = useState("0%");
  const [dividerHeight, setDividerHeight] = useState("15%");

  // Keep track of which word is active and the drawing progress (0 to 1)
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const animateCycle = async () => {
      let index = 0;

      while (!cancelled) {
        setProgress(0); // undraw current word
        await wait(1800);

        index = (index + 1) % ROTATING_WORDS.length;
        setActiveIndex(index);

        // Draw new word
        setProgress(1);
        await wait(2300);
      }
    };

    animateCycle();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;

      setLineHeight(scrollY === 0 ? "100%" : "0%");

      let progress = (scrollY / heroHeight) * 1.5;
      progress = Math.min(Math.max(progress, 0), 1);

      const minHeightPx = window.innerHeight * 0.15;
      const maxHeightPx = window.innerHeight;
      const newHeightPx = minHeightPx + progress * (maxHeightPx - minHeightPx);

      setDividerHeight(`${newHeightPx}px`);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div style={{ fontSize: isMobile ? "0.9rem" : "1.1rem", color: "#b0b0b0", fontWeight: 300 }}>
          Hi I&apos;m
        </div>

        <div
          style={{
            fontSize: isMobile ? "1.4rem" : "2rem",
            fontWeight: 500,
            marginBottom: isMobile ? "0.3rem" : "0.8rem",
            display: "flex",
            gap: isMobile ? "0.3rem" : "0.5rem",
          }}
        >
          <span style={{ color: "white" }}>Quint</span>
          <span style={{ color: "#b0b0b0" }}>Theissen</span>
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
          CREATIVE DEVELOPER
        </div>

        <div style={{ marginTop: isMobile ? "-0.5rem" : "-1.25rem", position: "relative", height: isMobile ? 3.8 * 16 * 1.2 : 6.5 * 16 * 1.2 }}>
          {/* 1rem = 16px, so 3.8rem = 60.8px, 6.5rem = 104px */}
          {ROTATING_WORDS.map((word, i) => (
            <div
              key={word}
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
                progress={i === activeIndex ? progress : 0}
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
          <div
            data-scroll
            data-scroll-sticky
            data-scroll-target=".sticky-icon-boundary"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "3.5rem",
              paddingLeft: ".7rem",
              paddingTop: "10rem",
            }}
          >
            <IconButton icon={<img src="/icons/linkedin.svg" alt="LinkedIn" />} />
            <IconButton icon={<img src="/icons/github.svg" alt="GitHub" />} />
          </div>

          <div
            style={{
              width: "1px",
              height: startAnimation ? lineHeight : "0",
              background: "linear-gradient(to bottom, white, transparent)",
              transition: "height 0.8s ease-in-out",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </section>
  );
}
