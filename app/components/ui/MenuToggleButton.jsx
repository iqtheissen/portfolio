"use client";

import React, { useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useDecryptAnimation } from "../../hooks/useDecryptAnimation";

export default function MenuToggleButton({ isOpen, onClick, buttonRef, ...props }) {
  const { displayText, startAnimation, resetText } = useDecryptAnimation({
    originalText: "menu",
    decryptedText: "close",
    delay: 25,
  });

  useEffect(() => {
    if (isOpen) {
      startAnimation();
    } else {
      resetText();
    }
  }, [isOpen]);

  return (
    <button
      type="button"
      ref={buttonRef}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      {...props}
      onClick={onClick}
      className="cursor-target"
      style={{
        background: "none",
        border: "none",
        color: "white",
        fontSize: "1.25rem",
        cursor: "pointer",
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        minHeight: "44px",
      }}
    >
      {displayText}
      {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
    </button>
  );
}
