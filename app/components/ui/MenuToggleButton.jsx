"use client";

import React, { useEffect } from "react";
import { useDecryptAnimation } from "../../hooks/useDecryptAnimation";

export default function MenuToggleButton({ isOpen, onClick }) {
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
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: "white",
        fontSize: "1.25rem",
        cursor: "pointer",
        zIndex: 1001,
      }}
    >
      {displayText}
    </button>
  );
}