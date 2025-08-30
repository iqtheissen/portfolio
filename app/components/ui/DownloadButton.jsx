"use client";

import CyberButton from "./CyberButton";
import React, { useState } from "react";

// Small inline download SVG sized to match CyberButton (larger size)
const DownloadIcon = (
  <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path d="M0 0h32v32H0z" fill="none" />
    <path d="M10.017 2v2H4v24h24V4h-5.97v-2h7.97v28h-28V2z" fill="#fff" />
    <path d="M16 4v16l4-4 1.414 1.414L16 24 10.586 17.414 12 16l4 4V4z" fill="#fff" />
  </svg>
);

export default function DownloadButton({ href = "/resume.pdf", text = "Download CV" }) {
  const [disabled, setDisabled] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
  setDisabled(true);
    try {
      // create a temporary link to trigger immediate download
      const a = document.createElement("a");
      a.href = href;
      // derive a filename from the href when possible
      const filename = (href && href.split("/").pop()) || "cv.pdf";
      a.setAttribute("download", filename);
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // keep button disabled briefly to avoid repeated clicks
      setTimeout(() => setDisabled(false), 1500);
    } catch (err) {
      // fallback to opening in a new tab
      window.open(href, "_blank");
      setTimeout(() => setDisabled(false), 1500);
    }
  };

  return (
    <CyberButton tag="/:dl" onClick={handleClick} decryptedText={String(text).toUpperCase()} icon={DownloadIcon} disabled={disabled}>
      {disabled ? "DOWNLOADING..." : text}
    </CyberButton>
  );
}
