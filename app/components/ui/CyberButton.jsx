import React from "react";
import { useDecryptAnimation } from "../../hooks/useDecryptAnimation";


export default function CyberButton({
  children = "Button",
  decryptedText = "Decrypted",
  tag = "",
  onClick,
  icon = null,
  disabled = false,
  textLeft = false,
}) {
  const { displayText, startAnimation, resetText } = useDecryptAnimation({
    originalText: children,
    decryptedText,
    delay: 25,
  });

  return (
    <button
      className={
        "cursor-target cyber-btn relative w-[200px] h-[60px] group overflow-visible transition-colors duration-300 will-change-[background-color] flex items-center px-4" +
        (disabled ? " opacity-50 pointer-events-none" : "")
      }
      onClick={disabled ? undefined : onClick}
      onMouseEnter={disabled ? undefined : startAnimation}
      onMouseLeave={disabled ? undefined : resetText}
      disabled={disabled}
    >
      {/* Base outline */}
      <svg
        className="absolute inset-0 z-10 pointer-events-none"
        viewBox="0 0 200 60"
        fill="none"
      >
        <path
          d="M184.793 0.5L199.5 15.207V59.5H15.207L0.5 44.793V0.5H184.793Z"
          stroke="#ffffff"
          strokeWidth="1"
          className="fill-[#000304] group-hover:fill-[#010F15] transition-colors duration-300"
        />
      </svg>

      {/* Animated outline */}
      <svg
        className="cyber-outline absolute inset-0 z-20 pointer-events-none"
        viewBox="0 0 200 60"
        fill="none"
      >
        <path
          d="M184.793 0.5L199.5 15.207V59.5H15.207L0.5 44.793V0.5H184.793Z"
          className="stroke-path"
        />
      </svg>

      {/* Hover triangles */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="absolute top-0 right-0" width="9" height="9" viewBox="0 0 20 20" fill="none">
          <path d="M0 0H20V20L0 0Z" stroke="#f54b5c" strokeWidth="2" fill="#f54b5c" />
        </svg>
        <svg className="absolute bottom-0 left-0" width="9" height="9" viewBox="0 0 20 20" fill="none">
          <path d="M20 20H0V0L20 20Z" stroke="#f54b5c" strokeWidth="2" fill="#f54b5c" />
        </svg>
      </div>

      {/* Button text: optionally left-aligned (opt-in) otherwise centered by default */}
      <span
        className={
          "relative z-40 text-white font-bold tracking-wider " +
          (textLeft ? "flex-1 text-left pl-4" : "mx-auto")
        }
      >
        {displayText}
      </span>

      {/* Optional icon positioned at the right edge, not affecting text layout */}
      {icon && (
        <span className="relative z-40 ml-auto flex-none" aria-hidden>
          {icon}
        </span>
      )}

      {/* Tag */}
      {tag && (
        <span
          className="absolute z-50 px-[6px] py-[2px] text-[9px] font-normal text-black bg-red-400
          left-[10%] bottom-[-2px] transform transition-transform duration-300 ease-in-out
          group-hover:-translate-x-[-400%]"
        >
          {tag}
        </span>
      )}
    </button>
  );
}
