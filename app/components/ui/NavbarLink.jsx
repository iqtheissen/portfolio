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
      locoScrollRef.current.scrollTo(href, {
        offset: 0,
        duration: 1000,
        easing: [0.25, 0, 0.35, 1],
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
        display: "grid",
        placeItems: "center",
        minWidth: "7rem",
        height: "2rem",
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