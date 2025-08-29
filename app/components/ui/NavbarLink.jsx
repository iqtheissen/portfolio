"use client";

import React from "react";
import { useDecryptAnimation } from "../../hooks/useDecryptAnimation";

export default function NavbarLink({ href, originalText, decryptedText, locoScrollRef }) {
  const { displayText, startAnimation, resetText } = useDecryptAnimation({
    originalText,
    decryptedText,
    delay: 35,
  });

  const handleClick = (e) => {
    e.preventDefault();
    if (locoScrollRef?.current) {
      // Lenis expects `duration` in seconds and `easing` as a function.
      // Convert previous easing to a reasonable easeOutCubic approximation.
      const lenisDuration = 1.3; // seconds
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      locoScrollRef.current.scrollTo(href, {
        offset: 0,
        duration: lenisDuration,
        easing: easeOutCubic,
      });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={startAnimation}
      onMouseLeave={resetText}
      className="cursor-target text-white font-medium tracking-wider transition-colors duration-300 hover:text-white-400"
      style={{
        fontSize: "1.2rem",
        display: "grid",
        placeItems: "center",
        minWidth: "6rem",
        height: "1.4rem",
        overflow: "hidden",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      {displayText}
    </a>
  );
}